"use client";

import { useCallback, useState } from "react";
import { restaurantService } from "@/lib/services/restaurant.service";
import type { ApiState, Restaurant, RoomFilters } from "@/lib/types";

type UseRestaurantsResult = ApiState<Restaurant[]> & {
  fetch: (filters: RoomFilters) => Promise<void>;
};

export function useRestaurants(): UseRestaurantsResult {
  const [state, setState] = useState<ApiState<Restaurant[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (filters: RoomFilters) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await restaurantService.getNearby(filters);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, []);

  return { ...state, fetch };
}
