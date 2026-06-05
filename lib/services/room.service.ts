// Live game state on Firebase Realtime Database (wiki §3.2–§3.4).
//
// The whole room tree lives under rooms/{code}. Reads happen through a single
// onValue subscription that assembles a GameState; writes are small, targeted,
// and idempotent. Results are calculated after every locked-in voter reaches
// the end of the shared deck, with transactions guarding result/final-winner
// persistence so multiple clients can safely observe the same completion.

import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  update,
} from "firebase/database";
import { firebaseRtdb } from "@/lib/firebase";
import { restaurantService } from "@/lib/services/restaurant.service";
import type {
  GameState,
  FinalVoteRound,
  Player,
  RankedResult,
  Restaurant,
  Room,
  RoomFilters,
  RoomStatus,
} from "@/lib/types";

// ── constants ─────────────────────────────────────────────────────────────────

const ROOM_TTL_MS = 12 * 60 * 60 * 1000; // wiki §2.7 #8 — rooms expire & recycle codes
const DECK_SIZE = 20; // wiki §2.3 — ~20 cards per deck
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // base32, no confusing chars (§3.8)
const CODE_LEN = 4;
const MAX_CODE_TRIES = 12;

// ── raw RTDB shapes ─────────────────────────────────────────────────────────

type RawParticipant = {
  name: string;
  emoji: string;
  host?: boolean;
  joinedAt?: number;
  ready?: boolean;
  connected?: boolean;
};

type RawMeta = {
  status: RoomStatus;
  hostId: string;
  createdAt?: number;
  expiresAt?: number;
  voterCount?: number;
  deckSize?: number;
  filters: RoomFilters;
  roster?: Record<string, boolean>;
};

type RawRoom = {
  meta: RawMeta;
  participants?: Record<string, RawParticipant>;
  deck?: Restaurant[];
  likes?: Record<string, Record<string, number>>;
  dislikes?: Record<string, Record<string, number>>;
  progress?: Record<string, number>;
  results?: {
    computedAt?: number;
    noMatch?: boolean;
    ranking?: RawRankedResult[];
  } | null;
  finalVote?: RawFinalVote | null;
  match?: { restaurantId: string; at?: number; likers?: Record<string, boolean> } | null;
};

type RawRankedResult = {
  restaurantId: string;
  rank: number;
  deckIndex: number;
  likes: number;
  voterCount: number;
  likePct: number;
};

type RawFinalVote = {
  round?: number;
  options?: Record<string, boolean>;
  votes?: Record<string, string>;
  createdAt?: number;
  resolved?: { winnerId?: string; at?: number };
};

// ── helpers ───────────────────────────────────────────────────────────────────

function generateCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

