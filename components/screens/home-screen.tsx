"use client";

import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/utils/cn";

type HomeScreenProps = {
  onCreate: () => void;
  onJoin: () => void;
  reduced: boolean;
};

const STEPS = [
  { t: "สร้างห้อง", d: "ตั้งรัศมี ราคา ประเภท" },
  { t: "แชร์โค้ด", d: "ชวนเพื่อนด้วยโค้ด 4 หลัก" },
  { t: "ปัดพร้อมกัน", d: "ชอบตรงกัน = แมตช์" },
];

// [emoji, left, top, animation-delay]
const FLOATS: [string, string, string, number][] = [
  ["🍜", "8%", "12%", 0],
  ["🍕", "78%", "10%", 0.6],
  ["🌮", "12%", "30%", 1.2],
  ["🍧", "82%", "34%", 1.8],
  ["🍗", "70%", "64%", 0.9],
];

export function HomeScreen({ onCreate, onJoin, reduced }: HomeScreenProps) {
  return (
    <Screen bg="linear-gradient(180deg, #FFF4EC 0%, #FFE4D3 100%)">
      {/* floating food emojis */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none">
        {FLOATS.map(([e, l, t, d], i) => (
          <span
            key={i}
            className="absolute text-[34px] opacity-50"
            style={{
              left: l,
              top: t,
              animation: reduced
                ? "none"
                : `rmFloat ${4 + i * 0.4}s ease-in-out ${d}s infinite`,
            }}>
            {e}
          </span>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-7.5 relative z-2">
        {/* mascot */}
        <div
          className={cn(
            "w-29 h-29 rounded-[34px] bg-[linear-gradient(150deg,#FF7A5E,#E63946)] flex items-center justify-center text-[62px] shadow-[0_18px_38px_rgba(230,57,70,0.4)] mb-5.5",
            !reduced && "animate-[rmFloat_3.6s_ease-in-out_infinite]"
          )}>
          🍽️
        </div>

        <h1
          className="font-display m-0 text-[46px] font-bold text-ink leading-[1.05] text-center">
          ไม่รู้<span className="text-cta">กินไร?</span>
        </h1>
        <p className="mt-3.5 text-[16.5px] text-ink-2 text-center leading-[1.45] max-w-75">
          เถียงกันทุกวันว่าจะกินไหน
          <br />
          มาปัดหาร้านพร้อมกัน จบในห้องเดียว
        </p>
      </div>

      {/* how it works */}
      <div className="px-7.5 pt-0 pb-1 relative z-2">
        <div className="relative flex">
          {/* dashed connector behind the step badges */}
          <div
            aria-hidden="true"
            className="absolute top-4 left-[16.667%] right-[16.667%] border-t-2 border-dashed border-[rgba(255,90,60,0.32)] z-0"
          />
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex-1 relative z-1 flex flex-col items-center text-center">
              <div
                className="font-display w-8.5 h-8.5 rounded-full bg-cream border-2 border-coral text-cta flex items-center justify-center text-[17px] font-bold">
                {i + 1}
              </div>
              <div className="font-display text-[13.5px] font-semibold text-ink mt-2">
                {s.t}
              </div>
              <div className="text-[10.5px] text-ink-3 mt-0.5 leading-tight max-w-23">
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* thumb-zone CTAs */}
      <div className="shrink-0 pt-4 px-6 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-3 relative z-2">
        <PrimaryButton onClick={onCreate}>สร้างห้อง</PrimaryButton>
        <SecondaryButton onClick={onJoin}>เข้าร่วมห้อง</SecondaryButton>
      </div>
    </Screen>
  );
}
