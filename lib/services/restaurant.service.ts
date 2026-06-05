// Restaurant service — stub for Google Places Nearby Search.
// Replace getNearby with a real Places API call once the key is configured.

import { RESTAURANTS } from "@/lib/data";
import type { Restaurant, RoomFilters } from "@/lib/types";

export const restaurantService = {
  async getNearby(filters: RoomFilters): Promise<Restaurant[]> {
    // TODO: call Google Places Nearby Search API:
    //   GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
    //     ?location=<lat>,<lng>&radius=<radiusKm*1000>&type=restaurant&key=<API_KEY>
    // Map each Place result to the Restaurant shape before returning.

    // Mock fallback — filter the local dataset by the provided criteria.
    return RESTAURANTS.filter((r) => {
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
  },

  async getById(id: string): Promise<Restaurant | null> {
    // TODO: call Places Details API using the place_id as `id`
    return RESTAURANTS.find((r) => r.id === id) ?? null;
  },
};
