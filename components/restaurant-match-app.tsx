"use client";

import { useEffect, useRef, useState } from "react";
import { CreateScreen } from "@/components/screens/create-screen";
import { DetailScreen } from "@/components/screens/detail-screen";
import { HomeScreen } from "@/components/screens/home-screen";
import { JoinScreen } from "@/components/screens/join-screen";
import { LobbyScreen } from "@/components/screens/lobby-screen";
import { MatchScreen } from "@/components/screens/match-screen";
import { NoMatchScreen } from "@/components/screens/no-match-screen";
import { SwipeScreen } from "@/components/screens/swipe-screen";
import { Screen } from "@/components/ui/screen";
import { useReducedMotion } from "@/components/ui/motion";
import { priceStr } from "@/lib/data";
import { authService } from "@/lib/services/auth.service";
import { restaurantService } from "@/lib/services/restaurant.service";
import { roomService } from "@/lib/services/room.service";
import type { GameState, Player, RankedLike, Restaurant, RoomFilters } from "@/lib/types";

type PreScreen = "home" | "create" | "join";

// ── helpers ──────────────────────────────────────────────────────────────────

function buildRoomSettings(filters: RoomFilters): string[] {
  const tags: string[] = [];
  tags.push(`📍 ${filters.radiusKm} กม.`);
  const priceMin = priceStr(filters.priceMin);
  const priceMax = priceStr(filters.priceMax);
  tags.push(priceMin === priceMax ? priceMin : `${priceMin}–${priceMax}`);
  filters.cuisines.slice(0, 3).forEach((c) => tags.push(c));
  if (filters.openNow) tags.push("เปิดอยู่ตอนนี้");
  return tags;
}

/** Rank deck restaurants by like count for the no-match fallback (wiki §2.6 #4). */
function rankLikes(
  deck: Restaurant[],
  likes: Record<string, string[]>,
): RankedLike[] {
  const ranked = deck
    .map((r) => ({ r, likes: likes[r.id]?.length ?? 0 }))
    .filter((x) => x.likes > 0)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6);
  return ranked.length ? ranked : deck.slice(0, 4).map((r) => ({ r, likes: 0 }));
}

// ── component ────────────────────────────────────────────────────────────────

