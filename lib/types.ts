// Shared domain types for the Restaurant Match app.
//
// The live game runs on Firebase Realtime Database (RTDB) — see
// .claude/wiki.md §3.2/§3.3. The RTDB tree under rooms/{code} is:
//
//   meta/         status, hostId, createdAt, expiresAt, voterCount, deckSize, filters, roster
//   participants/{uid}   name, emoji, host, joinedAt, ready, connected
//   deck/{index}         immutable Restaurant snapshot, set once on start
//   likes/{restaurantId}/{uid}   ts        (like only; pass is not stored)
//   progress/{uid}       cursor index
//   results/             computed ranking after every roster voter finishes
//   finalVote/           tie-break options + one vote per voter per round
//   match/               final winner, set once after ranking/tie-breaks
//
// The types below are the *domain* shapes the UI consumes; room.service maps
// the raw RTDB tree to/from them.

// ── Auth ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  anonymous: boolean;
  displayName?: string;
  photoURL?: string;
};

// ── Generic async state ──────────────────────────────────────────────────────

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

// ── Room / Matching ─────────────────────────────────────────────────────────

export type RoomFilters = {
  lat: number;
  lng: number;
  /** human-readable place label (manual pin / geocoding) */
  label?: string;
  radiusKm: number;
  priceMin: number;
  priceMax: number;
  /** Google Places Food and Drink place type ids used with includedTypes */
  cuisines: string[];
  openNow: boolean;
};

/** Room lifecycle — lobby → active → final_vote/no_match/matched → ended. */
export type RoomStatus =
  | "lobby"
  | "active"
  | "final_vote"
  | "no_match"
  | "matched"
  | "ended";

export type Room = {
  /** RTDB key — identical to `code`. */
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  filters: RoomFilters;
  status: RoomStatus;
  createdAt: number;
  /** room TTL — when the room becomes eligible for cleanup (wiki §2.7 #8). */
  expiresAt: number;
  /** size of the locked roster at game start; 0 while in lobby. */
  voterCount: number;
  /** number of cards in the shared deck; 0 while in lobby. */
  deckSize: number;
};

export type Player = {
  id: string;
  name: string;
  emoji: string;
  host: boolean;
  /** true for the current user (derived from auth uid) */
  me: boolean;
  ready: boolean;
  /** RTDB presence flag, flipped to false via onDisconnect (wiki §3.7) */
  connected: boolean;
};

/** A declared match — set once, first-writer-wins via transaction (wiki §3.4). */
export type MatchResult = {
  /** the winning Restaurant's id (== Google place_id when from Places API) */
  restaurantId: string;
  /** users who liked the winner during the deck round */
  likers: string[];
  at: number;
};

export type RankedResult = {
  restaurantId: string;
  rank: number;
  deckIndex: number;
  likes: number;
  voterCount: number;
  likePct: number;
};

export type FinalVoteRound = {
  round: number;
  options: string[];
  votes: Record<string, string>;
  createdAt: number;
};

/**
 * Full live snapshot of a room, assembled from the RTDB tree. This is what the
 * app subscribes to and routes screens from.
 */
export type GameState = {
  room: Room;
  /** shared, immutable deck — every voter sees the same cards in the same order */
  deck: Restaurant[];
  /** restaurantId → uids that liked it */
  likes: Record<string, string[]>;
  /** restaurantId → uids that passed it */
  dislikes: Record<string, string[]>;
  /** uid → how many cards that player has swiped (resume cursor) */
  progress: Record<string, number>;
  /** ranked collect-all results after everyone finishes the deck */
  results: RankedResult[];
  /** active tie-break round, if the top result is tied */
  finalVote: FinalVoteRound | null;
  /** the declared match, or null while still swiping */
  match: MatchResult | null;
  /** uids locked into the round at start (the voters) */
  roster: string[];
};

// ── Domain ──────────────────────────────────────────────────────────────────

export type Restaurant = {
  /** stable like key — equals the Google place_id when data comes from Places */
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  /** price tier 1–4, rendered as ฿ … ฿฿฿฿ */
  price: number;
  /** distance from the user, in km */
  dist: number;
  open: boolean;
  hours: string;
  addr: string;
  phone: string;
  tags: string[];
  emoji: string;
  /** [from, to] gradient stops for the placeholder photo */
  g: [string, string];
  /** Google Places place_id — present when data comes from Places API */
  placeId?: string;
  /** Google Places API (New) primary type, when returned. */
  primaryType?: string;
  /** Google Places API (New) type ids, when returned. */
  placeTypes?: string[];
  /** Coordinates — present when data comes from Places API */
  lat?: number;
  lng?: number;
  /**
   * Places API (New) photo resource name (`places/{id}/photos/{ref}`). Resolved
   * to an image lazily through /api/places/photo; the gradient is the fallback.
   */
  photoName?: string;
  /** Website URL — populated by Place Details (New) on the after-match card. */
  website?: string;
};

/** A restaurant ranked by how many players liked it (No-Match screen). */
export type RankedLike = {
  r: Restaurant;
  likes: number;
};
