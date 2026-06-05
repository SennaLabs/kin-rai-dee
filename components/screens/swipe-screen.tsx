"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { RoundButton } from "@/components/ui/buttons";
import { FoodPhoto } from "@/components/ui/food-photo";
import { buzz } from "@/components/ui/motion";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Screen } from "@/components/ui/screen";
import { Stars } from "@/components/ui/stars";
import { priceStr } from "@/lib/data";
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
      style={{
        position: "absolute",
        inset: 0,
        transform,
        transition,
        zIndex: 30 - depth,
        willChange: "transform",
        borderRadius: 28,
        overflow: "hidden",
        background: "#fff",
        boxShadow: top
          ? "0 20px 44px rgba(43,27,23,0.26)"
          : "0 12px 28px rgba(43,27,23,0.14)",
        border: "1px solid rgba(255,255,255,0.6)",
      }}
    >
      {/* photo area */}
      <div style={{ position: "absolute", inset: 0 }}>
        <FoodPhoto r={r} big />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 38%, rgba(43,27,23,0.06) 56%, rgba(43,27,23,0.82) 100%)",
          }}
        />
      </div>

      {/* open-now badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          gap: 8,
        }}
      >
        <span
          style={{
            background: r.open ? "rgba(30,158,106,0.95)" : "rgba(43,27,23,0.7)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 12.5,
            padding: "5px 11px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{ width: 7, height: 7, borderRadius: 9, background: "#fff" }}
          />
          {r.open ? "เปิดอยู่" : "ปิดแล้ว"}
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "var(--ink)",
            fontWeight: 700,
            fontSize: 12.5,
            padding: "5px 11px",
            borderRadius: 999,
          }}
        >
          {r.dist} กม.
        </span>
      </div>

      {/* LIKE / PASS stamps */}
      <div
        style={{
          position: "absolute",
          top: 26,
          right: 18,
          transform: "rotate(12deg)",
          opacity: top && liked ? stampOpacity : 0,
          transition: drag && drag.active ? "none" : "opacity .2s",
          border: "4px solid #fff",
          color: "#fff",
          borderRadius: 14,
          padding: "6px 16px",
          background: "rgba(230,57,70,0.9)",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 26,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        ชอบ ❤️
      </div>
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 18,
          transform: "rotate(-12deg)",
          opacity: top && drag && drag.x < 0 ? stampOpacity : 0,
          transition: drag && drag.active ? "none" : "opacity .2s",
          border: "4px solid #fff",
          color: "#fff",
          borderRadius: 14,
          padding: "6px 16px",
          background: "rgba(43,27,23,0.78)",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 26,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        ✕ ผ่าน
      </div>

      {/* info */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "0 20px 22px",
          color: "#fff",
        }}
      >
        <div
          className="font-display"
          style={{
            fontSize: 30,
            fontWeight: 600,
            lineHeight: 1.12,
            textShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }}
        >
          {r.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <Stars value={r.rating} size={15} color="#FFC845" /> {r.rating}
          </span>
          <span style={{ opacity: 0.85, fontSize: 14 }}>
            ({r.reviews.toLocaleString()})
          </span>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#FFD9A8" }}>
            {priceStr(r.price)}
          </span>
        </div>
        <div
          style={{ display: "flex", gap: 7, marginTop: 11, flexWrap: "wrap" }}
        >
          {r.tags.map((t) => (
            <span
              key={t}
              style={{
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(4px)",
                padding: "4px 11px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 600,
              }}
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
      <div style={{ padding: "52px 18px 10px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span
            className="font-display"
            style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)" }}
          >
            ห้อง <span style={{ color: "var(--cta)" }}>#{code}</span>
          </span>
          {/* avatar row of everyone */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {players.map((p, i) => (
              <div key={p.id} style={{ marginLeft: i ? -10 : 0 }}>
                <Avatar p={p} size={34} />
              </div>
            ))}
          </div>
        </div>

        {/* progress + teaser */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <ProgressBar value={idx} max={deck.length} />
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "var(--ink-2)",
              whiteSpace: "nowrap",
            }}
          >
            ใบ {Math.min(idx + 1, deck.length)}/{deck.length}
          </span>
        </div>
        <div
          style={{
            marginTop: 7,
            height: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
            {others.length > 0
              ? `เพื่อน ${friendsHere}/${others.length} คนปัดผ่านใบนี้แล้ว`
              : "รอเพื่อนเข้ามาปัด…"}
          </span>
          {likeTeaser >= 2 && (
            <span
              aria-live="polite"
              style={{
                marginLeft: "auto",
                fontWeight: 700,
                fontSize: 12.5,
                color: "var(--cta)",
                background: "rgba(255,90,60,0.12)",
                padding: "3px 10px",
                borderRadius: 999,
                animation: reduced ? "none" : "rmPop .4s ease",
              }}
            >
              🔥 {likeTeaser} คนชอบร้านนี้!
            </span>
          )}
        </div>
      </div>

      {/* ── card stack ── */}
      <div style={{ flex: 1, position: "relative", margin: "6px 18px 0", minHeight: 0 }}>
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            position: "absolute",
            inset: 0,
            touchAction: "none",
            cursor: drag?.active ? "grabbing" : "grab",
          }}
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
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                textAlign: "center",
                color: "var(--ink-3)",
              }}
            >
              <span style={{ fontSize: 44 }}>🍽️</span>
              <span className="font-display" style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-2)" }}>
                ปัดครบทุกใบแล้ว
              </span>
              <span style={{ fontSize: 13.5 }}>กำลังรอเพื่อนปัดให้ครบ…</span>
            </div>
          )}
        </div>
      </div>

      {/* "กำลังจับคู่…" radar when near end */}
      {nearEnd && (
        <div
          aria-live="polite"
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <span
            className="font-display"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              fontWeight: 500,
              fontSize: 14,
              color: "var(--cta)",
              background: "rgba(255,255,255,0.8)",
              padding: "7px 16px",
              borderRadius: 999,
              boxShadow: "var(--sh-soft)",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 12,
                height: 12,
                display: "inline-block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "var(--cta)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid var(--cta)",
                  animation: reduced ? "none" : "rmPulseRing 1.4s ease-out infinite",
                }}
              />
            </span>
            กำลังจับคู่ความอยากของทุกคน…
          </span>
        </div>
      )}

      {/* ── thumb-zone actions ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "14px 24px max(20px, env(safe-area-inset-bottom))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <RoundButton kind="pass" onClick={() => decide(-1)} />
        <RoundButton kind="like" onClick={() => decide(1)} big />
      </div>
    </Screen>
  );
}
