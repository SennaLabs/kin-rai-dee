import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FOOD_PLACE_TYPES, isFoodPlaceType } from "@/lib/data";

// Server-side proxy for **Nearby Search (New)** — Places API (New).
//   POST https://places.googleapis.com/v1/places:searchNearby
// The API key stays server-side in GOOGLE_PLACES_API_KEY and is sent as the
// X-Goog-Api-Key header; it never reaches the browser.
//
// Cost control (wiki §4) lives here:
//   • Field mask — we request only the fields the deck cards render. The SKU
//     billed is the highest tier any requested field touches, so the mask is
//     the main price lever. This mask includes `rating`/`priceLevel` (→ Pro+
//     Enterprise) and `currentOpeningHours.openNow` (→ Enterprise + Atmosphere,
//     the priciest Nearby tier). To drop to the cheaper Pro tier with 5× the
//     free quota, remove the rating/price/openingHours lines from FIELD_MASK
//     (and stop rendering those on the card).
//   • Compact projection — we strip Google's response down to the handful of
//     fields the client uses, minimising the payload sent to the browser and
//     stored in RTDB.
//   • Best-effort in-memory cache — rooms searching the same neighbourhood
//     within CACHE_TTL_MS reuse one upstream call. (Durable, cross-instance
//     caching via Firestore keyed by geohash is the wiki §3.5 upgrade.)

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby";

// Only the fields the deck needs. `displayName.text` drops the languageCode
// sub-field; `photos.name` keeps just the photo resource name (no dimensions).
const FIELD_MASK = [
  "places.id",
  "places.displayName.text",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.currentOpeningHours.openNow",
  "places.primaryType",
  "places.types",
  "places.shortFormattedAddress",
  "places.photos.name",
].join(",");

const MAX_RESULTS = 20; // searchNearby (New) hard cap
const MAX_RADIUS_M = 50_000; // searchNearby (New) hard cap
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const DEFAULT_INCLUDED_TYPES = [
  "restaurant",
  "cafe",
  "coffee_shop",
  "bakery",
  "dessert_shop",
  "meal_takeaway",
  "food_court",
];

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

type CacheEntry = { at: number; results: NearbyPlace[] };
const cache = new Map<string, CacheEntry>();

function priceLevelToNumber(level?: string): number | undefined {
  switch (level) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return undefined;
  }
}

type RawPlace = {
  id: string;
  displayName?: { text?: string };
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  currentOpeningHours?: { openNow?: boolean };
  primaryType?: string;
  types?: string[];
  shortFormattedAddress?: string;
  photos?: { name?: string }[];
};

function project(places: RawPlace[]): NearbyPlace[] {
  return places
    .filter((p) => p.id && p.location)
    .map((p) => ({
      id: p.id,
      name: p.displayName?.text ?? "",
      lat: p.location!.latitude,
      lng: p.location!.longitude,
      rating: p.rating,
      reviews: p.userRatingCount,
      price: priceLevelToNumber(p.priceLevel),
      open: p.currentOpeningHours?.openNow,
      primaryType: p.primaryType,
      types: p.types,
      addr: p.shortFormattedAddress,
      photo: p.photos?.[0]?.name,
    }));
}

function parseIncludedTypes(value: string | null): string[] {
  if (!value) return [];
  const unique = new Set<string>();
  value
    .split(",")
    .map((type) => type.trim())
    .filter((type) => type && isFoodPlaceType(type))
    .slice(0, 50)
    .forEach((type) => unique.add(type));
  return [...unique];
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { status: "ERROR", error_message: "GOOGLE_PLACES_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { status: "INVALID_REQUEST", error_message: "lat and lng are required" },
      { status: 400 },
    );
  }
  const radius = Math.min(
    Math.max(Number(searchParams.get("radius")) || 2000, 1),
    MAX_RADIUS_M,
  );
  const requestedTypes = parseIncludedTypes(searchParams.get("types"));
  const includedTypes = requestedTypes.length
    ? requestedTypes
    : DEFAULT_INCLUDED_TYPES.filter((type) => FOOD_PLACE_TYPES.includes(type));

  // Round the centre to ~110 m so nearby rooms share a cache entry.
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}:${Math.round(radius)}:${includedTypes.join("|")}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json({
      status: hit.results.length ? "OK" : "ZERO_RESULTS",
      results: hit.results,
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: MAX_RESULTS,
        rankPreference: "POPULARITY",
        languageCode: "th",
        regionCode: "TH",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius,
          },
        },
      }),
    });
  } catch (err) {
    // Network/DNS/timeout reaching Google — return a clean 502 so the client's
    // getNearby falls back to mock instead of surfacing an unhandled 500.
    return NextResponse.json(
      {
        status: "ERROR",
        error_message: err instanceof Error ? err.message : "Places API request failed",
      },
      { status: 502 },
    );
  }

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    // New API error shape: { error: { code, message, status } }
    return NextResponse.json(
      {
        status: data?.error?.status ?? "ERROR",
        error_message: data?.error?.message ?? `Places API returned ${upstream.status}`,
      },
      { status: upstream.status === 429 ? 429 : 502 },
    );
  }

  const results = project(data.places ?? []);

  if (cache.size >= CACHE_MAX_ENTRIES) cache.clear();
  cache.set(key, { at: Date.now(), results });

  return NextResponse.json({
    status: results.length ? "OK" : "ZERO_RESULTS",
    results,
  });
}
