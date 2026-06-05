// Live game state on Firebase Realtime Database (wiki §3.2–§3.4).
//
// The whole room tree lives under rooms/{code}. Reads happen through a single
// onValue subscription that assembles a GameState; writes are small, targeted,
// and idempotent. Match declaration goes through an RTDB transaction so only one
// client can ever win the round (first-writer-wins, wiki §2.7 #12 / §3.4).

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
  Player,
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
  progress?: Record<string, number>;
  match?: { restaurantId: string; at?: number; likers?: Record<string, boolean> } | null;
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

  const likes: Record<string, string[]> = {};
  for (const [restaurantId, voters] of Object.entries(raw.likes ?? {})) {
    likes[restaurantId] = Object.keys(voters ?? {});
  }

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
    progress: raw.progress ?? {},
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

/**
 * The unanimous-match test (wiki §2.5): a restaurant matches when every voter
 * who is still *connected* has liked it. Threshold = connected voters, so a
 * drop-out lowers the bar and the remaining likes can complete instantly.
 * Returns the first matching restaurant id in deck order, or null.
 */
function findUnanimous(state: GameState): string | null {
  const connectedVoters = state.roster.filter(
    (uid) => state.room.players.find((p) => p.id === uid)?.connected,
  );
  if (connectedVoters.length === 0) return null;

  const order = state.deck.length
    ? state.deck.map((r) => r.id)
    : Object.keys(state.likes);

  for (const restaurantId of order) {
    const likers = state.likes[restaurantId];
    if (!likers || likers.length < connectedVoters.length) continue;
    if (connectedVoters.every((uid) => likers.includes(uid))) return restaurantId;
  }
  return null;
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
      progress: null,
      match: null,
    });
  },

  /** Record a like (idempotent, wiki §2.7 #11). Pass is not stored. */
  async submitLike(code: string, uid: string, restaurantId: string): Promise<void> {
    await update(ref(db(), `rooms/${code}/likes/${restaurantId}`), {
      [uid]: serverTimestamp(),
    });
  },

  /** Persist how far this player has swiped, for resume (wiki §2.7 #2). */
  async setProgress(code: string, uid: string, cursor: number): Promise<void> {
    await update(ref(db(), `rooms/${code}/progress`), { [uid]: cursor });
  },

  /**
   * Declare a match through a transaction so exactly one client wins
   * (wiki §3.4). On winning, flip status → matched.
   */
  async declareMatch(
    code: string,
    restaurantId: string,
    likers: string[],
  ): Promise<boolean> {
    const matchRef = ref(db(), `rooms/${code}/match`);
    const result = await runTransaction(matchRef, (current) => {
      if (current) return; // already declared — abort
      return { restaurantId, at: serverTimestamp(), likers: boolMap(likers) };
    });

    if (result.committed) {
      await update(ref(db(), `rooms/${code}/meta`), { status: "matched" as RoomStatus });
      return true;
    }
    return false;
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
      progress: null,
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
   * Subscribe to the full live room. Assembles a GameState on every change and,
   * while active, runs client-side match detection: any client that sees a
   * unanimous like attempts to declare the match (so a crashed last-swiper can't
   * stall the round, wiki §3.4). Passes null if the room disappears.
   */
  subscribeToRoom(
    code: string,
    myUid: string,
    callback: (state: GameState | null) => void,
  ): () => void {
    let declaring = false;

    return onValue(ref(db(), `rooms/${code}`), (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }

      const state = toGameState(code, snap.val() as RawRoom, myUid);
      callback(state);

      if (state.room.status === "active" && !state.match && !declaring) {
        const restaurantId = findUnanimous(state);
        if (restaurantId) {
          declaring = true;
          roomService
            .declareMatch(code, restaurantId, state.likes[restaurantId] ?? [])
            .catch((err) => console.error("[roomService] declareMatch failed", err))
            .finally(() => {
              declaring = false;
            });
        }
      }
    });
  },
};
