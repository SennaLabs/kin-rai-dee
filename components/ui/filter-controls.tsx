"use client";

import { Chip } from "@/components/ui/buttons";
import { SettingCard } from "@/components/ui/setting-card";
import { FOOD_PLACE_TYPE_OPTIONS, priceStr } from "@/lib/data";
import { cn } from "@/lib/utils/cn";

export type FilterFormValue = {
  radiusKm: number;
  prices: number[];
  cuisines: string[];
  openNow: boolean;
};

export function pricesToRange(prices: number[]): {
  priceMin: number;
  priceMax: number;
} {
  if (prices.length === 0) return { priceMin: 1, priceMax: 4 };
  return { priceMin: Math.min(...prices), priceMax: Math.max(...prices) };
}

export function rangeToPrices(priceMin: number, priceMax: number): number[] {
  const out: number[] = [];
  for (let n = priceMin; n <= priceMax; n++) out.push(n);
  return out;
}

type FilterControlsProps = {
  value: FilterFormValue;
  onChange: (next: FilterFormValue) => void;
};

export function FilterControls({ value, onChange }: FilterControlsProps) {
  const togglePrice = (n: number) =>
    onChange({
      ...value,
      prices: value.prices.includes(n)
        ? value.prices.filter((x) => x !== n)
        : [...value.prices, n],
    });
  const toggleCuisine = (c: string) =>
    onChange({
      ...value,
      cuisines: value.cuisines.includes(c)
        ? value.cuisines.filter((x) => x !== c)
        : [...value.cuisines, c],
    });

  return (
    <>
      <SettingCard title="รัศมีค้นหา" hint={`${value.radiusKm} กม.`}>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={value.radiusKm}
          onChange={(e) => onChange({ ...value, radiusKm: +e.target.value })}
          className="rm-focusable w-full h-7"
          aria-label="รัศมีค้นหา (กิโลเมตร)"
          style={{ accentColor: "var(--coral)" }}
        />
        <div className="flex justify-between text-[11px] text-ink-3">
          <span>ใกล้ๆ</span>
          <span>ไกลหน่อย</span>
        </div>
      </SettingCard>

      <SettingCard title="ช่วงราคา">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <Chip
              key={n}
              active={value.prices.includes(n)}
              onClick={() => togglePrice(n)}
              className="flex-1 font-display text-[15px]"
            >
              {priceStr(n)}
            </Chip>
          ))}
        </div>
      </SettingCard>

      <SettingCard
        title="ประเภทอาหาร"
        hint={
          value.cuisines.length
            ? `${value.cuisines.length} ประเภท`
            : "ทุกประเภทอาหาร"
        }
      >
        <div className="flex flex-wrap gap-2">
          {FOOD_PLACE_TYPE_OPTIONS.map((option) => (
            <Chip
              key={option.type}
              active={value.cuisines.includes(option.type)}
              onClick={() => toggleCuisine(option.type)}
            >
              {option.emoji} {option.label}
            </Chip>
          ))}
        </div>
      </SettingCard>

      <div className="bg-white rounded-[22px] px-4 py-3.5 shadow-card flex items-center justify-between">
        <div>
          <div className="font-display text-base font-semibold text-ink">
            เปิดอยู่ตอนนี้
          </div>
          <div className="text-xs text-ink-3">โชว์เฉพาะร้านที่เปิดอยู่</div>
        </div>
        <Toggle
          on={value.openNow}
          onChange={() => onChange({ ...value, openNow: !value.openNow })}
        />
      </div>
    </>
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
        on ? "bg-good" : "bg-[#D8C9C0]",
      )}
    >
      <span
        className={cn(
          "absolute top-0.75 w-6.5 h-6.5 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-[left] duration-200 ease-[cubic-bezier(.34,1.5,.5,1)]",
          on ? "left-6.25" : "left-0.75",
        )}
      />
    </button>
  );
}
