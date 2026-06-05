"use client";

import { useCallback, useEffect, useState } from "react";
import { roomService } from "@/lib/services/room.service";
import type { GameState, Player, RoomFilters } from "@/lib/types";

type UseRoomResult = {
  /** the joined room code, or null when not in a room */
  code: string | null;
  /** live room snapshot from RTDB (deck, likes, progress, match, players) */
  game: GameState | null;
  loading: boolean;
  error: Error | null;
  create: (hostPlayer: Player, filters: RoomFilters) => Promise<string>;
  join: (
    code: string,
    player: Pick<Player, "name" | "emoji">,
    userId: string,
  ) => Promise<string>;
  leave: () => void;
};

/**
 * Realtime room hook: create/join a room, then stream its live GameState while
 * keeping presence wired. `uid` is the current anonymous auth uid.
 */
export function useRoom(uid: string | null): UseRoomResult {
  const [code, setCode] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (hostPlayer: Player, filters: RoomFilters) => {
      setLoading(true);
      setError(null);
      try {
        const c = await roomService.create(hostPlayer, filters);
        setCode(c);
        return c;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const join = useCallback(
    async (
      c: string,
      player: Pick<Player, "name" | "emoji">,
      userId: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const nc = await roomService.join(c, player, userId);
        setCode(nc);
        return nc;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const leave = useCallback(() => {
    if (code && uid) roomService.leave(code, uid).catch(() => {});
    setCode(null);
    setGame(null);
  }, [code, uid]);

  // Wire presence + live subscription whenever we're in a room.
  useEffect(() => {
    if (!code || !uid) return;
    const stopPresence = roomService.setupPresence(code, uid);
    const unsubscribe = roomService.subscribeToRoom(code, uid, setGame);
    return () => {
      stopPresence();
      unsubscribe();
    };
  }, [code, uid]);

  return { code, game, loading, error, create, join, leave };
}
