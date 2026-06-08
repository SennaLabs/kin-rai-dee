"use client";

import { useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { RoundButton } from "@/components/ui/buttons";
import { FoodPhoto } from "@/components/ui/food-photo";
import { buzz } from "@/components/ui/motion";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Screen } from "@/components/ui/screen";
import { Stars } from "@/components/ui/stars";
import { priceStr } from "@/lib/data";
import { cn } from "@/lib/utils/cn";
import type { Player, Restaurant } from "@/lib/types";

type Drag = { x: number; active: boolean };
type Exiting = { dir: number };

type SwipeCardProps = {
  r: Restaurant;
  drag: Drag | null;
  top?: boolean;
  depth: number;
  exiting: Exiting | null;
};

function SwipeCard({ r, drag, top, depth, exiting }: SwipeCardProps) {
  // drag = {x, ...} for the top card; depth used for stacked cards behind
  const liked = drag && drag.x > 0;
  const stampOpacity = drag ? Math.min(1, Math.abs(drag.x) / 90) : 0;
  let transform: string;
  let transition: string;
  if (exiting) {
    transform = `translateX(${exiting.dir > 0 ? 620 : -620}px) translateY(-40px) rotate(${exiting.dir > 0 ? 22 : -22}deg)`;
    transition = "transform .42s cubic-bezier(.4,0,.2,1)";
  } else if (top) {
    transform = `translateX(${drag ? drag.x : 0}px) translateY(${drag ? Math.abs(drag.x) * 0.04 : 0}px) rotate(${drag ? drag.x * 0.05 : 0}deg)`;
    transition =
      drag && drag.active ? "none" : "transform .35s cubic-bezier(.34,1.4,.5,1)";
  } else {
    const scale = 1 - depth * 0.05;
    transform = `translateY(${depth * 14}px) scale(${scale})`;
    transition = "transform .35s cubic-bezier(.34,1.4,.5,1)";
  }
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[28px] bg-white border border-white/60 will-change-transform",
        top
          ? "shadow-[0_20px_44px_rgba(43,27,23,0.26)]"
          : "shadow-[0_12px_28px_rgba(43,27,23,0.14)]",
      )}
      style={{ transform, transition, zIndex: 30 - depth }}
    >
      {/* photo area */}
      <div className="absolute inset-0">
        <FoodPhoto r={r} big />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(43,27,23,0.06)_56%,rgba(43,27,23,0.82)_100%)]" />
      </div>

      {/* open-now badge */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.25 text-white font-semibold text-xs px-2.75 py-1.25 rounded-full",
            r.open ? "bg-[rgba(30,158,106,0.95)]" : "bg-[rgba(43,27,23,0.7)]",
          )}
        >
          <span className="w-1.75 h-1.75 rounded-full bg-white" />
          {r.open ? "เปิดอยู่" : "ปิดแล้ว"}
        </span>
        <span className="bg-white/90 text-ink font-bold text-xs px-2.75 py-1.25 rounded-full">
          {r.dist} กม.
        </span>
      </div>

      {/* LIKE / PASS stamps */}
      <div
        className="absolute top-6.5 right-4.5 rotate-12 flex items-center gap-2 border-4 border-white text-white rounded-[14px] px-4 py-1.5 bg-[rgba(230,57,70,0.9)] font-display font-bold text-[26px]"
        style={{
          opacity: top && liked ? stampOpacity : 0,
          transition: drag && drag.active ? "none" : "opacity .2s",
        }}
      >
        ชอบ ❤️
      </div>
      <div
        className="absolute top-6.5 left-4.5 -rotate-12 flex items-center gap-2 border-4 border-white text-white rounded-[14px] px-4 py-1.5 bg-[rgba(43,27,23,0.78)] font-display font-bold text-[26px]"
        style={{
          opacity: top && drag && drag.x < 0 ? stampOpacity : 0,
          transition: drag && drag.active ? "none" : "opacity .2s",
        }}
      >
        <XIcon size={26} weight="bold" />ผ่าน
      </div>

      {/* info */}
      <div className="absolute left-0 right-0 bottom-0 px-5 pb-5.5 text-white">
        <div className="font-display text-3xl font-semibold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
          {r.name}
        </div>
        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1.25 font-bold text-sm">
            <Stars value={r.rating} size={15} color="#FFC845" /> {r.rating}
          </span>
          <span className="opacity-85 text-sm">
            ({r.reviews.toLocaleString()})
          </span>
          <span className="font-bold text-sm text-[#FFD9A8]">
            {priceStr(r.price)}
          </span>
        </div>
        <div className="flex gap-1.75 mt-2.75 flex-wrap">
          {r.tags.map((t) => (
            <span
              key={t}
              className="bg-white/20 backdrop-blur-sm px-2.75 py-1 rounded-full text-xs font-semibold"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type SwipeScreenProps = {
  /** real room code, shown in the header */
  code: string;
  /** shared immutable deck — same cards/order for everyone */
  deck: Restaurant[];
  players: Player[];
  /** restaurantId → uids that liked it (realtime) */
  likes: Record<string, string[]>;
  /** uid → swipe cursor (realtime) */
  progress: Record<string, number>;
  myUid: string;
  /** resume position — where this player left off */
  startCursor: number;
  reduced: boolean;
  /** report each decision up so the app writes the like + progress to RTDB */
  onDecide: (restaurant: Restaurant, liked: boolean, nextCursor: number) => void;
};

export function SwipeScreen({
  code,
  deck,
  players,
  likes,
  progress,
  myUid,
  startCursor,
  reduced,
  onDecide,
}: SwipeScreenProps) {
  const [idx, setIdx] = useState(startCursor);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [exiting, setExiting] = useState<Exiting | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const busy = useRef(false);

  const current = deck[idx];

  // real friend progress: how many other players have already swiped past this card
  const others = players.filter((p) => p.id !== myUid);
  const friendsHere = others.filter((p) => (progress[p.id] ?? 0) > idx).length;
  // real teaser: how many people have liked the CURRENT card so far
  const likeTeaser = current ? (likes[current.id]?.length ?? 0) : 0;
  const nearEnd = idx >= deck.length - 3;

  function decide(dir: number) {
    // dir > 0 like, dir < 0 pass
    if (busy.current || !current) return;
    busy.current = true;
    buzz(dir > 0 ? 18 : 8);
    const isLike = dir > 0;
    const next = idx + 1;
    setExiting({ dir });
    // Report the vote immediately; the match (if any) arrives via the room
    // subscription — we never decide a match locally (wiki §2.5/§3.4).
    onDecide(current, isLike, next);
    setTimeout(
      () => {
        setExiting(null);
        setDrag(null);
        setIdx(next);
        busy.current = false;
      },
      reduced ? 140 : 420,
    );
  }

  // pointer drag
  function onDown(e: React.PointerEvent<HTMLDivElement>) {
    if (busy.current) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, active: true });
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, active: true });
  }
  function onUp() {
    if (!startRef.current) return;
    const dx = drag ? drag.x : 0;
    startRef.current = null;
    if (Math.abs(dx) > 95) decide(dx > 0 ? 1 : -1);
    else setDrag({ x: 0, active: false });
  }

  return (
    <Screen bg="var(--cream)">
      {/* ── realtime header ── */}
      <div className="pt-13 px-4.5 pb-2.5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg font-semibold text-ink">
            ห้อง <span className="text-cta">#{code}</span>
          </span>
          {/* avatar row of everyone */}
          <div className="flex items-center">
            {players.map((p, i) => (
              <div key={p.id} className={cn(i && "-ml-2.5")}>
                <Avatar p={p} size={34} />
              </div>
            ))}
          </div>
        </div>

        {/* progress + teaser */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={idx} max={Math.max(deck.length, 1)} />
          </div>
          <span className="font-semibold text-[13px] text-ink-2 whitespace-nowrap">
            ใบ {Math.min(idx + 1, deck.length)}/{deck.length}
          </span>
        </div>
        <div className="mt-1.75 h-5 flex items-center gap-2">
          <span className="text-xs text-ink-3">
            {others.length > 0
              ? `เพื่อน ${friendsHere}/${others.length} คนปัดผ่านใบนี้แล้ว`
              : "รอเพื่อนเข้ามาปัด…"}
          </span>
          {likeTeaser >= 2 && (
            <span
              aria-live="polite"
              className={cn(
                "ml-auto font-bold text-xs text-cta bg-[rgba(255,90,60,0.12)] px-2.5 py-0.75 rounded-full",
                !reduced && "animate-pop",
              )}
            >
              🔥 {likeTeaser} คนชอบร้านนี้!
            </span>
          )}
        </div>
      </div>

      {/* ── card stack ── */}
      <div className="flex-1 relative mx-4.5 mt-1.5 min-h-0">
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={cn(
            "absolute inset-0 touch-none",
            drag?.active ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          {current ? (
            [2, 1, 0].map((d) => {
              const ci = idx + d;
              if (ci >= deck.length) return null;
              return (
                <SwipeCard
                  key={deck[ci].id}
                  r={deck[ci]}
                  depth={d}
                  top={d === 0}
                  drag={d === 0 ? drag : null}
                  exiting={d === 0 ? exiting : null}
                />
              );
            })
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center text-ink-3">
              <span className="text-[44px]">🍽️</span>
              <span className="font-display text-[17px] font-semibold text-ink-2">
                ปัดครบทุกใบแล้ว
              </span>
              <span className="text-[13.5px]">กำลังรอเพื่อนปัดให้ครบ…</span>
            </div>
          )}
        </div>
      </div>

      {/* "กำลังจับคู่…" radar when near end */}
      {nearEnd && (
        <div aria-live="polite" className="shrink-0 flex justify-center mt-2">
          <span className="font-display inline-flex items-center gap-2.25 font-medium text-sm text-cta bg-white/80 px-4 py-1.75 rounded-full shadow-soft">
            <span className="relative w-3 h-3 inline-block">
              <span className="absolute inset-0 rounded-full bg-cta" />
              <span
                className={cn(
                  "absolute inset-0 rounded-full border-2 border-cta",
                  !reduced && "animate-pulse-ring",
                )}
              />
            </span>
            กำลังจับคู่ความอยากของทุกคน…
          </span>
        </div>
      )}

      {/* ── thumb-zone actions ── */}
      <div className="shrink-0 pt-3.5 px-6 pb-[max(20px,env(safe-area-inset-bottom))] flex items-center justify-center gap-10">
        <RoundButton kind="pass" onClick={() => decide(-1)} />
        <RoundButton kind="like" onClick={() => decide(1)} big />
      </div>
    </Screen>
  );
}
