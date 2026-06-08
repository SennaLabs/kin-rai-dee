"use client";

import { useRef, useState } from "react";
import {
  CaretLeftIcon,
  CheckIcon,
  CircleIcon,
  ExportIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/utils/cn";
import type { Player } from "@/lib/types";

type LobbyScreenProps = {
  players: Player[];
  /** my uid — used to find which row is me */
  me: string | null;
  onStart: () => void | Promise<void>;
  onReady: (ready: boolean) => void | Promise<void>;
  onLeave: () => void;
  reduced: boolean;
  /** Real room code from RTDB */
  code?: string;
  /** Human-readable room-settings tags built from RoomFilters */
  roomSettings: string[];
  onEditSettings?: () => void;
  onEditProfile?: () => void;
};

export function LobbyScreen({
  players,
  me,
  onStart,
  onReady,
  onLeave,
  reduced,
  code: roomCode,
  roomSettings,
  onEditSettings,
  onEditProfile,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const [readyBusy, setReadyBusy] = useState(false);
  const readyRef = useRef(false);
  const code = roomCode ?? "";

  const myPlayer = players.find((p) => p.id === me);
  const isHost = myPlayer?.host ?? false;
  const meReady = myPlayer?.ready ?? false;
  const hostName = players.find((p) => p.host)?.name ?? "";
  const onlineCount = players.filter((p) => p.connected).length;
  // need at least 2 voters to start a group round (wiki §2.3)
  const enoughPlayers = onlineCount >= 2;
  // host may only start once every other online player has pressed ready
  const pendingReady = players.filter(
    (p) => p.connected && !p.host && !p.ready
  ).length;
  const canStart = enoughPlayers && pendingReady === 0;

  async function handleStart() {
    if (startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    try {
      await onStart();
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  }

  async function handleReady(next: boolean) {
    if (readyRef.current) return;
    readyRef.current = true;
    setReadyBusy(true);
    try {
      await onReady(next);
    } finally {
      readyRef.current = false;
      setReadyBusy(false);
    }
  }

  function share() {
    const link =
      typeof window !== "undefined" ? `${window.location.origin}/j/${code}` : code;
    if (navigator.share) {
      navigator
        .share({ title: "เข้าห้องกินไรดี", text: `โค้ดห้อง: ${code}`, url: link })
        .catch(() => {});
      buzz(12);
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      buzz(12);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <Screen bg="var(--cream-2)">
      <button
        className="rm-tap flex items-center justify-center shrink-0 size-10.5 rounded-full bg-white/80 shadow-[0_4px_12px_rgba(43,27,23,0.1)] cursor-pointer absolute top-12.5 left-4 z-5"
        aria-label="ออก"
        onClick={() => setConfirmLeave(true)}
      >
        <CaretLeftIcon size={20} weight="bold" color="var(--ink)" />
      </button>
      <div className="shrink-0 pt-13.5 px-5.5 pb-0 text-center">
        <div className="text-sm text-ink-3 font-semibold">
          {isHost
            ? "ห้องของคุณ · รอเพื่อนเข้ามา"
            : hostName
              ? `ห้องของ ${hostName}`
              : "เข้าร่วมห้องแล้ว"}
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
                      p.connected && (isReady || p.host) ? "text-good" : "text-ink-3"
                    )}
                  >
                    {!p.connected ? (
                      <>
                        <CircleIcon size={11} weight="bold" /> ออฟไลน์
                      </>
                    ) : p.host ? (
                      <>
                        <CheckIcon size={11} weight="bold" /> พร้อมเริ่ม
                      </>
                    ) : isReady ? (
                      <>
                        <CheckIcon size={11} weight="bold" /> พร้อมแล้ว
                      </>
                    ) : (
                      "ยังไม่พร้อม"
                    )}
                  </div>
                </div>
                {p.host && (
                  <span className="text-[11.5px] font-bold text-amber bg-[rgba(255,182,39,0.16)] py-1 px-2.5 rounded-full">
                    👑 โฮสต์
                  </span>
                )}
                {p.me && (p.host || !isReady) && (
                  <button
                    className="rm-tap flex items-center justify-center shrink-0 size-9 rounded-full bg-cream-3 text-ink cursor-pointer border-none"
                    aria-label="แก้ไขโปรไฟล์"
                    onClick={() => onEditProfile?.()}
                  >
                    <PencilSimpleIcon size={15} weight="bold" />
                  </button>
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
            {isHost && (
              <button
                className="rm-tap inline-flex items-center gap-1 text-xs text-cta font-semibold border-none bg-transparent cursor-pointer"
                onClick={() => onEditSettings?.()}
              >
                <PencilSimpleIcon size={12} weight="bold" /> แก้ไข
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.75">
            {roomSettings.map((t, i) => (
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

      <div className="shrink-0 pt-3 px-5.5 pb-[max(20px,env(safe-area-inset-bottom))]">
        {isHost ? (
          <PrimaryButton
            disabled={!canStart || starting}
            onClick={handleStart}
            ariaLabel="เริ่มเกม"
          >
            {!enoughPlayers
              ? `รออีก ${2 - onlineCount} คน`
              : pendingReady > 0
                ? `รออีก ${pendingReady} คนกดพร้อม`
                : "เริ่มเกม"}
          </PrimaryButton>
        ) : (
          <>
            <button
              className={cn(
                "rm-btn rm-tap font-display w-full min-h-14.5 rounded-full font-semibold text-lg cursor-pointer transition-all duration-150",
                meReady
                  ? "border-none bg-good text-white"
                  : "border-2 border-solid border-good bg-white/70 text-good"
              )}
              disabled={readyBusy}
              onClick={() => {
                handleReady(!meReady);
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
            <p className="m-0 mt-2 text-center text-[13px] text-ink-3 font-semibold">
              {enoughPlayers ? "รอโฮสต์เริ่มเกม" : `รออีก ${2 - onlineCount} คน`}
            </p>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title="ออกจากห้อง?"
        message={isHost ? "ถ้าออกตอนนี้ ห้องจะถูกปิดหรือโอนให้เพื่อนที่อยู่ต่อ" : "ออกจากห้องนี้แล้วกลับหน้าแรก"}
        confirmLabel="ออก"
        cancelLabel="อยู่ต่อ"
        danger
        reduced={reduced}
        onConfirm={() => { setConfirmLeave(false); onLeave(); }}
        onCancel={() => setConfirmLeave(false)}
      />
    </Screen>
  );
}
