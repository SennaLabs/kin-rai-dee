// Google Maps / Places API configuration.
// See .env.example. Install loaders: yarn add @googlemaps/js-api-loader

export const mapsConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  region: "TH",
  language: "th",
  // Bangkok city center — used as the fallback when geolocation is unavailable
  defaultCenter: { lat: 13.7563, lng: 100.5018 },
};
