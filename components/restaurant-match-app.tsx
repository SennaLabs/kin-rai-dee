"use client";

import { useMemo, useState } from "react";
import { IOSDevice } from "@/components/ios-device";
import { CreateScreen } from "@/components/screens/create-screen";
import { DetailScreen } from "@/components/screens/detail-screen";
import { HomeScreen } from "@/components/screens/home-screen";
import { JoinScreen } from "@/components/screens/join-screen";
import { LobbyScreen } from "@/components/screens/lobby-screen";
import { MatchScreen } from "@/components/screens/match-screen";
import { NoMatchScreen } from "@/components/screens/no-match-screen";
import { SwipeScreen } from "@/components/screens/swipe-screen";
import { useReducedMotion } from "@/components/ui/motion";
import { PLAYERS, RESTAURANTS } from "@/lib/data";
import type { RankedLike, Restaurant } from "@/lib/types";

type ScreenName =
  | "home"
  | "create"
  | "join"
  | "lobby"
  | "swipe"
  | "match"
  | "detail"
  | "nomatch";

// screens that use the dark device chrome
const DARK_BG: Partial<Record<ScreenName, boolean>> = {
  match: true,
  detail: true,
};

/**
 * Restaurant Match — the full flow as a client-side state machine.
 * Home → Create / Join → Lobby → Swipe → Match / No-Match → Detail.
 */
export function RestaurantMatchApp() {
  const reduced = useReducedMotion();

  const [screen, setScreen] = useState<ScreenName>("home");
  const [matched, setMatched] = useState<Restaurant | null>(null);
  const [candidates, setCandidates] = useState<Restaurant[]>([]);
  const [likedRanked, setLikedRanked] = useState<RankedLike[]>([]);
  const [deckSeed, setDeckSeed] = useState(0); // bump to reshuffle / remount swipe

  // deck: rotate based on the seed so "เริ่มรอบใหม่" feels fresh
  const deck = useMemo(() => {
    const arr = RESTAURANTS.slice();
    for (let i = 0; i < deckSeed % arr.length; i++) arr.push(arr.shift()!);
    return arr;
  }, [deckSeed]);

  const go = (s: ScreenName) => setScreen(s);

  function handleMatch(restaurant: Restaurant, liked: Restaurant[]) {
    setMatched(restaurant);
    setCandidates(liked && liked.length ? liked : [restaurant]);
    go("match");
  }

  function handleNoMatch(liked: Restaurant[]) {
    const base = liked && liked.length ? liked : deck.slice(0, 4);
    const ranked: RankedLike[] = base.slice(0, 4).map((r, i) => ({
      r,
      likes: Math.max(1, PLAYERS.length - 1 - i),
    }));
    setLikedRanked(ranked);
    go("nomatch");
  }

  function restart() {
    setDeckSeed((s) => s + 1);
    setMatched(null);
    go("swipe");
  }

  const winner = matched ?? deck[4];
  const nomatchRanked = likedRanked.length
    ? likedRanked
    : deck.slice(0, 4).map((r, i) => ({
        r,
        likes: Math.max(1, PLAYERS.length - 1 - i),
      }));

  let view: React.ReactNode = null;
  if (screen === "home") {
    view = (
      <HomeScreen
        reduced={reduced}
        onCreate={() => go("create")}
        onJoin={() => go("join")}
      />
    );
  } else if (screen === "create") {
    view = <CreateScreen onBack={() => go("home")} onCreate={() => go("lobby")} />;
  } else if (screen === "join") {
    view = <JoinScreen onBack={() => go("home")} onJoin={() => go("lobby")} />;
  } else if (screen === "lobby") {
    view = (
      <LobbyScreen players={PLAYERS} reduced={reduced} onStart={() => go("swipe")} />
    );
  } else if (screen === "swipe") {
    view = (
      <SwipeScreen
        key={deckSeed}
        deck={deck}
        players={PLAYERS}
        reduced={reduced}
        onMatch={handleMatch}
        onNoMatch={handleNoMatch}
      />
    );
  } else if (screen === "match") {
    view = (
      <MatchScreen
        winner={winner}
        candidates={candidates}
        players={PLAYERS}
        reduced={reduced}
        onOpen={() => go("detail")}
        onAgain={restart}
      />
    );
  } else if (screen === "detail") {
    view = (
      <DetailScreen
        r={winner}
        players={PLAYERS}
        onBack={() => go("match")}
        onAgain={restart}
      />
    );
  } else if (screen === "nomatch") {
    view = (
      <NoMatchScreen
        likedRanked={nomatchRanked}
        players={PLAYERS}
        reduced={reduced}
        onExpand={restart}
        onRestart={() => go("home")}
        onPick={(r) => {
          setMatched(r);
          go("detail");
        }}
      />
    );
  }

  return (
    <IOSDevice dark={!!DARK_BG[screen]}>
      <div
        key={screen}
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
    </IOSDevice>
  );
}
