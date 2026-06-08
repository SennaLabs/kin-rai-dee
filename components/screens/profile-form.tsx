"use client";

import { buzz } from "@/components/ui/motion";
import { avatars } from "@/assets/avatars";
import { cn } from "@/lib/utils/cn";

type ProfileFormProps = {
  name: string;
  avatar: string;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: string) => void;
};

export function ProfileForm({
  name,
  avatar,
  onNameChange,
  onAvatarChange,
}: ProfileFormProps) {
  return (
    <>
      <div>
        <label className="font-display text-sm font-semibold text-ink">
          ชื่อเล่น
        </label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="พิมพ์ชื่อเล่น…"
          maxLength={12}
          className="rm-focusable font-body w-full mt-2.5 box-border h-13.5 rounded-2xl border-2 border-line-strong bg-white px-4 text-[17px] text-ink outline-none"
        />
      </div>

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
                  onAvatarChange(value);
                  buzz(8);
                }}
              >
                <Component width="100%" height="100%" className="block" />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
