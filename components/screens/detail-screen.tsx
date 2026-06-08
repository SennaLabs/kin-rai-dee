"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowsClockwiseIcon,
  CaretDownIcon,
  CaretLeftIcon,
  ClockIcon,
  GlobeIcon,
  HeartIcon,
  MapPinIcon,
  NavigationArrowIcon,
  PhoneIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { FoodPhoto } from "@/components/ui/food-photo";
import { Screen } from "@/components/ui/screen";
import { Stars } from "@/components/ui/stars";
import { priceStr } from "@/lib/data";
import type { Player, Restaurant } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function staticMapSrc(r: Restaurant): string {
  const base = "https://maps.googleapis.com/maps/api/staticmap";
  const marker =
    r.lat && r.lng ? `${r.lat},${r.lng}` : encodeURIComponent(r.addr);
  const center =
    r.lat && r.lng ? `${r.lat},${r.lng}` : encodeURIComponent(r.addr);
  return `${base}?center=${center}&zoom=16&size=800x240&scale=2&markers=color:red%7C${marker}&key=${MAPS_KEY}&language=th`;
}

function mapsDeepLink(r: Restaurant): string {
  if (r.placeId)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}&query_place_id=${r.placeId}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + " " + r.addr)}`;
}

// Directions deep link for the primary "ไปกันเลย" CTA (wiki §2.6) — opens the
// Maps app for navigation; no Places API cost since it's just a URL.
function mapsDirLink(r: Restaurant): string {
  const dest = encodeURIComponent(r.name + (r.addr ? " " + r.addr : ""));
  if (r.placeId)
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=${r.placeId}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

type DetailScreenProps = {
  r: Restaurant;
  players: Player[];
  /** true on the matched card; false when inspecting a pick from no-match */
  matched: boolean;
  canRestart?: boolean;
  onBack: () => void;
  onAgain: () => void;
  onHome: () => void;
};

export function DetailScreen({
  r,
  players,
  matched,
  canRestart = true,
  onBack,
  onAgain,
  onHome,
}: DetailScreenProps) {
  return (
    <Screen bg="var(--cream)">
      {/* hero photo */}
      <div className="shrink-0 h-65 relative">
        <FoodPhoto r={r} big label={false} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,27,23,0.3)_0%,transparent_30%,transparent_55%,var(--cream)_100%)]" />
        <button
          className="rm-tap absolute top-12.5 left-4 w-10.5 h-10.5 rounded-full border-none bg-[rgba(255,255,255,0.92)] shadow-[0_4px_12px_rgba(43,27,23,0.18)] cursor-pointer flex items-center justify-center"
          aria-label="ย้อนกลับ"
          onClick={onBack}>
          <CaretLeftIcon size={20} weight="bold" color="var(--ink)" />
        </button>
        {matched && (
          <div className="absolute top-12.5 right-4 bg-[rgba(255,200,69,0.96)] text-ink font-display font-semibold text-[13px] px-3.25 py-1.75 rounded-full">
            🏆 ร้านที่แมตช์
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-5.5 pt-0 pb-3.5">
        <h1 className="font-display m-0 text-3xl font-bold text-ink leading-[1.12]">
          {r.name}
        </h1>
        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1.25 font-bold text-sm text-ink">
            <Stars value={r.rating} size={15} /> {r.rating}
          </span>
          <span className="text-[13.5px] text-ink-3">
            ({r.reviews.toLocaleString()} รีวิว)
          </span>
          <span className="font-display font-semibold text-sm text-cta">
            {priceStr(r.price)}
          </span>
          <span className="text-[13.5px] text-ink-3">· {r.cuisine}</span>
        </div>

        {r.tags.length > 0 && (
          <div className="flex gap-1.75 mt-3 flex-wrap">
            {r.tags.map((t) => (
              <span
                key={t}
                className="bg-cream-3 text-ink-2 px-2.75 py-1 rounded-full text-xs font-semibold">
                {t}
              </span>
            ))}
          </div>
        )}

        {matched && (
          <div className="mt-3.5 flex items-center gap-2.5 bg-[rgba(30,158,106,0.1)] rounded-2xl px-3.5 py-2.5">
            <div className="flex">
              {players.map((p, i) => (
                <div key={p.id} className={cn(i ? "-ml-2.25" : "ml-0")}>
                  <Avatar p={p} size={30} />
                </div>
              ))}
            </div>
            <span className="font-semibold text-[13.5px] text-good inline-flex items-center gap-1.25">
              ทั้ง {players.length} คนชอบร้านนี้
              <HeartIcon size={15} weight="fill" color="var(--coral)" />
            </span>
          </div>
        )}

        {/* info rows */}
        <div className="mt-4 bg-white rounded-md px-4 py-1 shadow-card">
          <InfoRow
            icon={
              <ClockIcon
                size={20}
                weight="bold"
                color={r.open ? "var(--good)" : "var(--cta)"}
              />
            }
            main={
              <span
                className={cn("font-bold", r.open ? "text-good" : "text-cta")}>
                {r.open ? "เปิดอยู่ตอนนี้" : "ปิดอยู่"}
              </span>
            }
            sub={<OpeningHours hours={r.hours} />}
          />
          <InfoRow
            icon={<MapPinIcon size={20} weight="bold" color="var(--cta)" />}
            main={r.addr}
            sub={`ห่างจากคุณ ${r.dist} กม.`}
            last
          />
        </div>

        {/* secondary actions */}
        <div className="mt-3.5 flex gap-2.5">
          <MiniAction
            label="โทร"
            disabled={!r.phone}
            onClick={() => {
              window.location.href = `tel:${r.phone}`;
            }}
            icon={<PhoneIcon size={18} weight="bold" />}
          />
          <MiniAction
            label="เว็บไซต์"
            disabled={!r.website}
            onClick={() =>
              window.open(r.website, "_blank", "noopener,noreferrer")
            }
            icon={<GlobeIcon size={18} weight="bold" />}
          />
          <MiniAction
            label="ดูบน Maps"
            onClick={() =>
              window.open(mapsDeepLink(r), "_blank", "noopener,noreferrer")
            }
            icon={<MapPinIcon size={18} weight="bold" />}
          />
          <MiniAction
            label="แชร์"
            onClick={() => {
              const text = `${r.name} — ${mapsDeepLink(r)}`;
              if (navigator.share) {
                navigator
                  .share({ title: r.name, url: mapsDeepLink(r), text })
                  .catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(text).catch(() => {});
              }
            }}
            icon={<ShareNetworkIcon size={18} weight="bold" />}
          />
        </div>

        {/* map preview */}
        {MAPS_KEY ? (
          <div className="relative mt-3.5 w-full h-30 rounded-[18px] overflow-hidden">
            <Image
              src={staticMapSrc(r)}
              alt={`แผนที่ตำแหน่ง ${r.name}`}
              fill
              unoptimized
              sizes="430px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="rm-ph mt-3.5 h-30 rounded-[18px]">
            <span className="rm-ph-label">map preview · {r.addr}</span>
          </div>
        )}

        <SecondaryButton
          onClick={onAgain}
          disabled={!canRestart}
          ariaLabel="เริ่มรอบใหม่"
          className="mt-3.5 min-h-12.5 text-base">
          <span className="inline-flex items-center justify-center gap-1.5">
            <ArrowsClockwiseIcon size={18} weight="bold" /> เริ่มรอบใหม่
          </span>
        </SecondaryButton>
        {!canRestart && (
          <p className="m-0 mt-2 text-center text-[13px] text-ink-3 font-semibold">
            ต้องมีอย่างน้อย 2 คน
          </p>
        )}
        <button
          className="rm-tap font-display w-full mt-2 bg-transparent border-none text-ink-3 font-medium text-[13.5px] cursor-pointer px-2 py-1.5"
          onClick={onHome}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <ArrowLeftIcon size={16} weight="bold" /> กลับหน้าหลัก
          </span>
        </button>
      </div>

      {/* thumb-zone main CTA */}
      <div className="shrink-0 px-6 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <PrimaryButton
          color="linear-gradient(180deg,#FF6B4A,#E63946)"
          onClick={() =>
            window.open(mapsDirLink(r), "_blank", "noopener,noreferrer")
          }>
          <span className="inline-flex items-center justify-center gap-2">
            ไปกันเลย <NavigationArrowIcon size={20} weight="bold" />
          </span>
        </PrimaryButton>
      </div>
    </Screen>
  );
}

// getDay() (0=Sun) → Google's Thai weekdayDescriptions prefix.
const THAI_DAYS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

function OpeningHours({ hours }: { hours: string }) {
  const [open, setOpen] = useState(false);
  const week = hours
    .split(" · ")
    .map((s) => s.trim())
    .filter(Boolean);

  // Mock / single-value hours carry no per-day breakdown — render as-is.
  if (week.length <= 1) return <>เวลาทำการ {hours}</>;

  const todayIdx = week.findIndex((d) =>
    d.startsWith(THAI_DAYS[new Date().getDay()]),
  );
  const todayHours =
    todayIdx >= 0 ? week[todayIdx].replace(/^[^:]+:\s*/, "") : "ดูเวลาทำการ";

  return (
    <div>
      <span className="inline-flex items-center gap-2 flex-wrap">
        วันนี้ {todayHours}
        <button
          className="rm-tap border-none bg-transparent p-0 cursor-pointer text-coral text-xs font-semibold inline-flex items-center gap-0.75"
          onClick={() => setOpen((v) => !v)}>
          ดูทั้งสัปดาห์
          <CaretDownIcon
            size={12}
            weight="bold"
            className={cn(
              "transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </span>
      {open && (
        <div className="mt-1.5 grid gap-0.75">
          {week.map((d, i) => {
            const sep = d.indexOf(": ");
            const day = sep >= 0 ? d.slice(0, sep) : d;
            const time = sep >= 0 ? d.slice(sep + 2) : "";
            return (
              <div
                key={d}
                className={cn(
                  "flex justify-between gap-3",
                  i === todayIdx
                    ? "text-ink font-bold"
                    : "text-ink-3 font-normal",
                )}>
                <span>{day}</span>
                <span>{time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniAction({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        !disabled && "rm-tap",
        "flex-1 border-none bg-white rounded-[18px] px-1 py-3 shadow-soft flex flex-col items-center gap-1.5",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer opacity-100",
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}>
      <span
        className={cn(
          "w-10 h-10 rounded-[12px] bg-cream-3 flex items-center justify-center",
          disabled ? "text-ink-3" : "text-cta",
        )}>
        {icon}
      </span>
      <span className="text-xs font-semibold text-ink-2">{label}</span>
    </button>
  );
}

function InfoRow({
  icon,
  main,
  sub,
  last,
}: {
  icon: ReactNode;
  main: ReactNode;
  sub?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3.25 py-3",
        last ? "border-b-0" : "border-b border-line",
      )}>
      <span className="text-xl shrink-0 mt-px">{icon}</span>
      <div>
        <div className="text-[14.5px] text-ink font-medium">{main}</div>
        {sub && <div className="text-xs text-ink-3">{sub}</div>}
      </div>
    </div>
  );
}
