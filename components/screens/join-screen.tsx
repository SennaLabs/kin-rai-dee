"use client";

import { useRef, useState } from "react";
import { BackHeader } from "@/components/ui/back-header";
import { PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { ProfileForm } from "@/components/screens/profile-form";
import { loadProfile } from "@/lib/utils/profile-storage";
import { cn } from "@/lib/utils/cn";

type JoinScreenProps = {
  onBack: () => void;
  onCheckCode: (code: string) => Promise<void>;
  onJoin: (data: { code: string; name: string; avatar: string }) => Promise<void>;
  initialCode?: string;
};

function sanitizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

export function JoinScreen({
  onBack,
  onCheckCode,
  onJoin,
  initialCode,
}: JoinScreenProps) {
  const [step, setStep] = useState<"pin" | "profile">("pin");
  const [code, setCode] = useState(() => sanitizeCode(initialCode ?? ""));
  const [name, setName] = useState(() => loadProfile().name);
  const [avatar, setAvatar] = useState(() => loadProfile().avatar);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleBack() {
    if (step === "profile") {
      setStep("pin");
      setErr(null);
    } else {
      onBack();
    }
  }

  async function submitPin() {
    setBusy(true);
    setErr(null);
    try {
      await onCheckCode(code);
      setStep("profile");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เข้าร่วมห้องไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function submitJoin() {
    setBusy(true);
    setErr(null);
    try {
      await onJoin({ code, name: name.trim(), avatar });
    } catch (e) {
      setStep("pin");
      setErr(e instanceof Error ? e.message : "เข้าร่วมห้องไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title="เข้าร่วมห้อง" onBack={handleBack} />
      <div className="flex-1 overflow-auto pt-3.5 px-5.5 pb-4 flex flex-col gap-5.5">
        {step === "pin" && (
          <div className="bg-white rounded-[22px] shadow-card px-5 py-7">
            <label className="block font-display text-base font-semibold text-ink text-center">
              โค้ดห้อง 4 หลัก
            </label>
            <div className="relative mt-5">
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
                        "w-14 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-[32px] text-ink transition-all duration-150",
                        active
                          ? "bg-white border-[3px] border-coral"
                          : filled
                            ? "bg-white border-2 border-coral"
                            : "bg-cream-2 border-2 border-line-strong"
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
            <p className="text-center text-xs text-ink-3 mt-5">
              ขอโค้ด 4 ตัวอักษรจากเพื่อนที่สร้างห้อง
            </p>
          </div>
        )}

        {step === "profile" && (
          <ProfileForm
            name={name}
            avatar={avatar}
            onNameChange={setName}
            onAvatarChange={setAvatar}
          />
        )}
      </div>

      <div className="shrink-0 pt-3 px-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        {err && (
          <p className="mb-2.5 text-[13.5px] text-cta text-center font-semibold">
            {err}
          </p>
        )}
        {step === "pin" && (
          <PrimaryButton
            disabled={code.length < 4 || busy}
            onClick={submitPin}
          >
            {busy ? "กำลังตรวจสอบ…" : "เข้าร่วม"}
          </PrimaryButton>
        )}
        {step === "profile" && (
          <PrimaryButton
            disabled={!name.trim() || busy}
            onClick={submitJoin}
          >
            {busy ? "กำลังเข้าร่วม…" : "เข้าร่วม"}
          </PrimaryButton>
        )}
      </div>
    </Screen>
  );
}
