"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  CircleIcon,
  ExportIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/utils/cn";
import type { Player } from "@/lib/types";

type LobbyScreenProps = {
  players: Player[];
  /** my uid — used to find which row is me */
  me: string | null;
  onStart: () => void;
  onReady: (ready: boolean) => void;
  onLeave: () => void;
  reduced: boolean;
  /** Real room code from RTDB */
  code?: string;
  /** Human-readable room-settings tags built from RoomFilters */
  roomSettings?: string[];
};

const DEFAULT_SETTINGS = [
  "📍 2 กม.",
  "฿–฿฿",
  "อีสาน",
  "ญี่ปุ่น",
  "เปิดอยู่ตอนนี้",
];

export function LobbyScreen({
  players,
  me,
  onStart,
  onReady,
  onLeave,
  reduced,
  code: roomCode,
  roomSettings,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const code = roomCode ?? "";

  const myPlayer = players.find((p) => p.id === me);
  const isHost = myPlayer?.host ?? false;
  const meReady = myPlayer?.ready ?? false;
  const onlineCount = players.filter((p) => p.connected).length;
  // need at least 2 voters to start a group round (wiki §2.3)
  const canStart = players.length >= 2;

  function share() {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/j/${code}`
        : code;
    if (navigator.share) {
      navigator
        .share({
          title: "เข้าห้องกินไรดี",
          text: `โค้ดห้อง: ${code}`,
          url: link,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setCopied(true);
    buzz(12);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Screen bg="var(--cream-2)">
      <button
        className="rm-tap font-display absolute top-12.5 left-4 z-5 border-none bg-white/80 text-ink-3 font-semibold text-[13px] py-1.75 px-3.25 rounded-full cursor-pointer shadow-soft inline-flex items-center gap-1"
        onClick={onLeave}
      >
        <ArrowLeftIcon size={14} weight="bold" /> ออก
      </button>
      <div className="shrink-0 pt-13.5 px-5.5 pb-0 text-center">
        <div className="text-sm text-ink-3 font-semibold">
          ห้องของคุณ · รอเพื่อนเข้ามา
        </div>
        {/* big code */}
        <div
          className="font-display text-[64px] font-bold text-cta leading-[1.1] mt-1 tracking-[8px]"
        >
          {code}
        </div>
        <button
          className={cn(
            "rm-tap font-display mt-1 inline-flex items-center gap-2 border-none font-semibold text-sm py-2.25 px-4.5 rounded-full cursor-pointer transition-all duration-200",
            copied ? "bg-good text-white" : "bg-[rgba(255,90,60,0.12)] text-cta"
          )}
          onClick={share}
        >
          {copied ? (
            <>
              <CheckIcon size={16} weight="bold" /> คัดลอกลิงก์แล้ว
            </>
          ) : (
            <>
              <ExportIcon size={16} weight="bold" /> แชร์ลิงก์เชิญ
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 pb-3">
        {/* live players */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-display text-[17px] font-semibold text-ink"
          >
            ผู้เล่นในห้อง
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-good">
            <span
              className={cn(
                "w-2 h-2 rounded-full bg-good",
                !reduced && "animate-[rmHeartbeat_1.4s_infinite]"
              )}
            />
            {onlineCount} ออนไลน์
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {players.map((p) => {
            const isReady = p.ready;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 bg-white rounded-[18px] py-2.75 px-3.5 shadow-soft",
                  !reduced && "animate-[rmDropIn_.45s_cubic-bezier(.34,1.5,.5,1)]"
                )}
              >
                <Avatar p={p} size={44} check={isReady} />
                <div className="flex-1">
                  <div
                    className="font-display text-base font-semibold text-ink"
                  >
                    {p.name}{" "}
                    {p.me && (
                      <span className="text-ink-3 text-[13px]">
                        (คุณ)
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-xs font-semibold inline-flex items-center gap-0.75",
                      !p.connected || !isReady ? "text-ink-3" : "text-good"
                    )}
                  >
                    {!p.connected ? (
                      <>
                        <CircleIcon size={11} weight="bold" /> ออฟไลน์
                      </>
                    ) : isReady ? (
                      <>
                        <CheckIcon size={11} weight="bold" /> พร้อมแล้ว
                      </>
                    ) : (
                      "กำลังเลือก…"
                    )}
                  </div>
                </div>
                {p.host && (
                  <span className="text-[11.5px] font-bold text-amber bg-[rgba(255,182,39,0.16)] py-1 px-2.5 rounded-full">
                    👑 โฮสต์
                  </span>
                )}
              </div>
            );
          })}
          {/* waiting ghost slot */}
          {players.length < 2 && (
            <div className="flex items-center gap-3 border-2 border-dashed border-line-strong rounded-[18px] py-2.75 px-3.5">
              <div className="w-11 h-11 rounded-full bg-cream-3 flex items-center justify-center">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full bg-ink-3 [box-shadow:10px_0_var(--ink-3),-10px_0_var(--ink-3)]",
                    !reduced && "animate-[rmHeartbeat_1.2s_infinite]"
                  )}
                />
              </div>
              <span className="text-[13.5px] text-ink-3">
                รอเพื่อนเข้าห้อง…
              </span>
            </div>
          )}
        </div>

        {/* room settings */}
        <div className="mt-4.5 bg-white/70 rounded-[18px] py-3.5 px-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="font-display text-sm font-semibold text-ink"
            >
              ตั้งค่าห้อง
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-cta font-semibold">
              โฮสต์แก้ได้ <PencilSimpleIcon size={12} weight="bold" />
            </span>
          </div>
          <div className="flex flex-wrap gap-1.75">
            {(roomSettings ?? DEFAULT_SETTINGS).map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 bg-white py-1.5 px-3 rounded-full shadow-soft"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* thumb-zone: ready + start */}
      <div className="shrink-0 pt-3 px-5.5 pb-[max(20px,env(safe-area-inset-bottom))] flex gap-3">
        <button
          className={cn(
            "rm-btn rm-tap font-display flex-1 min-h-14.5 rounded-full font-semibold text-lg cursor-pointer transition-all duration-150",
            meReady
              ? "border-none bg-good text-white"
              : "border-2 border-solid border-good bg-white/70 text-good"
          )}
          onClick={() => {
            onReady(!meReady);
            buzz(14);
          }}
        >
          {meReady ? (
            <span className="inline-flex items-center justify-center gap-1.5">
              <CheckIcon size={18} weight="bold" /> พร้อมแล้ว
            </span>
          ) : (
            "พร้อม"
          )}
        </button>
        <div className="[flex:1.3]">
          {isHost ? (
            <PrimaryButton
              disabled={!canStart}
              onClick={onStart}
              ariaLabel="เริ่มเกม"
            >
              {canStart ? "เริ่มเกม 🚀" : `รออีก ${2 - players.length} คน`}
            </PrimaryButton>
          ) : (
            <PrimaryButton disabled ariaLabel="รอโฮสต์เริ่มเกม">
              {canStart ? "รอโฮสต์เริ่ม…" : `รออีก ${2 - players.length} คน`}
            </PrimaryButton>
          )}
        </div>
      </div>
    </Screen>
  );
}
