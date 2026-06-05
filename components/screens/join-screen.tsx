"use client";

import { useRef, useState } from "react";
import { BackHeader } from "@/components/ui/back-header";
import { PrimaryButton } from "@/components/ui/buttons";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
import { avatars } from "@/assets/avatars";

type JoinScreenProps = {
  onBack: () => void;
  onJoin: (data: { code: string; name: string; avatar: string }) => void;
  loading?: boolean;
  error?: string | null;
  /** prefilled code from an invite link (/j/{code}) */
  initialCode?: string;
};

function sanitizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

export function JoinScreen({
  onBack,
  onJoin,
  loading = false,
  error,
  initialCode,
}: JoinScreenProps) {
  const [code, setCode] = useState(() => sanitizeCode(initialCode ?? ""));
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(() => String(avatars[0].id));
  const inputRef = useRef<HTMLInputElement>(null);
  const ready = code.length === 4 && name.trim().length > 0;

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title="เข้าร่วมห้อง" onBack={onBack} />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "14px 22px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* OTP code */}
        <div>
          <label
            className="font-display"
            style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}
          >
            โค้ดห้อง 4 หลัก
          </label>
          <div style={{ position: "relative", marginTop: 10 }}>
            <input
              ref={inputRef}
              value={code}
              inputMode="text"
              autoCapitalize="characters"
              maxLength={4}
              aria-label="โค้ดห้อง 4 ตัว"
              onChange={(e) => setCode(sanitizeCode(e.target.value))}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            />
            <div
              style={{ display: "flex", gap: 12, justifyContent: "center" }}
              onClick={() => inputRef.current?.focus()}
            >
              {[0, 1, 2, 3].map((i) => {
                const filled = i < code.length;
                const active = i === code.length;
                return (
                  <div
                    key={i}
                    style={{
                      width: 62,
                      height: 74,
                      borderRadius: 18,
                      background: "#fff",
                      border: active
                        ? "3px solid var(--coral)"
                        : filled
                          ? "2px solid var(--coral)"
                          : "2px solid var(--line-strong)",
                      boxShadow: filled
                        ? "0 8px 18px rgba(255,90,60,0.18)"
                        : "var(--sh-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 34,
                      color: "var(--ink)",
                      transition: "all .15s",
                    }}
                  >
                    <span
                      style={{
                        animation: filled
                          ? "rmPop .3s cubic-bezier(.34,1.7,.5,1)"
                          : "none",
                      }}
                    >
                      {code[i] || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 12.5,
              color: "var(--ink-3)",
              marginTop: 10,
            }}
          >
            ขอโค้ด 4 ตัวอักษรจากเพื่อนที่สร้างห้อง
          </p>
        </div>

        {/* nickname */}
        <div>
          <label
            className="font-display"
            style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}
          >
            ชื่อเล่น
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="พิมพ์ชื่อเล่น…"
            maxLength={12}
            className="rm-focusable font-body"
            style={{
              width: "100%",
              marginTop: 10,
              boxSizing: "border-box",
              height: 54,
              borderRadius: 16,
              border: "2px solid var(--line-strong)",
              background: "#fff",
              padding: "0 16px",
              fontSize: 17,
              color: "var(--ink)",
              outline: "none",
            }}
          />
        </div>

        {/* avatar */}
        <div>
          <label
            className="font-display"
            style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}
          >
            เลือก avatar
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginTop: 10,
            }}
          >
            {avatars.map(({ id, Component, label }) => {
              const value = String(id);
              const selected = avatar === value;
              return (
                <button
                  key={id}
                  className="rm-tap"
                  aria-label={`เลือก avatar ${label}`}
                  aria-pressed={selected}
                  onClick={() => {
                    setAvatar(value);
                    buzz(8);
                  }}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 14,
                    cursor: "pointer",
                    overflow: "hidden",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: selected
                      ? "2.5px solid var(--coral)"
                      : "2px solid var(--line)",
                    background: selected ? "rgba(255,90,60,0.1)" : "#fff",
                    transform: selected ? "scale(1.05)" : "scale(1)",
                    transition: "all .15s",
                  }}
                >
                  <Component
                    width="100%"
                    height="100%"
                    style={{ display: "block" }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(20px, env(safe-area-inset-bottom))",
        }}
      >
        {error && (
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 13.5,
              color: "var(--cta)",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}
        <PrimaryButton
          disabled={!ready || loading}
          onClick={() => onJoin({ code, name: name.trim(), avatar })}
        >
          {loading ? "กำลังเข้าร่วม…" : "เข้าร่วม"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