/** RTDB rejects `undefined`; round-tripping through JSON drops undefined keys. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function boolMap(uids: string[]): Record<string, boolean> {
  return uids.reduce<Record<string, boolean>>((acc, uid) => {
    acc[uid] = true;
    return acc;
  }, {});
}

function votersFromState(state: GameState): string[] {
  return state.roster.length ? state.roster : state.room.players.map((p) => p.id);
}

function voteRecordToArrays(
  votes: Record<string, Record<string, number>> | undefined,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [restaurantId, voters] of Object.entries(votes ?? {})) {
    out[restaurantId] = Object.keys(voters ?? {});
  }
  return out;
}

function rankDeck(
  deck: Restaurant[],
  likes: Record<string, string[]>,
  voters: string[],
): RankedResult[] {
  const voterCount = voters.length;
  return deck
    .map<RankedResult>((r, deckIndex) => {
      const likedBy = likes[r.id]?.filter((uid) => voters.includes(uid)) ?? [];
      const likePct = voterCount ? Math.round((likedBy.length / voterCount) * 100) : 0;
      return {
        restaurantId: r.id,
        rank: deckIndex + 1,
        deckIndex,
        likes: likedBy.length,
        voterCount,
        likePct,
      };
    })
    .sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      if (b.likePct !== a.likePct) return b.likePct - a.likePct;
      return a.deckIndex - b.deckIndex;
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function topTieIds(ranking: RankedResult[]): string[] {
  const top = ranking[0];
  if (!top || top.likes === 0) return [];
  return ranking
    .filter((row) => row.likes === top.likes && row.likePct === top.likePct)
    .map((row) => row.restaurantId);
}

function allVotersFinished(state: GameState): boolean {
  const voters = votersFromState(state);
  return (
    state.room.deckSize > 0 &&
    voters.length > 0 &&
    voters.every((uid) => (state.progress[uid] ?? 0) >= state.room.deckSize)
  );
}

function allFinalVotesIn(state: GameState): boolean {
  if (!state.finalVote) return false;
  const options = new Set(state.finalVote.options);
  const voters = votersFromState(state);
  return (
    voters.length > 0 &&
    voters.every((uid) => {
      const vote = state.finalVote?.votes[uid];
      return typeof vote === "string" && options.has(vote);
    })
  );
}

function finalVoteWinners(
  finalVote: FinalVoteRound,
  voters: string[],
): string[] {
  const optionSet = new Set(finalVote.options);
  const counts = new Map(finalVote.options.map((id) => [id, 0]));
  for (const uid of voters) {
    const vote = finalVote.votes[uid];
    if (optionSet.has(vote)) counts.set(vote, (counts.get(vote) ?? 0) + 1);
  }
  const max = Math.max(...counts.values());
  return finalVote.options.filter((id) => (counts.get(id) ?? 0) === max);
}

function db() {
  return firebaseRtdb();
}

// ── state assembly ────────────────────────────────────────────────────────────

function toGameState(code: string, raw: RawRoom, myUid: string): GameState {
  const meta = raw.meta;
  const participants = raw.participants ?? {};

  const players: Player[] = Object.entries(participants)
    .map(([id, p]) => ({
      id,
      name: p.name,
      emoji: p.emoji,
      host: id === meta.hostId,
      me: id === myUid,
      ready: p.ready ?? false,
      connected: p.connected ?? false,
    }))
    .sort((a, b) => {
      const ja = asNumber(participants[a.id]?.joinedAt, 0);
      const jb = asNumber(participants[b.id]?.joinedAt, 0);
      return ja - jb;
    });

  const likes = voteRecordToArrays(raw.likes);
  const dislikes = voteRecordToArrays(raw.dislikes);

  const room: Room = {
    id: code,
    code,
    hostId: meta.hostId,
    players,
    filters: meta.filters,
    status: meta.status,
    createdAt: asNumber(meta.createdAt, Date.now()),
    expiresAt: asNumber(meta.expiresAt, Date.now() + ROOM_TTL_MS),
    voterCount: asNumber(meta.voterCount, 0),
    deckSize: asNumber(meta.deckSize, raw.deck?.length ?? 0),
  };

  return {
    room,
    deck: raw.deck ?? [],
    likes,
    dislikes,
    progress: raw.progress ?? {},
    results: raw.results?.ranking ?? [],
    finalVote: raw.finalVote
      ? {
          round: asNumber(raw.finalVote.round, 1),
          options: Object.keys(raw.finalVote.options ?? {}),
          votes: raw.finalVote.votes ?? {},
          createdAt: asNumber(raw.finalVote.createdAt, Date.now()),
        }
      : null,
    match: raw.match
      ? {
          restaurantId: raw.match.restaurantId,
          likers: Object.keys(raw.match.likers ?? {}),
          at: asNumber(raw.match.at, Date.now()),
        }
      : null,
    roster: Object.keys(meta.roster ?? {}),
  };
}

// ── service ─────────────────────────────────────────────────────────────────

export const roomService = {
  /** Create a room in the `lobby` state. Returns the unique 4-char code. */
  async create(hostPlayer: Player, filters: RoomFilters): Promise<string> {
    // Find a code not currently in use among active rooms. We probe meta/status
    // (the one publicly-readable node — see database.rules.json) rather than the
    // whole meta, so the existence check works before we're a room member.
    let code = generateCode();
    for (let i = 0; i < MAX_CODE_TRIES; i++) {
      const exists = await get(ref(db(), `rooms/${code}/meta/status`));
      if (!exists.exists()) break;
      code = generateCode();
    }

    const now = Date.now();
    await update(ref(db(), `rooms/${code}`), {
      meta: clean({
        status: "lobby" as RoomStatus,
        hostId: hostPlayer.id,
        createdAt: serverTimestamp(),
        expiresAt: now + ROOM_TTL_MS,
        voterCount: 0,
        deckSize: 0,
        filters,
      }),
      [`participants/${hostPlayer.id}`]: clean({
        name: hostPlayer.name,
        emoji: hostPlayer.emoji,
        host: true,
        joinedAt: serverTimestamp(),
        ready: false,
        connected: true,
      }),
    });

    return code;
  },

  /**
   * Join a room by code. Rejects unknown rooms and any round that has already
   * started (late-join, wiki §2.7 #3). Returns the normalized code.
   */
  async join(
    code: string,
    player: Pick<Player, "name" | "emoji">,
    userId: string,
  ): Promise<string> {
    const normalized = code.toUpperCase();
    // Read only meta/status — the single node a non-member is allowed to read
    // (database.rules.json) — to confirm the room exists and is still joinable.
    const statusSnap = await get(ref(db(), `rooms/${normalized}/meta/status`));
    if (!statusSnap.exists()) {
      throw new Error(`ไม่พบห้องรหัส "${normalized}" หรือโค้ดหมดอายุ`);
    }

    if ((statusSnap.val() as RoomStatus) !== "lobby") {
      throw new Error("รอบนี้เริ่มไปแล้ว — เริ่มรอบใหม่ได้เลย");
    }

    await update(ref(db(), `rooms/${normalized}/participants/${userId}`), {
      name: player.name,
      emoji: player.emoji,
      host: false,
      joinedAt: serverTimestamp(),
      ready: false,
      connected: true,
    });

    return normalized;
  },

  /**
   * Wire up presence (wiki §3.7): flag the participant connected, and register
   * an onDisconnect that flips it to false the moment the socket drops. The
   * returned cleanup marks the participant offline on a deliberate leave.
   */
  setupPresence(code: string, uid: string): () => void {
    const connRef = ref(db(), `rooms/${code}/participants/${uid}/connected`);
    void update(ref(db(), `rooms/${code}/participants/${uid}`), { connected: true });
    void onDisconnect(connRef).set(false);
    // On cleanup only cancel the handler — never re-write the node, or we'd
    // resurrect a participant that leave() just removed. An ungraceful close is
    // still covered: onDisconnect flips connected → false server-side, and the
    // player's earlier likes keep counting (wiki §2.7 #1).
    return () => {
      void onDisconnect(connRef).cancel();
    };
  },

  async setReady(code: string, uid: string, ready: boolean): Promise<void> {
    await update(ref(db(), `rooms/${code}/participants/${uid}`), { ready });
  },

  /**
   * Host starts the round (wiki §2.3): lock the roster from everyone currently
   * present, build the shared immutable deck once, and flip lobby → active.
   */
  async startGame(code: string, filters: RoomFilters): Promise<void> {
    const snap = await get(ref(db(), `rooms/${code}`));
    if (!snap.exists()) throw new Error("ไม่พบห้อง");
    const raw = snap.val() as RawRoom;
    if (raw.meta.status !== "lobby") return; // already started

    const roster = Object.keys(raw.participants ?? {});
    const deck = await restaurantService.buildDeck(filters, DECK_SIZE);

    await update(ref(db(), `rooms/${code}`), {
      "meta/status": "active" as RoomStatus,
      "meta/roster": boolMap(roster),
      "meta/voterCount": roster.length,
      "meta/deckSize": deck.length,
      deck: clean(deck),
      likes: null,
      dislikes: null,
      progress: null,
      results: null,
      finalVote: null,
      match: null,
    });
  },

  /** Record one swipe decision and cursor atomically, so final ranking never races. */
  async submitDecision(
    code: string,
    uid: string,
    restaurantId: string,
    liked: boolean,
    cursor: number,
  ): Promise<void> {
    const decisionPath = liked ? "likes" : "dislikes";
    await update(ref(db(), `rooms/${code}`), {
      [`${decisionPath}/${restaurantId}/${uid}`]: serverTimestamp(),
      [`progress/${uid}`]: cursor,
    });
  },

  /** Persist the single final winner. Safe for many clients to attempt. */
  async declareWinner(
    code: string,
    restaurantId: string,
    likers: string[],
  ): Promise<boolean> {
    const matchRef = ref(db(), `rooms/${code}/match`);
    const result = await runTransaction(matchRef, (current) => {
      if (current) return; // already declared
      return { restaurantId, at: serverTimestamp(), likers: boolMap(likers) };
    });

    if (result.committed) {
      await update(ref(db(), `rooms/${code}/meta`), { status: "matched" as RoomStatus });
      return true;
    }
    return false;
  },

  /**
   * Compute collect-all ranking after every voter finishes the deck. A
   * transaction on `results` makes the calculation first-writer-wins without
   * ending the round before completion.
   */
  async completeDeckResults(code: string, state: GameState): Promise<void> {
    if (!allVotersFinished(state) || state.results.length > 0 || state.match) return;

    const voters = votersFromState(state);
    const ranking = rankDeck(state.deck, state.likes, voters);
    const noMatch = ranking.every((row) => row.likes === 0);

    const result = await runTransaction(ref(db(), `rooms/${code}/results`), (current) => {
      if (current) return;
      return clean({
        computedAt: Date.now(),
        noMatch,
        ranking,
      });
    });

    if (!result.committed) return;

    if (noMatch) {
      await update(ref(db(), `rooms/${code}/meta`), {
        status: "no_match" as RoomStatus,
      });
      return;
    }

    const topIds = topTieIds(ranking);
    if (topIds.length === 1) {
      await this.declareWinner(code, topIds[0], state.likes[topIds[0]] ?? []);
      return;
    }

    await update(ref(db(), `rooms/${code}`), {
      "meta/status": "final_vote" as RoomStatus,
      finalVote: clean({
        round: 1,
        options: boolMap(topIds),
        votes: null,
        createdAt: Date.now(),
      }),
    });
  },

  /** One vote per player per tie-break round. The latest selection replaces theirs. */
  async submitFinalVote(code: string, uid: string, restaurantId: string): Promise<void> {
    await update(ref(db(), `rooms/${code}/finalVote/votes`), {
      [uid]: restaurantId,
    });
  },

  /** Resolve a complete final-vote round, repeating with tied options if needed. */
  async resolveFinalVote(code: string, state: GameState): Promise<void> {
    if (!state.finalVote || !allFinalVotesIn(state) || state.match) return;

    const voters = votersFromState(state);
    const winners = finalVoteWinners(state.finalVote, voters);

    const result = await runTransaction(ref(db(), `rooms/${code}/finalVote`), (current) => {
      if (!current || current.round !== state.finalVote?.round) return;
      const votes = (current.votes ?? {}) as Record<string, string>;
      const currentRound: FinalVoteRound = {
        round: asNumber(current.round, 1),
        options: Object.keys(current.options ?? {}),
        votes,
        createdAt: asNumber(current.createdAt, Date.now()),
      };
      if (!voters.every((uid) => currentRound.options.includes(votes[uid]))) return;

      const roundWinners = finalVoteWinners(currentRound, voters);
      if (roundWinners.length === 1) {
        return {
          ...current,
          resolved: { winnerId: roundWinners[0], at: Date.now() },
        };
      }

      return {
        round: currentRound.round + 1,
        options: boolMap(roundWinners),
        votes: null,
        createdAt: Date.now(),
      };
    });

    if (!result.committed || winners.length !== 1) return;
    await this.declareWinner(code, winners[0], state.likes[winners[0]] ?? []);
  },

  /**
   * Start a fresh deck for the same locked roster (wiki §2.6 — "หาร้านอื่นต่อ" /
   * "เริ่มรอบใหม่"). Clears likes, progress and the previous match.
   */
  async restartRound(code: string, filters: RoomFilters): Promise<void> {
    const deck = await restaurantService.buildDeck(filters, DECK_SIZE);
    await update(ref(db(), `rooms/${code}`), {
      "meta/status": "active" as RoomStatus,
      "meta/filters": clean(filters),
      "meta/deckSize": deck.length,
      deck: clean(deck),
      likes: null,
      dislikes: null,
      progress: null,
      results: null,
      finalVote: null,
      match: null,
    });
  },

  /**
   * Leave the room. Reads the room *first* — the member-only read rule
   * (database.rules.json) means we must still be a member to see it — then
   * removes our own participant and, if we were the host, migrates the crown to
   * the earliest joiner via `meta/hostId` in one atomic update (wiki §2.7 #5).
   * The displayed host is derived from `meta.hostId`, so migration never writes
   * another member's node. When the last member (always the host) leaves, the
   * whole room is deleted so its code recycles (wiki §2.7 #8).
   */
  async leave(code: string, uid: string): Promise<void> {
    const snap = await get(ref(db(), `rooms/${code}`));
    if (!snap.exists()) return;
    const raw = snap.val() as RawRoom;
    const participants = raw.participants ?? {};
    const remainingIds = Object.keys(participants).filter((id) => id !== uid);

    // Last one out — tear the room down (the last leaver is always the host).
    if (remainingIds.length === 0) {
      await remove(ref(db(), `rooms/${code}`));
      return;
    }

    const updates: Record<string, unknown> = { [`participants/${uid}`]: null };
    if (raw.meta.hostId === uid) {
      updates["meta/hostId"] = remainingIds.sort(
        (a, b) =>
          asNumber(participants[a]?.joinedAt, 0) -
          asNumber(participants[b]?.joinedAt, 0),
      )[0];
    }
    await update(ref(db(), `rooms/${code}`), updates);
  },

  /**
   * Subscribe to the full live room. Any client that observes a completed deck
   * or tie-break round may attempt the next state transition; RTDB transactions
   * keep those transitions single-writer. Passes null if the room disappears.
   */
  subscribeToRoom(
    code: string,
    myUid: string,
    callback: (state: GameState | null) => void,
  ): () => void {
    let advancing = false;

    return onValue(ref(db(), `rooms/${code}`), (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }

      const state = toGameState(code, snap.val() as RawRoom, myUid);
      callback(state);

      if (advancing) return;

      if (state.room.status === "active" && allVotersFinished(state)) {
        advancing = true;
        roomService
          .completeDeckResults(code, state)
          .catch((err) => console.error("[roomService] completeDeckResults failed", err))
          .finally(() => {
            advancing = false;
          });
      } else if (state.room.status === "final_vote" && allFinalVotesIn(state)) {
        advancing = true;
        roomService
          .resolveFinalVote(code, state)
          .catch((err) => console.error("[roomService] resolveFinalVote failed", err))
          .finally(() => {
            advancing = false;
          });
      }
    });
  },
};
