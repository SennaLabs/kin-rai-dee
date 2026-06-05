"use client";

import { useCallback, useEffect, useState } from "react";
import { roomService } from "@/lib/services/room.service";
import type { ApiState, Player, Room, RoomFilters } from "@/lib/types";

type UseRoomResult = ApiState<Room> & {
  create: (hostId: string, filters: RoomFilters) => Promise<Room>;
  join: (code: string, player: Pick<Player, "name" | "emoji">) => Promise<Room>;
};

export function useRoom(): UseRoomResult {
  const [state, setState] = useState<ApiState<Room>>({
    data: null,
    loading: false,
    error: null,
  });

  const create = useCallback(async (hostId: string, filters: RoomFilters) => {
    setState({ data: null, loading: true, error: null });
    try {
      const room = await roomService.create(hostId, filters);
      setState({ data: room, loading: false, error: null });
      return room;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const join = useCallback(
    async (code: string, player: Pick<Player, "name" | "emoji">) => {
      setState({ data: null, loading: true, error: null });
      try {
        const room = await roomService.join(code, player);
        setState({ data: room, loading: false, error: null });
        return room;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
        throw error;
      }
    },
    [],
  );

  // Subscribe to real-time updates once a room is loaded
  useEffect(() => {
    if (!state.data?.id) return;
    return roomService.subscribeToRoom(state.data.id, (room) => {
      setState((s) => ({ ...s, data: room }));
    });
  }, [state.data?.id]);

  return { ...state, create, join };
}
