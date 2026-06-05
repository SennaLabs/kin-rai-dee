import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Server-side proxy for **Place Details (New)**:
//   GET https://places.googleapis.com/v1/places/{placeId}
// Used to enrich the after-match card (wiki §2.6) with the fields the deck's
// Nearby Search didn't carry: phone, website, full address, and opening hours.
//
// Cost control (wiki §4.3 — "Place Details after match: 0–1 call"):
//   • Called lazily, only when a detail screen is opened — not for every match.
//   • Field-masked to the few fields the screen shows (the mask sets the SKU).
//   • Cached by placeId so multiple viewers of the same match — and re-opening
//     the screen — reuse one billed call.

const FIELD_MASK = [
  "id",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "formattedAddress",
  "currentOpeningHours.openNow",
  "regularOpeningHours.weekdayDescriptions",
].join(",");

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 300;

type Details = {
  status: "OK";
  phone: string;
  website: string;
  mapsUri: string;
  addr: string;
  open?: boolean;
  hours: string;
};

type CacheEntry = { at: number; details: Details };
const cache = new Map<string, CacheEntry>();

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { status: "ERROR", error_message: "GOOGLE_PLACES_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  // Place IDs are opaque tokens; reject anything with path separators.
  if (!id || /[/?#]/.test(id)) {
    return NextResponse.json(
      { status: "INVALID_REQUEST", error_message: "id is required" },
      { status: 400 },
    );
  }

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.details);
  }

  const upstream = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
        "Accept-Language": "th",
      },
    },
  );

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(
      {
        status: data?.error?.status ?? "ERROR",
        error_message: data?.error?.message ?? `Place Details returned ${upstream.status}`,
      },
      { status: upstream.status === 429 ? 429 : 502 },
    );
  }

  const hoursList: string[] | undefined =
    data?.regularOpeningHours?.weekdayDescriptions;

  const details: Details = {
    status: "OK",
    phone: data?.nationalPhoneNumber ?? data?.internationalPhoneNumber ?? "",
    website: data?.websiteUri ?? "",
    mapsUri: data?.googleMapsUri ?? "",
    addr: data?.formattedAddress ?? "",
    open: data?.currentOpeningHours?.openNow,
    hours: hoursList?.length ? hoursList.join(" · ") : "ดูเวลาทำการใน Google Maps",
  };

  if (cache.size >= CACHE_MAX_ENTRIES) cache.clear();
  cache.set(id, { at: Date.now(), details });

  return NextResponse.json(details);
}
