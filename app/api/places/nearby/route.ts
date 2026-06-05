import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Server-side proxy for Google Places Nearby Search.
// The API key is kept in GOOGLE_PLACES_API_KEY (no NEXT_PUBLIC_ prefix)
// so it is never sent to the browser.

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radiusMeters = searchParams.get("radius") ?? "2000";
  const openNow = searchParams.get("openNow") === "true";

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng query params are required" },
      { status: 400 },
    );
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  );
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", radiusMeters);
  url.searchParams.set("type", "restaurant");
  url.searchParams.set("language", "th");
  if (openNow) url.searchParams.set("opennow", "true");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }, // cache 5 minutes per location
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Places API returned ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
