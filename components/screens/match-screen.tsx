"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { Confetti } from "@/components/ui/confetti";
import { FoodPhoto } from "@/components/ui/food-photo";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils/cn";
import { priceStr } from "@/lib/data";
import type { Player, Restaurant } from "@/lib/types";

const ITEM_H = 150;

function ReelItem({ r }: { r: Restaurant }) {
  return (
    <div
      className="flex items-center gap-4 px-5.5 box-border"
      style={{ height: ITEM_H }}
    >
      <div className="w-24 h-24 rounded-[22px] overflow-hidden shrink-0 shadow-[0_8px_18px_rgba(43,27,23,0.18)]">
        <FoodPhoto r={r} label={false} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[25px] font-semibold text-ink leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis">
          {r.name}
        </div>
        <div className="flex items-center gap-2 mt-1.5 font-semibold text-sm text-ink-2">
          <Stars value={r.rating} size={14} /> {r.rating}
          <span className="text-ink-3">·</span> {priceStr(r.price)}
          <span className="text-ink-3">·</span> {r.dist} กม.
        </div>
      </div>
    </div>
  );
}

type MatchScreenProps = {
  winner: Restaurant;
  candidates: Restaurant[];
  players: Player[];
  onOpen: () => void;
  onAgain: () => void;
  onHome: () => void;
  reduced: boolean;
  confetti?: boolean;
  canRestart?: boolean;
};

