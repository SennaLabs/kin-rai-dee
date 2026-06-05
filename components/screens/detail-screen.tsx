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
  onBack: () => void;
  onAgain: () => void;
  onHome: () => void;
};

export function DetailScreen({
  r,
  players,
  matched,
  onBack,
  onAgain,
  onHome,
}: DetailScreenProps) {
  return (
    <Screen bg="var(--cream)">
      {/* hero photo */}
      <div style={{ flexShrink: 0, height: 260, position: "relative" }}>
        <FoodPhoto r={r} big label={false} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(43,27,23,0.3) 0%, transparent 30%, transparent 55%, var(--cream) 100%)",
          }}
        />
        <button
          className="rm-tap"
          aria-label="ย้อนกลับ"
          onClick={onBack}
          style={{
            position: "absolute",
            top: 50,
            left: 16,
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 4px 12px rgba(43,27,23,0.18)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <CaretLeftIcon size={20} weight="bold" color="var(--ink)" />
        </button>
        {matched && (
          <div
            style={{
              position: "absolute",
              top: 50,
              right: 16,
              background: "rgba(255,200,69,0.96)",
              color: "var(--ink)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 13,
              padding: "7px 13px",
              borderRadius: 999,
            }}>
            🏆 ร้านที่แมตช์
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "0 22px 14px",
        }}>
        <h1
          className="font-display"
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            color: "var(--ink)",
            lineHeight: 1.12,
          }}>
          {r.name}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            flexWrap: "wrap",
          }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700,
              fontSize: 15,
              color: "var(--ink)",
            }}>
            <Stars value={r.rating} size={15} /> {r.rating}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
            ({r.reviews.toLocaleString()} รีวิว)
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 15,
              color: "var(--cta)",
            }}>
            {priceStr(r.price)}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
            · {r.cuisine}
          </span>
        </div>

        {r.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 7,
              marginTop: 12,
              flexWrap: "wrap",
            }}>
            {r.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "var(--cream-3)",
                  color: "var(--ink-2)",
                  padding: "4px 11px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {matched && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(30,158,106,0.1)",
              borderRadius: 16,
              padding: "10px 14px",
            }}>
            <div style={{ display: "flex" }}>
              {players.map((p, i) => (
                <div key={p.id} style={{ marginLeft: i ? -9 : 0 }}>
                  <Avatar p={p} size={30} />
                </div>
              ))}
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 13.5,
                color: "var(--good)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}>
              ทั้ง {players.length} คนชอบร้านนี้
              <HeartIcon size={15} weight="fill" color="var(--coral)" />
            </span>
          </div>
        )}

        {/* info rows */}
        <div
          style={{
            marginTop: 16,
            background: "#fff",
            borderRadius: 20,
            padding: "4px 16px",
            boxShadow: "var(--sh-card)",
          }}>
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
                style={{
                  color: r.open ? "var(--good)" : "var(--cta)",
                  fontWeight: 700,
                }}>
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
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
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
          <div
            style={{
              position: "relative",
              marginTop: 14,
              width: "100%",
              height: 120,
              borderRadius: 18,
              overflow: "hidden",
            }}>
            <Image
              src={staticMapSrc(r)}
              alt={`แผนที่ตำแหน่ง ${r.name}`}
              fill
              unoptimized
              sizes="430px"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            className="rm-ph"
            style={{ marginTop: 14, height: 120, borderRadius: 18 }}>
            <span className="rm-ph-label">map preview · {r.addr}</span>
          </div>
        )}

        <SecondaryButton
          onClick={onAgain}
          ariaLabel="เริ่มรอบใหม่"
          style={{ marginTop: 14, minHeight: 50, fontSize: 16 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}>
            <ArrowsClockwiseIcon size={18} weight="bold" /> เริ่มรอบใหม่
          </span>
        </SecondaryButton>
        <button
          className="rm-tap font-display"
          onClick={onHome}
          style={{
            width: "100%",
            marginTop: 8,
            background: "transparent",
            border: "none",
            color: "var(--ink-3)",
            fontWeight: 500,
            fontSize: 13.5,
            cursor: "pointer",
            padding: "6px 8px",
          }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}>
            <ArrowLeftIcon size={16} weight="bold" /> กลับหน้าหลัก
          </span>
        </button>
      </div>

      {/* thumb-zone main CTA */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(20px, env(safe-area-inset-bottom))",
        }}>
        <PrimaryButton
          color="linear-gradient(180deg,#FF6B4A,#E63946)"
          onClick={() =>
            window.open(mapsDirLink(r), "_blank", "noopener,noreferrer")
          }>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}>
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
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}>
        วันนี้ {todayHours}
        <button
          className="rm-tap"
          onClick={() => setOpen((v) => !v)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            color: "var(--coral)",
            fontSize: 12.5,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}>
          ดูทั้งสัปดาห์
          <CaretDownIcon
            size={12}
            weight="bold"
            style={{
              transition: "transform .15s",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        </button>
      </span>
      {open && (
        <div style={{ marginTop: 6, display: "grid", gap: 3 }}>
          {week.map((d, i) => {
            const sep = d.indexOf(": ");
            const day = sep >= 0 ? d.slice(0, sep) : d;
            const time = sep >= 0 ? d.slice(sep + 2) : "";
            return (
              <div
                key={d}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  color: i === todayIdx ? "var(--ink)" : "var(--ink-3)",
                  fontWeight: i === todayIdx ? 700 : 400,
                }}>
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
      className={disabled ? undefined : "rm-tap"}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        flex: 1,
        border: "none",
        background: "#fff",
        borderRadius: 18,
        padding: "12px 4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        boxShadow: "var(--sh-soft)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "var(--cream-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: disabled ? "var(--ink-3)" : "var(--cta)",
        }}>
        {icon}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
        {label}
      </span>
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
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}>
      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14.5, color: "var(--ink)", fontWeight: 500 }}>
          {main}
        </div>
        {sub && (
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{sub}</div>
        )}
      </div>
    </div>
  );
}
