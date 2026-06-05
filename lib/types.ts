// Shared domain types for the Restaurant Match app.

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
