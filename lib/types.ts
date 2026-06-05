// Shared domain types for the Restaurant Match app.

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
  radiusKm: number;
  priceMin: number;
  priceMax: number;
  cuisines: string[];
  openNow: boolean;
};

export type Room = {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  filters: RoomFilters;
  status: "waiting" | "swiping" | "matched" | "no_match";
  createdAt: number;
};

export type MatchResult = {
  restaurant: Restaurant;
  likedBy: string[];
};

// ── Domain ──────────────────────────────────────────────────────────────────

export type Restaurant = {
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
};

export type Player = {
  id: string;
  name: string;
  emoji: string;
  host: boolean;
  /** true for the current user */
  me: boolean;
  ready: boolean;
};

/** A restaurant ranked by how many players liked it (No-Match screen). */
export type RankedLike = {
  r: Restaurant;
  likes: number;
};
