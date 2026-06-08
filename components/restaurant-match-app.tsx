"use client";

import { useEffect, useRef, useState } from "react";
import { CreateScreen } from "@/components/screens/create-screen";
import { DetailScreen } from "@/components/screens/detail-screen";
import { HomeScreen } from "@/components/screens/home-screen";
import { JoinScreen } from "@/components/screens/join-screen";
import { LobbyScreen } from "@/components/screens/lobby-screen";
import { MatchScreen } from "@/components/screens/match-screen";
import { NoMatchScreen } from "@/components/screens/no-match-screen";
import { EditFiltersScreen } from "@/components/screens/edit-filters-screen";
import { ProfileSetupScreen } from "@/components/screens/profile-setup-screen";
import {
  FinalVoteScreen,
  ResultsScreen,
} from "@/components/screens/results-screen";
import { SwipeScreen } from "@/components/screens/swipe-screen";
import { WaitingScreen } from "@/components/screens/waiting-screen";
import { Screen } from "@/components/ui/screen";
import { useReducedMotion } from "@/components/ui/motion";
import { foodTypeLabel, priceStr } from "@/lib/data";
import { authService } from "@/lib/services/auth.service";
import { restaurantService } from "@/lib/services/restaurant.service";
import { roomService } from "@/lib/services/room.service";
import { cn } from "@/lib/utils/cn";
import { loadProfile, saveProfile } from "@/lib/utils/profile-storage";
import type {
  GameState,
  Player,
  RankedResult,
  Restaurant,
  RoomFilters,
} from "@/lib/types";

type PreScreen = "home" | "create" | "join";

// ── helpers ──────────────────────────────────────────────────────────────────

function buildRoomSettings(filters: RoomFilters): string[] {
  const tags: string[] = [];
  tags.push(`📍 ${filters.radiusKm} กม.`);
  const priceMin = priceStr(filters.priceMin);
  const priceMax = priceStr(filters.priceMax);
  tags.push(priceMin === priceMax ? priceMin : `${priceMin}–${priceMax}`);
  filters.cuisines.slice(0, 3).forEach((c) => tags.push(foodTypeLabel(c)));
  if (filters.openNow) tags.push("เปิดอยู่ตอนนี้");
  return tags;
}

