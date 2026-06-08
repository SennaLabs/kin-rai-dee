"use client";

import { useRef, useState } from "react";
import { BackHeader } from "@/components/ui/back-header";
import { PrimaryButton } from "@/components/ui/buttons";
import { buzz } from "@/components/ui/motion";
import { Screen } from "@/components/ui/screen";
import { avatars } from "@/assets/avatars";
import { cn } from "@/lib/utils/cn";

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
      <div className="flex-1 overflow-auto pt-3.5 px-5.5 pb-4 flex flex-col gap-5.5">
        {/* OTP code */}
        <div>
          <label className="font-display text-sm font-semibold text-ink">
            โค้ดห้อง 4 หลัก
          </label>
          <div className="relative mt-2.5">
            <input
              ref={inputRef}
              value={code}
              inputMode="text"
              autoCapitalize="characters"
              maxLength={4}
              aria-label="โค้ดห้อง 4 ตัว"
              onChange={(e) => setCode(sanitizeCode(e.target.value))}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <div
              className="flex gap-3 justify-center"
              onClick={() => inputRef.current?.focus()}
            >
              {[0, 1, 2, 3].map((i) => {
                const filled = i < code.length;
                const active = i === code.length;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-15.5 h-18.5 rounded-[18px] bg-white flex items-center justify-center font-display font-bold text-[34px] text-ink transition-all duration-150",
                      active
                        ? "border-[3px] border-coral shadow-soft"
                        : filled
                          ? "border-2 border-coral shadow-[0_8px_18px_rgba(255,90,60,0.18)]"
                          : "border-2 border-line-strong shadow-soft"
                    )}
                  >
                    <span
                      className={cn(
                        filled && "animate-[rmPop_.3s_cubic-bezier(.34,1.7,.5,1)]"
                      )}
                    >
                      {code[i] || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-center text-xs text-ink-3 mt-2.5">
            ขอโค้ด 4 ตัวอักษรจากเพื่อนที่สร้างห้อง
          </p>
        </div>

        {/* nickname */}
        <div>
          <label className="font-display text-sm font-semibold text-ink">
            ชื่อเล่น
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="พิมพ์ชื่อเล่น…"
            maxLength={12}
            className="rm-focusable font-body w-full mt-2.5 box-border h-13.5 rounded-2xl border-2 border-line-strong bg-white px-4 text-[17px] text-ink outline-none"
          />
        </div>

        {/* avatar */}
        <div>
          <label className="font-display text-sm font-semibold text-ink">
            เลือก avatar
          </label>
          <div className="grid grid-cols-4 gap-2.5 mt-2.5">
            {avatars.map(({ id, Component, label }) => {
              const value = String(id);
              const selected = avatar === value;
              return (
                <button
                  key={id}
                  className={cn(
                    "rm-tap aspect-square rounded-[14px] cursor-pointer overflow-hidden p-1 flex items-center justify-center transition-all duration-150",
                    selected
                      ? "border-[2.5px] border-coral bg-[rgba(255,90,60,0.1)] scale-[1.05]"
                      : "border-2 border-line bg-white scale-100"
                  )}
                  aria-label={`เลือก avatar ${label}`}
                  aria-pressed={selected}
                  onClick={() => {
                    setAvatar(value);
                    buzz(8);
                  }}
                >
                  <Component
                    width="100%"
                    height="100%"
                    className="block"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-3 px-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        {error && (
          <p className="mb-2.5 text-[13.5px] text-cta text-center font-semibold">
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