export function RestaurantMatchApp({
  initialJoinCode,
}: {
  /** prefilled code when arriving via an invite link (/j/{code}) */
  initialJoinCode?: string;
} = {}) {
  const reduced = useReducedMotion();

  // ── auth ──────────────────────────────────────────────────────────────────
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Sign in anonymously on first load; authService keeps the session in
    // Firebase so the same UID is reused across page refreshes.
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        setUserId(user.id);
      } else {
        authService.signInAnonymously().catch(console.error);
      }
    });
    return unsubscribe;
  }, []);

  // ── navigation ────────────────────────────────────────────────────────────
  // Before joining a room the screen is manual; once in a room the screen is
  // *derived* from room.status so every client moves together in realtime.
  const [preScreen, setPreScreen] = useState<PreScreen>(
    initialJoinCode ? "join" : "home",
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [picked, setPicked] = useState<Restaurant | null>(null);

  // ── room state ────────────────────────────────────────────────────────────
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Presence: flag connected + onDisconnect handler while we're in a room.
  useEffect(() => {
    if (!roomCode || !userId) return;
    return roomService.setupPresence(roomCode, userId);
  }, [roomCode, userId]);

  // Subscribe to the live room; match detection runs inside the service.
  useEffect(() => {
    if (!roomCode || !userId) return;
    return roomService.subscribeToRoom(roomCode, userId, (state) => {
      if (!state) {
        // Room was deleted (everyone left / expired) — bail to home.
        setGame(null);
        setRoomCode(null);
        setPreScreen("home");
        return;
      }
      setGame(state);
    });
  }, [roomCode, userId]);

  // ── derived values ──────────────────────────────────────────────────────────
  // Plain derivations — the React Compiler memoizes these automatically.
  const room = game?.room ?? null;
  const players: Player[] = room?.players ?? [];
  const deck = game?.deck ?? [];
  const myCursor = game && userId ? (game.progress[userId] ?? 0) : 0;

  const matchedRestaurant: Restaurant | null = game?.match
    ? (deck.find((r) => r.id === game.match!.restaurantId) ?? null)
    : null;

  const likerPlayers: Player[] = game?.match
    ? players.filter((p) => game.match!.likers.includes(p.id))
    : players;

  const myLiked: Restaurant[] =
    game && userId ? deck.filter((r) => game.likes[r.id]?.includes(userId)) : [];

  const nomatchRanked: RankedLike[] = game
    ? rankLikes(deck, game.likes)
    : [];

  // ── after-match enrichment (Place Details, New) ─────────────────────────────
  // The deck snapshot omits phone/website/hours to keep Nearby Search cheap.
  // When a detail card is shown, lazily fetch those fields once per placeId and
  // merge them over the deck restaurant. One call per match, cached server-side.
  const detailTarget = picked ?? (detailOpen ? matchedRestaurant : null);
  const [details, setDetails] = useState<Record<string, Partial<Restaurant>>>({});
  const fetchedDetails = useRef<Set<string>>(new Set());

  useEffect(() => {
    const placeId = detailTarget?.placeId;
    if (!placeId || fetchedDetails.current.has(placeId)) return;
    fetchedDetails.current.add(placeId);
    let alive = true;
    restaurantService.getDetails(placeId).then((d) => {
      if (alive && Object.keys(d).length > 0) {
        setDetails((m) => ({ ...m, [placeId]: d }));
      }
    });
    return () => {
      alive = false;
    };
  }, [detailTarget?.placeId]);

  function withDetails(r: Restaurant | null): Restaurant | null {
    const extra = r?.placeId ? details[r.placeId] : undefined;
    return r && extra ? { ...r, ...extra } : r;
  }

  // ── handlers ──────────────────────────────────────────────────────────────

  async function handleCreate(filters: RoomFilters) {
    if (!userId) return;
    setRoomLoading(true);
    setRoomError(null);
    try {
      const hostPlayer: Player = {
        id: userId,
        name: "คุณ",
        emoji: "🦊",
        host: true,
        me: true,
        ready: false,
        connected: true,
      };
      const code = await roomService.create(hostPlayer, filters);
      setRoomCode(code);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "สร้างห้องไม่สำเร็จ");
    } finally {
      setRoomLoading(false);
    }
  }

  async function handleJoin(data: { code: string; name: string; avatar: string }) {
    if (!userId) return;
    setRoomLoading(true);
    setRoomError(null);
    try {
      const code = await roomService.join(
        data.code,
        { name: data.name, emoji: data.avatar },
        userId,
      );
      setRoomCode(code);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "เข้าร่วมห้องไม่สำเร็จ");
    } finally {
      setRoomLoading(false);
    }
  }

  async function handleStart() {
    if (!roomCode || !room) return;
    try {
      await roomService.startGame(roomCode, room.filters);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "เริ่มเกมไม่สำเร็จ");
    }
  }

  function handleReady(ready: boolean) {
    if (!roomCode || !userId) return;
    roomService.setReady(roomCode, userId, ready).catch(console.error);
  }

  function handleDecide(restaurant: Restaurant, liked: boolean, nextCursor: number) {
    if (!roomCode || !userId) return;
    if (liked) {
      roomService.submitLike(roomCode, userId, restaurant.id).catch(console.error);
    }
    roomService.setProgress(roomCode, userId, nextCursor).catch(console.error);
  }

  function handleRestart(expandRadius = false) {
    if (!roomCode || !room) return;
    setDetailOpen(false);
    setPicked(null);
    const filters = expandRadius
      ? { ...room.filters, radiusKm: Math.min(room.filters.radiusKm * 1.5, 50) }
      : room.filters;
    roomService.restartRound(roomCode, filters).catch(console.error);
  }

  function handleLeave() {
    if (roomCode && userId) roomService.leave(roomCode, userId).catch(console.error);
    setRoomCode(null);
    setGame(null);
    setDetailOpen(false);
    setPicked(null);
    setPreScreen("home");
  }

  // ── render ────────────────────────────────────────────────────────────────

  let view: React.ReactNode = null;

  if (!roomCode) {
    // Pre-room flow
    if (preScreen === "create") {
      view = (
        <CreateScreen
          onBack={() => setPreScreen("home")}
          onCreate={handleCreate}
          loading={roomLoading}
          error={roomError}
        />
      );
    } else if (preScreen === "join") {
      view = (
        <JoinScreen
          onBack={() => setPreScreen("home")}
          onJoin={handleJoin}
          loading={roomLoading}
          error={roomError}
          initialCode={initialJoinCode}
        />
      );
    } else {
      view = (
        <HomeScreen
          reduced={reduced}
          onCreate={() => setPreScreen("create")}
          onJoin={() => setPreScreen("join")}
        />
      );
    }
  } else if (!room) {
    view = <LoadingView label="กำลังเข้าห้อง…" />;
  } else if (picked) {
    // No-match: user tapped a specific restaurant to inspect.
    view = (
      <DetailScreen
        r={withDetails(picked) ?? picked}
        players={players}
        matched={false}
        onBack={() => setPicked(null)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
      />
    );
  } else if (room.status === "lobby") {
    view = (
      <LobbyScreen
        players={players}
        me={userId}
        reduced={reduced}
        onStart={handleStart}
        onReady={handleReady}
        onLeave={handleLeave}
        code={room.code}
        roomSettings={buildRoomSettings(room.filters)}
      />
    );
  } else if (room.status === "matched" && matchedRestaurant) {
    view = detailOpen ? (
      <DetailScreen
        r={withDetails(matchedRestaurant) ?? matchedRestaurant}
        players={likerPlayers}
        matched
        onBack={() => setDetailOpen(false)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
      />
    ) : (
      <MatchScreen
        winner={matchedRestaurant}
        candidates={myLiked.length ? myLiked : [matchedRestaurant]}
        players={likerPlayers}
        reduced={reduced}
        onOpen={() => setDetailOpen(true)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
      />
    );
  } else if (room.status === "active" && room.deckSize > 0 && myCursor >= room.deckSize) {
    // I've reached the end of the deck without a match (wiki §2.6 #4).
    view = (
      <NoMatchScreen
        likedRanked={nomatchRanked}
        players={players}
        reduced={reduced}
        onExpand={() => handleRestart(true)}
        onRestart={handleLeave}
        onPick={(r) => setPicked(r)}
      />
    );
  } else {
    // active — swiping
    const roundKey = `${deck.length}:${deck[0]?.id ?? ""}:${deck[deck.length - 1]?.id ?? ""}`;
    view = (
      <SwipeScreen
        key={roundKey}
        code={room.code}
        deck={deck}
        players={players}
        likes={game?.likes ?? {}}
        progress={game?.progress ?? {}}
        myUid={userId ?? ""}
        startCursor={myCursor}
        reduced={reduced}
        onDecide={handleDecide}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 430,
        height: "100dvh",
        margin: "0 auto",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        key={`${roomCode ?? preScreen}:${room?.status ?? ""}:${detailOpen}:${picked?.id ?? ""}`}
        style={{
          position: "relative",
          height: "100%",
          animation: reduced
            ? "rmFadeOnly .2s ease"
            : "rmScreenIn .4s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {view}
      </div>
    </div>
  );
}

function LoadingView({ label }: { label: string }) {
  return (
    <Screen bg="var(--cream-2)">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          color: "var(--ink-3)",
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "3px solid var(--line-strong)",
            borderTopColor: "var(--cta)",
            animation: "rmSpin .8s linear infinite",
          }}
        />
        <span className="font-display" style={{ fontSize: 15, fontWeight: 600 }}>
          {label}
        </span>
      </div>
    </Screen>
  );
}
