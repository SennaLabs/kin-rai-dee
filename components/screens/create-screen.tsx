/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckIcon, MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import { BackHeader } from "@/components/ui/back-header";
import { Chip, PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { FOOD_PLACE_TYPE_OPTIONS, priceStr } from "@/lib/data";
import type { RoomFilters } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type CreateScreenProps = {
  onBack: () => void;
  onCreate: (filters: RoomFilters) => void;
  loading?: boolean;
  error?: string | null;
};

export function CreateScreen({ onBack, onCreate, loading = false, error }: CreateScreenProps) {
  const [radius, setRadius] = useState(2);
  const [price, setPrice] = useState<number[]>([1, 2]);
  const [cuisines, setCuisines] = useState<string[]>(["restaurant"]);
  const [openNow, setOpenNow] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLabel, setGeoLabel] = useState("กำลังหาตำแหน่ง…");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoRequest, setGeoRequest] = useState(0);

  // Creating a room is tied to the browser's current geolocation for now.
  useEffect(() => {
    setCoords(null);
    setGeoError(null);
    setGeoLabel("กำลังหาตำแหน่ง…");
    if (!navigator.geolocation) {
      setGeoLabel("เบราว์เซอร์ไม่รองรับตำแหน่ง");
      setGeoError("ต้องใช้ตำแหน่งปัจจุบันก่อนสร้างห้อง");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLabel("ตำแหน่งปัจจุบัน");
        setGeoError(null);
      },
      () => {
        setCoords(null);
        setGeoLabel("เปิดสิทธิ์ตำแหน่งแล้วลองใหม่");
        setGeoError("ต้องใช้ตำแหน่งปัจจุบันก่อนสร้างห้อง");
      },
      { timeout: 10_000, enableHighAccuracy: false },
    );
  }, [geoRequest]);

  const togglePrice = (n: number) =>
    setPrice((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const toggleCuisine = (c: string) =>
    setCuisines((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  function handleCreate() {
    if (!coords) return;
    onCreate({
      lat: coords.lat,
      lng: coords.lng,
      radiusKm: radius,
      priceMin: price.length > 0 ? Math.min(...price) : 1,
      priceMax: price.length > 0 ? Math.max(...price) : 4,
      cuisines,
      openNow,
    });
  }

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title="สร้างห้อง" onBack={onBack} />
      <div className="flex-1 overflow-auto px-4.5 pt-1.5 pb-4 flex flex-col gap-3.5">
        {/* location */}
        <SettingCard title="ตำแหน่ง">
          <button
            className="rm-tap w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-coral bg-[rgba(255,90,60,0.06)] cursor-pointer text-left"
            onClick={() => setGeoRequest((n) => n + 1)}
          >
            <div className="w-10 h-10 rounded-xl bg-[linear-gradient(150deg,#FF7A5E,#E63946)] flex items-center justify-center shrink-0">
              <MapPinIcon size={22} weight="fill" color="#fff" />
            </div>
            <div className="flex-1">
              <div className="font-display text-[15px] font-semibold text-ink">
                ใช้ตำแหน่งปัจจุบัน
              </div>
              <div className={cn("text-xs", geoError ? "text-cta" : "text-ink-3")}>
                {geoLabel}
              </div>
            </div>
            {coords && <Check />}
          </button>
          <button
            className="rm-tap w-full mt-2 flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-line-strong bg-[rgba(255,255,255,0.58)] cursor-not-allowed text-left opacity-[0.58]"
            disabled
            aria-disabled="true"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-3 flex items-center justify-center shrink-0">
              <MagnifyingGlassIcon size={22} weight="bold" color="var(--ink-2)" />
            </div>
            <div className="flex-1">
              <div className="font-display text-[15px] font-semibold text-ink">
                พิมพ์ค้นหา / ปักหมุด
              </div>
              <div className="text-xs text-ink-3">
                ฟีเจอร์ในอนาคต
              </div>
            </div>
          </button>
        </SettingCard>

        {/* radius */}
        <SettingCard title="รัศมีค้นหา" hint={`${radius} กม.`}>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(+e.target.value)}
            className="rm-focusable w-full h-7"
            aria-label="รัศมีค้นหา (กิโลเมตร)"
            style={{ accentColor: "var(--coral)" }}
          />
          <div className="flex justify-between text-[11px] text-ink-3">
            <span>ใกล้ๆ</span>
            <span>ไกลหน่อย</span>
          </div>
        </SettingCard>

        {/* price */}
        <SettingCard title="ช่วงราคา">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <Chip
                key={n}
                active={price.includes(n)}
                onClick={() => togglePrice(n)}
                className="flex-1 font-display text-[15px]"
              >
                {priceStr(n)}
              </Chip>
            ))}
          </div>
        </SettingCard>

        {/* cuisines */}
        <SettingCard
          title="ประเภทอาหาร"
          hint={cuisines.length ? `${cuisines.length} ประเภท` : "ทุกประเภทอาหาร"}
        >
          <div className="flex flex-wrap gap-2">
            {FOOD_PLACE_TYPE_OPTIONS.map((option) => (
              <Chip
                key={option.type}
                active={cuisines.includes(option.type)}
                onClick={() => toggleCuisine(option.type)}
              >
                {option.emoji} {option.label}
              </Chip>
            ))}
          </div>
        </SettingCard>

        {/* open now toggle */}
        <div className="bg-white rounded-[22px] px-4 py-3.5 shadow-card flex items-center justify-between">
          <div>
            <div className="font-display text-base font-semibold text-ink">
              เปิดอยู่ตอนนี้
            </div>
            <div className="text-xs text-ink-3">
              โชว์เฉพาะร้านที่เปิดอยู่
            </div>
          </div>
          <Toggle on={openNow} onChange={() => setOpenNow((v) => !v)} />
        </div>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        {(error || geoError) && (
          <p className="m-0 mb-2.5 text-[13.5px] text-cta text-center font-semibold">
            {error ?? geoError}
          </p>
        )}
        <PrimaryButton onClick={handleCreate} disabled={loading || !coords}>
          {loading
            ? "กำลังสร้างห้อง…"
            : coords
              ? "สร้างห้อง 🎉"
              : geoError
                ? "เปิดสิทธิ์ตำแหน่งก่อน"
                : "กำลังหาตำแหน่ง…"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function SettingCard({
  title,
  children,
  hint,
}: {
  title: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-[22px] p-4 shadow-card">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-display text-base font-semibold text-ink">
          {title}
        </span>
        {hint && (
          <span className="text-xs text-ink-3">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Check() {
  return (
    <span className="w-6 h-6 rounded-full bg-coral flex items-center justify-center shrink-0">
      <CheckIcon size={14} weight="bold" color="#fff" />
    </span>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={cn(
        "rm-tap w-13.5 h-8 rounded-full border-none cursor-pointer relative transition-colors duration-200 shrink-0",
        on ? "bg-good" : "bg-[#D8C9C0]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.75 w-6.5 h-6.5 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-[left] duration-200 ease-[cubic-bezier(.34,1.5,.5,1)]",
          on ? "left-6.25" : "left-0.75"
        )}
      />
    </button>
  );
}
