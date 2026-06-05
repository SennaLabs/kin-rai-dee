"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
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

const DEFAULT_SETTINGS = ["📍 2 กม.", "฿–฿฿", "อีสาน", "ญี่ปุ่น", "เปิดอยู่ตอนนี้"];

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
      typeof window !== "undefined" ? `${window.location.origin}/j/${code}` : code;
    if (navigator.share) {
      navigator
        .share({ title: "เข้าห้องกินไรดี", text: `โค้ดห้อง: ${code}`, url: link })
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
        className="rm-tap font-display"
        onClick={onLeave}
        style={{
          position: "absolute",
          top: 50,
          left: 16,
          zIndex: 5,
          border: "none",
          background: "rgba(255,255,255,0.8)",
          color: "var(--ink-3)",
          fontWeight: 600,
          fontSize: 13,
          padding: "7px 13px",
          borderRadius: 999,
          cursor: "pointer",
          boxShadow: "var(--sh-soft)",
        }}
      >
        ← ออก
      </button>
      <div style={{ flexShrink: 0, padding: "54px 22px 0", textAlign: "center" }}>
        <div
          style={{
            fontSize: 14,
            color: "var(--ink-3)",
            fontWeight: 600,
          }}
        >
          ห้องของคุณ · รอเพื่อนเข้ามา
        </div>
        {/* big code */}
        <div
          className="font-display"
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: 8,
            color: "var(--cta)",
            lineHeight: 1.1,
            marginTop: 4,
          }}
        >
          {code}
        </div>
        <button
          className="rm-tap font-display"
          onClick={share}
          style={{
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: copied ? "var(--good)" : "rgba(255,90,60,0.12)",
            color: copied ? "#fff" : "var(--cta)",
            fontWeight: 600,
            fontSize: 14,
            padding: "9px 18px",
            borderRadius: 999,
            cursor: "pointer",
            transition: "all .2s",
          }}
        >
          {copied ? (
            <>✓ คัดลอกลิงก์แล้ว</>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" />
              </svg>
              แชร์ลิงก์เชิญ
            </>
          )}
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "20px 20px 12px" }}>
        {/* live players */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span
            className="font-display"
            style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}
          >
            ผู้เล่นในห้อง
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--good)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9,
                background: "var(--good)",
                animation: reduced ? "none" : "rmHeartbeat 1.4s infinite",
              }}
            />
            {onlineCount} ออนไลน์
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {players.map((p) => {
            const isReady = p.ready;
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#fff",
                  borderRadius: 18,
                  padding: "11px 14px",
                  boxShadow: "var(--sh-soft)",
                  animation: reduced
                    ? "none"
                    : "rmDropIn .45s cubic-bezier(.34,1.5,.5,1)",
                }}
              >
                <Avatar p={p} size={44} check={isReady} />
                <div style={{ flex: 1 }}>
                  <div
                    className="font-display"
                    style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}
                  >
                    {p.name}{" "}
                    {p.me && (
                      <span style={{ color: "var(--ink-3)", fontSize: 13 }}>
                        (คุณ)
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: !p.connected
                        ? "var(--ink-3)"
                        : isReady
                          ? "var(--good)"
                          : "var(--ink-3)",
                      fontWeight: 600,
                    }}
                  >
                    {!p.connected
                      ? "⚪ ออฟไลน์"
                      : isReady
                        ? "✓ พร้อมแล้ว"
                        : "กำลังเลือก…"}
                  </div>
                </div>
                {p.host && (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "var(--amber)",
                      background: "rgba(255,182,39,0.16)",
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    👑 โฮสต์
                  </span>
                )}
              </div>
            );
          })}
          {/* waiting ghost slot */}
          {players.length < 2 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "2px dashed var(--line-strong)",
                borderRadius: 18,
                padding: "11px 14px",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--cream-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9,
                    background: "var(--ink-3)",
                    boxShadow: "10px 0 var(--ink-3), -10px 0 var(--ink-3)",
                    animation: reduced ? "none" : "rmHeartbeat 1.2s infinite",
                  }}
                />
              </div>
              <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
                รอเพื่อนเข้าห้อง…
              </span>
            </div>
          )}
        </div>

        {/* room settings */}
        <div
          style={{
            marginTop: 18,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 18,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              className="font-display"
              style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}
            >
              ตั้งค่าห้อง
            </span>
            <span
              style={{ fontSize: 12, color: "var(--cta)", fontWeight: 600 }}
            >
              โฮสต์แก้ได้ ✎
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {(roomSettings ?? DEFAULT_SETTINGS).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                  background: "#fff",
                  padding: "6px 12px",
                  borderRadius: 999,
                  boxShadow: "var(--sh-soft)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* thumb-zone: ready + start */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 22px max(20px, env(safe-area-inset-bottom))",
          display: "flex",
          gap: 12,
        }}
      >
        <button
          className="rm-btn rm-tap font-display"
          onClick={() => {
            onReady(!meReady);
            buzz(14);
          }}
          style={{
            flex: 1,
            minHeight: 58,
            borderRadius: 999,
            border: meReady ? "none" : "2px solid var(--good)",
            background: meReady ? "var(--good)" : "rgba(255,255,255,0.7)",
            color: meReady ? "#fff" : "var(--good)",
            fontWeight: 600,
            fontSize: 18,
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          {meReady ? "✓ พร้อมแล้ว" : "พร้อม"}
        </button>
        <div style={{ flex: 1.3 }}>
          {isHost ? (
            <PrimaryButton disabled={!canStart} onClick={onStart} ariaLabel="เริ่มเกม">
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