export function MatchScreen({
  winner,
  candidates,
  players,
  onOpen,
  onAgain,
  onHome,
  reduced,
  confetti = true,
  canRestart = true,
}: MatchScreenProps) {
  // phase: matching → spinning → revealed
  const [phase, setPhase] = useState<"matching" | "spinning" | "revealed">(
    "matching",
  );
  const [offset, setOffset] = useState(0);
  const [trans, setTrans] = useState("none");

  // Build the reel once (stable for the component's life): several loops of the
  // candidate pool, ending on the winner.
  const [{ seq, winnerIndex }] = useState(() => {
    const pool = candidates && candidates.length ? candidates.slice() : [winner];
    if (!pool.find((x) => x.id === winner.id)) pool.push(winner);
    const built: Restaurant[] = [];
    const loops = 5;
    for (let l = 0; l < loops; l++) {
      for (const r of pool) built.push(r);
    }
    // ensure the final visible item is the winner
    built.push(winner);
    return { seq: built, winnerIndex: built.length - 1 };
  });

  useEffect(() => {
    if (reduced) {
      // reduced motion: short radar then straight reveal, no spin
      const t1 = setTimeout(() => {
        setOffset(winnerIndex * ITEM_H);
        setPhase("revealed");
      }, 700);
      return () => clearTimeout(t1);
    }
    const t1 = setTimeout(() => {
      setPhase("spinning");
      // kick the reel to the winner with a long decelerating ease
      setTrans("transform 2.4s cubic-bezier(.12,.7,.18,1)");
      requestAnimationFrame(() => setOffset(winnerIndex * ITEM_H));
    }, 1500);
    const t2 = setTimeout(() => {
      setPhase("revealed");
      buzz(40);
    }, 1500 + 2450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen
      bg="linear-gradient(180deg, #FF6B4A 0%, #E63946 60%, #D7263D 100%)"
      style={{ color: "#fff" }}
    >
      <Confetti fire={phase === "revealed" && confetti} reduced={reduced} />

      {/* glowing rings backdrop */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-115 h-115 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border-2 border-white/[0.16]"
            style={{ inset: i * 46 }}
          />
        ))}
      </div>

      {/* ── header / status ── */}
      <div className="shrink-0 pt-15 px-6 pb-0 text-center relative z-5">
        {phase !== "revealed" ? (
          <div>
            {/* radar around avatars */}
            <div className="flex justify-center gap-3.5 mb-5.5">
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "relative",
                    !reduced && "animate-[rmHeartbeat_1.3s_ease-in-out_infinite]",
                  )}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <Avatar p={p} size={46} ring />
                  <span
                    className={cn(
                      "absolute -inset-1.5 rounded-full border-2 border-white/50",
                      !reduced && "animate-[rmPulseRing_1.5s_ease-out_infinite]",
                    )}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                </div>
              ))}
            </div>
            <div className="font-display text-[27px] font-semibold tracking-[0.3px]">
              กำลังจับคู่ความอยาก…
            </div>
            <div className="text-[15px] opacity-85 mt-1">
              ทุกคนเล็งร้านเดียวกันแล้ว 👀
            </div>
          </div>
        ) : (
          <div
            className={cn(
              !reduced && "animate-[rmBounceIn_.6s_cubic-bezier(.34,1.56,.5,1)]",
            )}
          >
            <div className="text-[50px] mb-0.5">🎉</div>
            <div className="font-display text-[52px] font-bold leading-none [text-shadow:0_4px_0_rgba(0,0,0,0.12)]">
              แมตช์แล้ว!
            </div>
            <div className="text-[15.5px] opacity-[0.92] mt-2">
              ทุกคนชอบร้านนี้ตรงกัน 🙌
            </div>
          </div>
        )}
      </div>

      {/* ── slot reel / winner card ── */}
      <div className="flex-1 flex items-center justify-center py-3.5 px-4.5 relative z-5 min-h-0">
        {phase !== "revealed" ? (
          // SLOT MACHINE WINDOW
          <div
            className="w-full rounded-lg bg-white overflow-hidden relative shadow-[0_22px_50px_rgba(43,27,23,0.34),inset_0_0_0_4px_rgba(255,255,255,0.6)]"
            style={{ height: ITEM_H }}
          >
            <div style={{ transform: `translateY(${-offset}px)`, transition: trans }}>
              {seq.map((r, i) => (
                <ReelItem key={i} r={r} />
              ))}
            </div>
            {/* center highlight + edge fades */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_28px_26px_-22px_rgba(255,255,255,0.95),inset_0_-28px_26px_-22px_rgba(255,255,255,0.95)]" />
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-px bg-[linear-gradient(90deg,transparent,rgba(255,90,60,0.5),transparent)]" />
          </div>
        ) : (
          // WINNER CARD
          <div
            className={cn(
              "w-full",
              !reduced &&
                "animate-[rmDropIn_.5s_cubic-bezier(.34,1.5,.5,1)_.1s_both]",
            )}
          >
            <div className="rounded-[28px] overflow-hidden bg-white shadow-[0_24px_54px_rgba(43,27,23,0.4)]">
              <div className="h-47 relative">
                <FoodPhoto r={winner} big label={false} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(43,27,23,0.78))]" />
                <div className="absolute top-3.5 left-3.5 bg-[rgba(255,200,69,0.96)] text-ink font-display font-semibold text-[13px] py-1.25 px-3 rounded-full">
                  🏆 ร้านที่ชนะ
                </div>
                <div className="absolute left-4.5 right-4.5 bottom-3.5 text-white">
                  <div className="font-display text-[28px] font-semibold leading-[1.1]">
                    {winner.name}
                  </div>
                  <div className="flex items-center gap-2.25 mt-1.5 font-semibold text-sm">
                    <Stars value={winner.rating} size={14} color="#FFC845" />{" "}
                    {winner.rating}
                    <span className="opacity-70">·</span> {priceStr(winner.price)}
                    <span className="opacity-70">·</span> {winner.dist} กม.
                  </div>
                </div>
              </div>
              {/* everyone liked row */}
              <div className="py-3.25 px-4.5 flex items-center gap-2.5">
                <div className="flex">
                  {players.map((p, i) => (
                    <div key={p.id} className={cn(i ? "-ml-2.25" : "ml-0")}>
                      <Avatar p={p} size={32} />
                    </div>
                  ))}
                </div>
                <span className="font-semibold text-[13.5px] text-ink-2">
                  ทุกคนปัด “ชอบ” ❤️
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── actions ── */}
      <div className="shrink-0 pt-1.5 px-5.5 pb-[max(20px,env(safe-area-inset-bottom))] relative z-5">
        {phase === "revealed" ? (
          <div
            className={cn(
              "flex flex-col gap-2.75",
              !reduced && "animate-[rmRise_.5s_ease_.25s_both]",
            )}
          >
            <PrimaryButton
              color="linear-gradient(180deg,#fff,#FFF1E8)"
              className="text-cta"
              onClick={onOpen}
            >
              <span className="inline-flex items-center justify-center gap-2">
                ดูอันดับทั้งหมด <ArrowRightIcon size={20} weight="bold" />
              </span>
            </PrimaryButton>
            <button
              className={cn(
                "rm-tap font-display bg-transparent border-none text-white font-medium text-[15px] p-2",
                canRestart
                  ? "cursor-pointer opacity-[0.92]"
                  : "cursor-not-allowed opacity-45"
              )}
              onClick={onAgain}
              disabled={!canRestart}
            >
              หาร้านอื่นต่อ
            </button>
            {!canRestart && (
              <p className="m-0 text-center text-[13px] text-white/75 font-semibold">
                ต้องมีอย่างน้อย 2 คน
              </p>
            )}
            <button
              className="rm-tap font-display bg-transparent border-none text-white font-normal text-sm cursor-pointer py-1 px-2 opacity-70"
              onClick={onHome}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <ArrowLeftIcon size={16} weight="bold" /> กลับหน้าหลัก
              </span>
            </button>
          </div>
        ) : (
          <div className="h-23" />
        )}
      </div>
    </Screen>
  );
}
