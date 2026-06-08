"use client";

import { ArrowsClockwiseIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/utils/cn";
import type { Player } from "@/lib/types";

type NoMatchScreenProps = {
  players: Player[];
  onNewGame: () => void;
  onRegenerate: () => void;
  onAdjust: () => void;
  reduced: boolean;
};

export function NoMatchScreen({
  players,
  onNewGame,
  onRegenerate,
  onAdjust,
  reduced,
}: NoMatchScreenProps) {
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
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {players.map((p) => (
            <span
              key={p.id}
              className="bg-white rounded-full py-1.75 px-3 shadow-card text-ink-2 font-bold text-[13px]"
            >
              {p.emoji} {p.name}
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 pt-3 px-6 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-2.5">
        <PrimaryButton onClick={onNewGame}>เริ่มเกมใหม่</PrimaryButton>
        <button
          className="rm-tap font-display min-h-12 rounded-pill bg-white border-2 border-line-strong text-ink font-bold text-sm cursor-pointer"
          onClick={onRegenerate}
        >
          <span className="inline-flex items-center justify-center gap-2">
            สุ่มร้านชุดใหม่ <ArrowsClockwiseIcon size={18} weight="bold" />
          </span>
        </button>
        <button
          className="rm-tap font-display bg-transparent border-none text-ink-2 font-medium text-[14.5px] cursor-pointer p-1.5"
          onClick={onAdjust}
        >
          <span className="inline-flex items-center justify-center gap-1.75">
            ปรับเงื่อนไขแล้วลองใหม่ <SlidersHorizontalIcon size={17} weight="bold" />
          </span>
        </button>
      </div>
    </Screen>
  );
}
