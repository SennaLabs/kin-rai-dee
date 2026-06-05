import { RESTAURANTS } from "@/lib/data";
import type { Restaurant, RoomFilters } from "@/lib/types";

// ── Places API response shape (legacy Nearby Search) ────────────────────────

type PlaceResult = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  geometry: { location: { lat: number; lng: number } };
  opening_hours?: { open_now: boolean };
  vicinity?: string;
  types?: string[];
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
  japanese_restaurant: "ญี่ปุ่น",
  chinese_restaurant: "จีน",
  thai_restaurant: "ไทย",
  italian_restaurant: "อิตาเลียน",
  korean_restaurant: "เกาหลี",
  barbecue_restaurant: "ปิ้งย่าง",
  seafood_restaurant: "อาหารทะเล",
  american_restaurant: "อเมริกัน",
  indian_restaurant: "อินเดีย",
  pizza_restaurant: "พิซซ่า",
  ramen_restaurant: "ราเมง",
  sushi_restaurant: "ซูชิ",
  cafe: "คาเฟ่",
  bakery: "เบเกอรี่",
  fast_food_restaurant: "ฟาสต์ฟู้ด",
  meal_takeaway: "ซื้อกลับบ้าน",
};

function cuisineFromTypes(types: string[]): string {
  for (const t of types) {
    if (PLACE_TYPE_TO_CUISINE[t]) return PLACE_TYPE_TO_CUISINE[t];
  }
  return "ร้านอาหาร";
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
  place: PlaceResult,
  userLat: number,
  userLng: number,
  index: number,
): Restaurant {
  const cuisine = cuisineFromTypes(place.types ?? []);
  const placeLat = place.geometry.location.lat;
  const placeLng = place.geometry.location.lng;
  return {
    id: place.place_id,
    name: place.name,
    cuisine,
    rating: place.rating ?? 4.0,
    reviews: place.user_ratings_total ?? 0,
    price: Math.max(1, Math.min(4, place.price_level ?? 2)),
    dist: haversineKm(userLat, userLng, placeLat, placeLng),
    open: place.opening_hours?.open_now ?? true,
    hours: "ดูใน Google Maps",
    addr: place.vicinity ?? "",
    phone: "",
    tags: [cuisine],
    emoji: CUISINE_EMOJIS[cuisine] ?? "🍽️",
    g: GRADIENTS[index % GRADIENTS.length],
    placeId: place.place_id,
    lat: placeLat,
    lng: placeLng,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const restaurantService = {
  async getNearby(filters: RoomFilters): Promise<Restaurant[]> {
    const radiusMeters = Math.round(filters.radiusKm * 1000);

    const params = new URLSearchParams({
      lat: String(filters.lat),
      lng: String(filters.lng),
      radius: String(radiusMeters),
      ...(filters.openNow ? { openNow: "true" } : {}),
    });

    let results: Restaurant[] = [];

    try {
      const res = await fetch(`/api/places/nearby?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Places API: ${data.status} — ${data.error_message ?? ""}`);
      }

      const places: PlaceResult[] = data.results ?? [];
      results = places.map((p, i) =>
        mapPlaceToRestaurant(p, filters.lat, filters.lng, i),
      );
    } catch (err) {
      console.warn("[restaurantService] Places API failed, using mock data:", err);
      // Development fallback: filter mock RESTAURANTS by the supplied criteria
      results = RESTAURANTS.filter((r) => {
        if (filters.openNow && !r.open) return false;
        if (r.price < filters.priceMin || r.price > filters.priceMax) return false;
        if (
          filters.cuisines.length > 0 &&
          !filters.cuisines.includes(r.cuisine) &&
          !r.tags.some((t) => filters.cuisines.includes(t))
        )
          return false;
        return r.dist <= filters.radiusKm;
      });
    }

    // Apply price and cuisine filters to Places API results as well
    return results.filter((r) => {
      if (r.price < filters.priceMin || r.price > filters.priceMax) return false;
      if (
        filters.cuisines.length > 0 &&
        !filters.cuisines.includes(r.cuisine) &&
        !r.tags.some((t) => filters.cuisines.includes(t))
      )
        return false;
      return true;
    });
  },

  async getById(id: string): Promise<Restaurant | null> {
    // Mock data lookup (for development / offline fallback)
    return RESTAURANTS.find((r) => r.id === id) ?? null;
  },

  /**
   * Build the shared deck for a room (wiki §2.3): one Nearby Search, shuffled,
   * trimmed to `size`. Because the deck is generated once on the host and stored
   * immutably in RTDB, a plain shuffle is enough — every voter reads the same
   * stored order. If the area is sparse it auto-expands the radius and, as a last
   * resort, tops up from mock data so the deck is never unplayable (wiki §2.7 #9).
   */
  async buildDeck(filters: RoomFilters, size = 20): Promise<Restaurant[]> {
    const minDeck = Math.min(8, size);
    let radiusKm = filters.radiusKm;
    let results = await this.getNearby(filters);

    for (let tries = 0; results.length < minDeck && tries < 2; tries++) {
      radiusKm *= 2;
      results = await this.getNearby({ ...filters, radiusKm });
    }

    if (results.length < minDeck) {
      const have = new Set(results.map((r) => r.id));
      for (const r of RESTAURANTS) {
        if (results.length >= size) break;
        if (!have.has(r.id)) {
          results.push(r);
          have.add(r.id);
        }
      }
    }

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
