import {
  FOOD_PLACE_TYPE_OPTIONS,
  foodTypeEmoji,
  foodTypeLabel,
  isFoodPlaceType,
  RESTAURANTS,
} from "@/lib/data";
import type { Restaurant, RoomFilters } from "@/lib/types";

// ── Compact shapes returned by our Places API (New) proxy routes ─────────────
// The /api/places/* route handlers project Google's verbose response down to
// just these fields (see app/api/places/*/route.ts), so the payload that
// reaches the client — and gets stored in RTDB — stays small.

type NearbyPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
  reviews?: number;
  price?: number; // 1–4
  open?: boolean;
  primaryType?: string;
  types?: string[];
  addr?: string;
  photo?: string; // photo resource name: places/{id}/photos/{ref}
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

const PLACE_TYPE_TO_CUISINE: Record<string, string> = {
  ...Object.fromEntries(
    FOOD_PLACE_TYPE_OPTIONS.map((option) => [option.type, option.label]),
  ),
  african_restaurant: "แอฟริกัน",
  american_restaurant: "อเมริกัน",
  asian_restaurant: "เอเชีย",
  asian_fusion_restaurant: "เอเชียนฟิวชัน",
  breakfast_restaurant: "อาหารเช้า",
  buffet_restaurant: "บุฟเฟต์",
  chicken_restaurant: "ไก่",
  dessert_restaurant: "ของหวาน",
  dim_sum_restaurant: "ติ่มซำ",
  french_restaurant: "ฝรั่งเศส",
  hamburger_restaurant: "เบอร์เกอร์",
  indian_restaurant: "อินเดีย",
  indonesian_restaurant: "อินโดนีเซีย",
  italian_restaurant: "อิตาเลียน",
  korean_barbecue_restaurant: "ปิ้งย่างเกาหลี",
  mediterranean_restaurant: "เมดิเตอร์เรเนียน",
  mexican_restaurant: "เม็กซิกัน",
  middle_eastern_restaurant: "ตะวันออกกลาง",
  sandwich_shop: "แซนด์วิช",
  steak_house: "สเต๊ก",
  tea_house: "ชา",
  vietnamese_restaurant: "เวียดนาม",
  food: "อาหาร",
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function cuisineFromTypes(primaryType: string | undefined, types: string[]): string {
  const orderedTypes = primaryType ? [primaryType, ...types] : types;
  for (const t of orderedTypes) {
    if (PLACE_TYPE_TO_CUISINE[t]) return PLACE_TYPE_TO_CUISINE[t];
  }
  return "ร้านอาหาร";
}

function foodLabelsFromTypes(primaryType: string | undefined, types: string[]): string[] {
  const orderedTypes = primaryType ? [primaryType, ...types] : types;
  return unique(
    orderedTypes
      .filter((type) => isFoodPlaceType(type) || type === "food")
      .map((type) => (type === "food" ? "อาหาร" : foodTypeLabel(type))),
  );
}

function selectedFoodTypes(filters: RoomFilters): string[] {
  return unique(filters.cuisines.filter(isFoodPlaceType));
}

function placeMatchesFoodTypes(r: Restaurant, types: string[]): boolean {
  if (types.length === 0) return true;
  if (!r.placeId) return true;
  const placeTypes = new Set([r.primaryType, ...(r.placeTypes ?? [])].filter(Boolean));
  for (const t of types) {
    if (placeTypes.has(t)) return true;
  }
  return false;
}

const CUISINE_EMOJIS: Record<string, string> = {
  "ญี่ปุ่น": "🍣",
  "จีน": "🥟",
  "ไทย": "🍛",
  "อีสาน": "🌶️",
  "เหนือ": "🍜",
  "ใต้": "🍤",
  "อิตาเลียน": "🍕",
  "เกาหลี": "🥩",
  "ปิ้งย่าง": "🍖",
  "อาหารทะเล": "🦐",
  "คาเฟ่": "☕",
  "เบเกอรี่": "🥐",
  "ฟาสต์ฟู้ด": "🍔",
  "หม้อไฟ": "🍲",
  "ร้านเส้น": "🍜",
  "กาแฟ": "☕",
  "วีแกน": "🥬",
  "ฟู้ดคอร์ท": "🍱",
  "ราเมง": "🍥",
  "ซูชิ": "🍱",
  "พิซซ่า": "🍕",
  "ร้านอาหาร": "🍽️",
};

const GRADIENTS: [string, string][] = [
  ["#FF7A5E", "#E63946"],
  ["#FFB627", "#FF5A3C"],
  ["#FF5A3C", "#D7263D"],
  ["#FFC845", "#FF7A5E"],
  ["#FF7A5E", "#FFB627"],
  ["#E63946", "#FF4D2E"],
  ["#FFB627", "#FF5A3C"],
  ["#FF5A3C", "#FFC845"],
  ["#FFC845", "#FF4D2E"],
  ["#FF5A3C", "#FFB627"],
];

function mapPlaceToRestaurant(
  place: NearbyPlace,
  userLat: number,
  userLng: number,
  index: number,
): Restaurant {
  const types = place.types ?? [];
  const cuisine = cuisineFromTypes(place.primaryType, types);
  const tags = foodLabelsFromTypes(place.primaryType, types);
  return {
    id: place.id,
    name: place.name,
    cuisine,
    rating: place.rating ?? 4.0,
    reviews: place.reviews ?? 0,
    price: Math.max(1, Math.min(4, place.price ?? 2)),
    dist: haversineKm(userLat, userLng, place.lat, place.lng),
    open: place.open ?? true,
    hours: "ดูใน Google Maps",
    addr: place.addr ?? "",
    phone: "",
    tags: tags.length ? tags.slice(0, 3) : [cuisine],
    emoji: CUISINE_EMOJIS[cuisine] ?? foodTypeEmoji(place.primaryType ?? "") ?? "🍽️",
    g: GRADIENTS[index % GRADIENTS.length],
    placeId: place.id,
    primaryType: place.primaryType,
    placeTypes: types,
    lat: place.lat,
    lng: place.lng,
    photoName: place.photo,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const restaurantService = {
  async getNearby(filters: RoomFilters): Promise<Restaurant[]> {
    const radiusMeters = Math.round(filters.radiusKm * 1000);
    const types = selectedFoodTypes(filters);

    // Nearby Search (New) has no "open now" filter, so we don't pass one — the
    // openNow field comes back per-place and we filter on it client-side below.
    const params = new URLSearchParams({
      lat: String(filters.lat),
      lng: String(filters.lng),
      radius: String(radiusMeters),
    });
    if (types.length > 0) params.set("types", types.join(","));

    let results: Restaurant[] = [];

    try {
      const res = await fetch(`/api/places/nearby?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Places API: ${data.status} — ${data.error_message ?? ""}`);
      }

      const places: NearbyPlace[] = data.results ?? [];
      results = places.map((p, i) =>
        mapPlaceToRestaurant(p, filters.lat, filters.lng, i),
      );
    } catch (err) {
      console.warn("[restaurantService] Places API failed, using mock data:", err);
      // Development fallback: filter mock RESTAURANTS by the supplied criteria
      const selectedLabels = types.map(foodTypeLabel);
      results = RESTAURANTS.filter((r) => {
        if (filters.openNow && !r.open) return false;
        if (r.price < filters.priceMin || r.price > filters.priceMax) return false;
        if (
          types.length > 0 &&
          !types.includes("restaurant") &&
          !selectedLabels.includes(r.cuisine) &&
          !r.tags.some((t) => selectedLabels.includes(t))
        )
          return false;
        return r.dist <= filters.radiusKm;
      });
    }

    // Apply open-now, price and cuisine filters to the results (the New Nearby
    // Search can't pre-filter these, and the mock fallback already matches).
    return results.filter((r) => {
      if (filters.openNow && !r.open) return false;
      if (r.price < filters.priceMin || r.price > filters.priceMax) return false;
      if (!placeMatchesFoodTypes(r, types)) return false;
      return true;
    });
  },

  async getById(id: string): Promise<Restaurant | null> {
    // Mock data lookup (for development / offline fallback)
    return RESTAURANTS.find((r) => r.id === id) ?? null;
  },

  /**
   * Fetch the extra fields the deck didn't carry (phone, website, full address,
   * opening hours) for the after-match card — Place Details (New), proxied and
   * cached by /api/places/details. Returns a partial Restaurant to merge over
   * the deck snapshot; resolves to {} on any failure so the UI degrades softly.
   */
  async getDetails(placeId: string): Promise<Partial<Restaurant>> {
    try {
      const res = await fetch(`/api/places/details?id=${encodeURIComponent(placeId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const d = await res.json();
      if (d.status && d.status !== "OK") {
        throw new Error(`Place Details: ${d.status} — ${d.error_message ?? ""}`);
      }

      const out: Partial<Restaurant> = {};
      if (typeof d.phone === "string" && d.phone) out.phone = d.phone;
      if (typeof d.website === "string" && d.website) out.website = d.website;
      if (typeof d.addr === "string" && d.addr) out.addr = d.addr;
      if (typeof d.hours === "string" && d.hours) out.hours = d.hours;
      if (typeof d.open === "boolean") out.open = d.open;
      return out;
    } catch (err) {
      console.warn("[restaurantService] Place Details failed:", err);
      return {};
    }
  },

  /**
   * Build the shared deck for a room (wiki §2.3): real restaurants from one
   * Nearby Search, shuffled, trimmed to `size`. Generated once on the host and
   * stored immutably in RTDB, so a plain shuffle is enough — every voter reads
   * the same stored order.
   *
   * When the area is sparse the radius is widened, then the cuisine preference
   * is relaxed (see below). Mock data is a **last resort only** — used solely
   * when the Places API returned no real results at all — so a real deck is
   * never diluted with mock restaurants (wiki §2.7 #9).
   */
  async buildDeck(filters: RoomFilters, size = 20): Promise<Restaurant[]> {
    const minDeck = Math.min(8, size);

    // Pull real nearby restaurants, widening the radius if the area is sparse.
    let radiusKm = filters.radiusKm;
    let results = await this.getNearby(filters);
    for (let tries = 0; results.length < minDeck && tries < 2; tries++) {
      radiusKm *= 2;
      results = await this.getNearby({ ...filters, radiusKm });
    }

    // If the chosen Google place types are too narrow for this area, relax just
    // the type preference — keeping radius / price / open-now — to recover real
    // food places from the proxy's default Food and Drink search.
    if (results.length < minDeck && filters.cuisines.length > 0) {
      const relaxed = await this.getNearby({ ...filters, radiusKm, cuisines: [] });
      if (relaxed.length > results.length) results = relaxed;
    }

    // Mock data only when the Places API yielded nothing real (offline / remote
    // area), so the room is never unplayable. We never blend mock into a real
    // deck.
   

    return shuffle(results).slice(0, size);
  },
};

// Fisher–Yates shuffle (non-mutating).
function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
