"use client";

import { useRef, useState } from "react";
import { BackHeader } from "@/components/ui/back-header";
import { PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { ProfileForm } from "@/components/screens/profile-form";
import { loadProfile } from "@/lib/utils/profile-storage";

type ProfileSetupScreenProps = {
  onConfirm: (profile: { name: string; avatar: string }) => Promise<void>;
  onBack: () => void;
  title?: string;
  submitLabel?: string;
  loadingLabel?: string;
  initialName?: string;
  initialAvatar?: string;
};

export function ProfileSetupScreen({
  onConfirm,
  onBack,
  title = "ตั้งโปรไฟล์",
  submitLabel = "เข้าห้อง",
  loadingLabel = "กำลังบันทึก…",
  initialName,
  initialAvatar,
}: ProfileSetupScreenProps) {
  const [name, setName] = useState(() => initialName ?? loadProfile().name);
  const [avatar, setAvatar] = useState(
    () => initialAvatar ?? loadProfile().avatar
  );
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleConfirm() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setErr(null);
    try {
      await onConfirm({ name: name.trim(), avatar });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "บันทึกโปรไฟล์ไม่สำเร็จ");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title={title} onBack={onBack} />
      <div className="flex-1 overflow-auto pt-3.5 px-5.5 pb-4 flex flex-col gap-5.5">
        <ProfileForm
          name={name}
          avatar={avatar}
          onNameChange={setName}
          onAvatarChange={setAvatar}
        />
      </div>
      <div className="shrink-0 pt-3 px-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        {err && (
          <p className="mb-2.5 text-[13.5px] text-cta text-center font-semibold">
            {err}
          </p>
        )}
        <PrimaryButton disabled={!name.trim() || busy} onClick={handleConfirm}>
          {busy ? loadingLabel : submitLabel}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
