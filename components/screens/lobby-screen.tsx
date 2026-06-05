"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
import type { Player } from "@/lib/types";

type LobbyScreenProps = {
  players: Player[];
  onStart: () => void;
  reduced: boolean;
};

const ROOM_SETTINGS = ["📍 2 กม.", "฿–฿฿", "อีสาน", "ญี่ปุ่น", "เปิดอยู่ตอนนี้"];

export function LobbyScreen({ players, onStart, reduced }: LobbyScreenProps) {
  const [count, setCount] = useState(1); // how many have joined (me first)
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [meReady, setMeReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = "A7F2";

  // simulate friends trickling in
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setCount(2), 900));
    timers.push(setTimeout(() => setCount(3), 2100));
    timers.push(setTimeout(() => setReady((r) => ({ ...r, p2: true })), 3000));
    timers.push(setTimeout(() => setCount(4), 3400));
    timers.push(setTimeout(() => setReady((r) => ({ ...r, p3: true })), 4200));
    return () => timers.forEach(clearTimeout);
  }, []);

  const visible = players.slice(0, count);
  const canStart = count >= 2;

  function share() {
    setCopied(true);
    buzz(12);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Screen bg="var(--cream-2)">
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
            {count} ออนไลน์
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((p) => {
            const isReady = p.me ? meReady : ready[p.id];
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
                      color: isReady ? "var(--good)" : "var(--ink-3)",
                      fontWeight: 600,
                    }}
                  >
                    {isReady ? "✓ พร้อมแล้ว" : "กำลังเลือก…"}
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
          {count < players.length && (
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
            {ROOM_SETTINGS.map((t) => (
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
            setMeReady((v) => !v);
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
          <PrimaryButton disabled={!canStart} onClick={onStart} ariaLabel="เริ่มเกม">
            {canStart ? "เริ่มเกม 🚀" : "รออีก " + (2 - count) + " คน"}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
