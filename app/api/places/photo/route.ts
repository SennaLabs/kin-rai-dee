import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Server-side proxy for the **Place Photo (New)** endpoint:
//   GET https://places.googleapis.com/v1/{photoName}/media
// `photoName` is the resource name returned by Nearby Search (New)
// (`places/{placeId}/photos/{ref}`). With `skipHttpRedirect=true` Google
// returns JSON `{ photoUri }` (a short-lived googleusercontent URL) instead of
// streaming the bytes; we 302 the browser to that URL so the image itself is
// served straight from Google's CDN (no egress through us, no extra billing).
//
// Cost control (wiki §4.5 — photos are the dominant Places cost):
//   • Each /media call is billed once. We cache the resolved photoUri by
//     (name, width) so every member of a room — and repeat card views — reuse
//     one billed call within CACHE_TTL_MS instead of re-billing per viewer.
//   • The client only requests photos for cards about to be seen (the swipe
//     stack renders ~3 at a time), so we never resolve all 20 up front.
//   • A long browser Cache-Control keeps the redirect target out of the network
//     entirely on repeat loads.
// The durable upgrade (wiki §3.5) is caching the bytes in Cloud Storage / CDN.

const CACHE_TTL_MS = 30 * 60 * 1000; // photoUri stays valid well beyond this
const CACHE_MAX_ENTRIES = 500;
const MIN_PX = 80;
const MAX_PX = 1600;

type CacheEntry = { at: number; uri: string };
const cache = new Map<string, CacheEntry>();

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") ?? "";
  // Guard against SSRF/abuse: only genuine photo resource names are allowed.
  if (!/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
    return NextResponse.json({ error: "invalid photo name" }, { status: 400 });
  }
  const width = Math.min(
    Math.max(Number(searchParams.get("w")) || 480, MIN_PX),
    MAX_PX,
  );

  const key = `${name}:${width}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return redirectTo(hit.uri);
  }

  const url = new URL(`https://places.googleapis.com/v1/${name}/media`);
  url.searchParams.set("maxWidthPx", String(width));
  url.searchParams.set("skipHttpRedirect", "true");

  const upstream = await fetch(url.toString(), {
    headers: { "X-Goog-Api-Key": apiKey },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Place Photo returned ${upstream.status}` },
      { status: upstream.status === 429 ? 429 : 502 },
    );
  }

  const data = await upstream.json().catch(() => ({}));
  const uri: string | undefined = data?.photoUri;
  if (!uri) {
    return NextResponse.json({ error: "no photoUri in response" }, { status: 502 });
  }

  if (cache.size >= CACHE_MAX_ENTRIES) cache.clear();
  cache.set(key, { at: Date.now(), uri });

  return redirectTo(uri);
}

function redirectTo(uri: string): NextResponse {
  const res = NextResponse.redirect(uri, 302);
  // Let the browser cache the image so repeat views skip the network.
  res.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return res;
}
