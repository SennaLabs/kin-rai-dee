"use client";

import { useRef, useState } from "react";
import { ArrowsClockwiseIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/utils/cn";
import type { Player } from "@/lib/types";

type NoMatchScreenProps = {
  players: Player[];
  isHost: boolean;
  canRestart?: boolean;
  onNewGame: () => void;
  onRegenerate: () => void | Promise<void>;
  onAdjust: () => void;
  onLeave: () => void;
  reduced: boolean;
};

export function NoMatchScreen({
  players,
  isHost,
  canRestart = true,
  onNewGame,
  onRegenerate,
  onAdjust,
  onLeave,
  reduced,
}: NoMatchScreenProps) {
  const [regenerating, setRegenerating] = useState(false);
  const regenRef = useRef(false);

  async function handleRegenerate() {
    if (regenRef.current) return;
    regenRef.current = true;
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      regenRef.current = false;
      setRegenerating(false);
    }
  }

  return (
    <Screen bg="var(--cream-2)">
      <div className="shrink-0 pt-15 px-6 pb-0 text-center">
        <div className={cn("text-[54px]", !reduced && "animate-[rmFloat_3.4s_ease-in-out_infinite]")}>
          🫥
        </div>
        <h1 className="font-display mt-3 text-[26px] font-bold text-ink leading-[1.2]">
          ยังไม่มีร้านที่ทุกคนถูกใจตรงกัน
        </h1>
        <p className="mt-2 text-sm text-ink-2 leading-[1.45]">
          ทุกคนปัดครบแล้ว แต่ยังไม่มีร้านไหนได้ใจใครเลย
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center py-4.5 px-7">
        <div className="flex items-end justify-center gap-x-4 gap-y-3 flex-wrap max-w-[280px]">
          {players.map((p, i) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(!reduced && "animate-[rmBob_2.8s_ease-in-out_infinite]")}
                style={reduced ? undefined : { animationDelay: `${-i * 0.45}s` }}
              >
                <Avatar p={p} size={56} />
              </div>
              <span className="max-w-16 truncate text-center text-[12.5px] font-bold text-ink-2">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 pt-3 px-6 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-2.5">
        {isHost ? (
          <>
            <PrimaryButton onClick={onNewGame}>เริ่มเกมใหม่</PrimaryButton>
            <button
              className={cn(
                "rm-tap font-display min-h-12 rounded-pill bg-white border-2 border-line-strong font-bold text-sm",
                canRestart && !regenerating
                  ? "text-ink cursor-pointer"
                  : "text-ink-3 cursor-not-allowed opacity-60"
              )}
              onClick={handleRegenerate}
              disabled={!canRestart || regenerating}
            >
              <span className="inline-flex items-center justify-center gap-2">
                สุ่มร้านชุดใหม่ <ArrowsClockwiseIcon size={18} weight="bold" />
              </span>
            </button>
            <button
              className={cn(
                "rm-tap font-display bg-transparent border-none font-medium text-[14.5px] p-1.5",
                canRestart
                  ? "text-ink-2 cursor-pointer"
                  : "text-ink-3 cursor-not-allowed opacity-60"
              )}
              onClick={onAdjust}
              disabled={!canRestart}
            >
              <span className="inline-flex items-center justify-center gap-1.75">
                ปรับเงื่อนไขแล้วลองใหม่{" "}
                <SlidersHorizontalIcon size={17} weight="bold" />
              </span>
            </button>
            {!canRestart && (
              <p className="m-0 text-center text-[13px] text-ink-3 font-semibold">
                ต้องมีอย่างน้อย 2 คน
              </p>
            )}
          </>
        ) : (
          <>
            <p className="m-0 text-center text-sm text-ink-2 font-medium leading-[1.5]">
              รอโฮสต์สุ่มร้านชุดใหม่หรือปรับเงื่อนไข…
            </p>
            <button
              className="rm-tap font-display min-h-12 rounded-pill bg-white border-2 border-line-strong text-ink-2 font-bold text-sm cursor-pointer"
              onClick={onLeave}
            >
              ออกจากห้อง
            </button>
          </>
        )}
      </div>
    </Screen>
  );
}