function buildLocalRanking(
  deck: Restaurant[],
  likes: Record<string, string[]>,
  voterCount: number,
): RankedResult[] {
  return deck
    .map<RankedResult>((r, deckIndex) => {
      const likeCount = likes[r.id]?.length ?? 0;
      return {
        restaurantId: r.id,
        rank: deckIndex + 1,
        deckIndex,
        likes: likeCount,
        voterCount,
        likePct: voterCount ? Math.round((likeCount / voterCount) * 100) : 0,
      };
    })
    .sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      if (b.likePct !== a.likePct) return b.likePct - a.likePct;
      return a.deckIndex - b.deckIndex;
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
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

  // ── viewport ──────────────────────────────────────────────────────────────
  // Mobile keyboards overlay the layout instead of resizing it, hiding the
  // bottom button + focused input. Shrink the frame to the visual viewport so
  // they stay above the keyboard (iOS + Android).
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setViewportHeight(vv.height);
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  // ── navigation ────────────────────────────────────────────────────────────
  // Before joining a room the screen is manual; once in a room the screen is
  // *derived* from room.status so every client moves together in realtime.
  const [preScreen, setPreScreen] = useState<PreScreen>(
    initialJoinCode ? "join" : "home",
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [picked, setPicked] = useState<Restaurant | null>(null);
  const [matchCelebrated, setMatchCelebrated] = useState(false);
  const [hostSetupPending, setHostSetupPending] = useState(false);
  const [editingFilters, setEditingFilters] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

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
  const isHost = !!room && !!userId && room.hostId === userId;
  // a fresh round needs ≥2 voters online, same as the lobby start gate (wiki §2.3)
  const canRestart = players.filter((p) => p.connected).length >= 2;
  const deck = game?.deck ?? [];
  const myCursor = game && userId ? (game.progress[userId] ?? 0) : 0;

  const matchedRestaurant: Restaurant | null = game?.match
    ? (deck.find((r) => r.id === game.match!.restaurantId) ?? null)
    : null;

  const voters = game?.roster.length ? game.roster : players.map((p) => p.id);
  const rankedRows = game?.results.length
    ? game.results
    : buildLocalRanking(deck, game?.likes ?? {}, voters.length);
  const rankedRestaurants = rankedRows
    .map((row) => {
      const r = deck.find((item) => item.id === row.restaurantId);
      return r ? { ...row, r } : null;
    })
    .filter((row): row is RankedResult & { r: Restaurant } => row !== null);
  const finalVoteOptions =
    game?.finalVote?.options
      .map((id) => deck.find((r) => r.id === id))
      .filter((r): r is Restaurant => !!r) ?? [];

  // Replay the match celebration on each fresh match (reset once status leaves).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (room?.status !== "matched") setMatchCelebrated(false);
  }, [room?.status]);

  // ── after-match enrichment (Place Details, New) ─────────────────────────────
  // The deck snapshot omits phone/website/hours to keep Nearby Search cheap.
  // When a detail card is shown, lazily fetch those fields once per placeId and
  // merge them over the deck restaurant. One call per match, cached server-side.
  const detailTarget = picked ?? (detailOpen ? matchedRestaurant : null);
  const [details, setDetails] = useState<Record<string, Partial<Restaurant>>>(
    {},
  );
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
      const stored = loadProfile();
      const hostPlayer: Player = {
        id: userId,
        name: stored.name.trim() || "โฮสต์",
        emoji: stored.avatar,
        host: true,
        me: true,
        ready: false,
        connected: true,
      };
      const code = await roomService.create(hostPlayer, filters);
      setRoomCode(code);
      setHostSetupPending(true);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "สร้างห้องไม่สำเร็จ");
    } finally {
      setRoomLoading(false);
    }
  }

  async function handleCheckCode(code: string) {
    await roomService.checkJoinable(code);
  }

  async function handleJoin(data: {
    code: string;
    name: string;
    avatar: string;
  }) {
    if (!userId) throw new Error("ยืนยันตัวตนไม่สำเร็จ ลองรีเฟรชหน้าใหม่");
    const code = await roomService.join(
      data.code,
      { name: data.name, emoji: data.avatar },
      userId,
    );
    saveProfile({ name: data.name, avatar: data.avatar });
    setHostSetupPending(false);
    setRoomCode(code);
  }

  async function handleHostProfile(profile: { name: string; avatar: string }) {
    if (!roomCode || !userId) return;
    await roomService.updateProfile(roomCode, userId, {
      name: profile.name,
      emoji: profile.avatar,
    });
    saveProfile(profile);
    setHostSetupPending(false);
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
    return roomService.setReady(roomCode, userId, ready).catch(console.error);
  }

  function handleDecide(
    restaurant: Restaurant,
    liked: boolean,
    nextCursor: number,
  ) {
    if (!roomCode || !userId) return;
    roomService
      .submitDecision(roomCode, userId, restaurant.id, liked, nextCursor)
      .catch(console.error);
  }

  function handleFinalVote(restaurantId: string) {
    if (!roomCode || !userId) return;
    return roomService.submitFinalVote(roomCode, userId, restaurantId);
  }

  function handleRestart(expandRadius = false) {
    if (!roomCode || !room || !canRestart) return;
    setDetailOpen(false);
    setPicked(null);
    const filters = expandRadius
      ? { ...room.filters, radiusKm: Math.min(room.filters.radiusKm * 1.5, 50) }
      : room.filters;
    return roomService.restartRound(roomCode, filters).catch(console.error);
  }

  function handleLeave() {
    if (roomCode && userId)
      roomService.leave(roomCode, userId).catch(console.error);
    setRoomCode(null);
    setGame(null);
    setDetailOpen(false);
    setPicked(null);
    setEditingFilters(false);
    setEditingProfile(false);
    setPreScreen("home");
  }

  async function handleSaveFilters(filters: RoomFilters) {
    if (!roomCode) return;
    setRoomLoading(true);
    setRoomError(null);
    try {
      await roomService.updateFilters(roomCode, filters);
      setEditingFilters(false);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setRoomLoading(false);
    }
  }

  async function handleSaveProfile(profile: { name: string; avatar: string }) {
    if (!roomCode || !userId) return;
    await roomService.updateProfile(roomCode, userId, {
      name: profile.name,
      emoji: profile.avatar,
    });
    saveProfile(profile);
    setEditingProfile(false);
  }

  // No-match "ปรับเงื่อนไข": edit the *same* room's filters and rebuild the deck,
  // keeping the locked roster — not leave + create a fresh room.
  async function handleAdjustAndRestart(filters: RoomFilters) {
    if (!roomCode || !canRestart) return;
    setRoomLoading(true);
    setRoomError(null);
    try {
      await roomService.restartRound(roomCode, filters);
      setEditingFilters(false);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : "ปรับเงื่อนไขไม่สำเร็จ");
    } finally {
      setRoomLoading(false);
    }
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
          onCheckCode={handleCheckCode}
          onJoin={handleJoin}
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
        canRestart={canRestart}
        onBack={() => setPicked(null)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
      />
    );
  } else if (room.status === "lobby" && hostSetupPending) {
    view = (
      <ProfileSetupScreen onConfirm={handleHostProfile} onBack={handleLeave} />
    );
  } else if (room.status === "lobby" && editingFilters) {
    view = (
      <EditFiltersScreen
        filters={room.filters}
        onSave={handleSaveFilters}
        onBack={() => setEditingFilters(false)}
        loading={roomLoading}
        error={roomError}
      />
    );
  } else if (room.status === "lobby" && editingProfile) {
    const mine = players.find((p) => p.id === userId);
    view = (
      <ProfileSetupScreen
        onConfirm={handleSaveProfile}
        onBack={() => setEditingProfile(false)}
        title="แก้ไขโปรไฟล์"
        submitLabel="บันทึก"
        initialName={mine?.name ?? ""}
        initialAvatar={mine?.emoji}
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
        onEditSettings={() => setEditingFilters(true)}
        onEditProfile={() => setEditingProfile(true)}
      />
    );
  } else if (room.status === "matched" && matchedRestaurant) {
    view = detailOpen ? (
      <DetailScreen
        r={withDetails(matchedRestaurant) ?? matchedRestaurant}
        players={players}
        matched
        canRestart={canRestart}
        onBack={() => setDetailOpen(false)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
      />
    ) : !matchCelebrated ? (
      <MatchScreen
        winner={matchedRestaurant}
        candidates={deck}
        players={players}
        reduced={reduced}
        canRestart={canRestart}
        onOpen={() => setMatchCelebrated(true)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
      />
    ) : (
      <ResultsScreen
        winner={matchedRestaurant}
        ranked={rankedRestaurants}
        players={players}
        canRestart={canRestart}
        onOpen={() => setDetailOpen(true)}
        onAgain={() => handleRestart()}
        onHome={handleLeave}
        onPick={(r) => setPicked(r)}
      />
    );
  } else if (room.status === "final_vote" && game?.finalVote) {
    view = (
      <FinalVoteScreen
        finalVote={game.finalVote}
        options={finalVoteOptions}
        myUid={userId ?? ""}
        voterCount={voters.length}
        onVote={handleFinalVote}
      />
    );
  } else if (room.status === "no_match" && editingFilters && isHost) {
    view = (
      <EditFiltersScreen
        filters={room.filters}
        onSave={handleAdjustAndRestart}
        onBack={() => setEditingFilters(false)}
        loading={roomLoading}
        error={roomError}
        title="ปรับเงื่อนไข"
        submitLabel="ลองใหม่อีกครั้ง"
        loadingLabel="กำลังโหลดร้าน…"
      />
    );
  } else if (room.status === "no_match") {
    view = (
      <NoMatchScreen
        players={players}
        isHost={isHost}
        reduced={reduced}
        canRestart={canRestart}
        onNewGame={handleLeave}
        onRegenerate={() => handleRestart()}
        onAdjust={() => {
          setRoomError(null);
          setEditingFilters(true);
        }}
        onLeave={handleLeave}
      />
    );
  } else if (
    room.status === "active" &&
    room.deckSize > 0 &&
    myCursor >= room.deckSize
  ) {
    view = (
      <WaitingScreen
        players={players}
        voters={voters}
        progress={game?.progress ?? {}}
        deckSize={room.deckSize}
        myUid={userId ?? ""}
        reduced={reduced}
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
      className="relative mx-auto h-[100dvh] w-full max-w-107.5 overflow-hidden"
      style={viewportHeight ? { height: viewportHeight } : undefined}>
      <div
        key={`${roomCode ?? preScreen}:${room?.status ?? ""}:${detailOpen}:${picked?.id ?? ""}`}
        className={cn(
          "relative h-full",
          reduced ? "animate-fade-only" : "animate-screen-in",
        )}>
        {view}
      </div>
    </div>
  );
}

function LoadingView({ label }: { label: string }) {
  return (
    <Screen bg="var(--cream-2)">
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 text-ink-3">
        <span className="h-8.5 w-8.5 rounded-full border-[3px] border-line-strong border-t-cta animate-[rmSpin_.8s_linear_infinite]" />
        <span className="font-display text-sm font-semibold">{label}</span>
      </div>
    </Screen>
  );
}
