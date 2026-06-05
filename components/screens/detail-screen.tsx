"use client";

import type { ReactNode } from "react";
import {
  ArrowLeftIcon,
  ArrowsClockwiseIcon,
  ClockIcon,
  MapPinIcon,
  NavigationArrowIcon,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/buttons";
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
  onBack: () => void;
  onAgain: () => void;
  onHome: () => void;
};

export function DetailScreen({ r, players, onBack, onAgain, onHome }: DetailScreenProps) {
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
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
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
          }}
        >
          รายละเอียดร้าน
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "0 22px 14px",
          marginTop: -8,
        }}
      >
        <h1
          className="font-display"
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 700,
            color: "var(--ink)",
            lineHeight: 1.12,
          }}
        >
          {r.name}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700,
              fontSize: 15,
              color: "var(--ink)",
            }}
          >
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
            }}
          >
            {priceStr(r.price)}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
            · {r.cuisine}
          </span>
        </div>

        {/* group context */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(30,158,106,0.1)",
            borderRadius: 16,
            padding: "10px 14px",
          }}
        >
          <div style={{ display: "flex" }}>
            {players.map((p, i) => (
              <div key={p.id} style={{ marginLeft: i ? -9 : 0 }}>
                <Avatar p={p} size={30} />
              </div>
            ))}
          </div>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--good)" }}>
            เลือกจากผลโหวตของผู้เล่น {players.length} คน
          </span>
        </div>

        {/* info rows */}
        <div
          style={{
            marginTop: 16,
            background: "#fff",
            borderRadius: 20,
            padding: "4px 16px",
            boxShadow: "var(--sh-card)",
          }}
        >
          <InfoRow
            icon={<ClockIcon size={20} weight="bold" color="var(--cta)" />}
            main={
              <span
                style={{
                  color: r.open ? "var(--good)" : "var(--cta)",
                  fontWeight: 700,
                }}
              >
                {r.open ? "เปิดอยู่ตอนนี้" : "ปิดอยู่"}
              </span>
            }
            sub={`เวลาทำการ ${r.hours}`}
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
            onClick={
              r.phone
                ? () => { window.location.href = `tel:${r.phone}`; }
                : () => { window.open(mapsDeepLink(r), "_blank", "noopener,noreferrer"); }
            }
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />
              </svg>
            }
          />
          <MiniAction
            label="ดูบน Maps"
            onClick={() => window.open(mapsDeepLink(r), "_blank", "noopener,noreferrer")}
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          />
          <MiniAction
            label="แชร์"
            onClick={() => {
              const text = `${r.name} — ${mapsDeepLink(r)}`;
              if (navigator.share) {
                navigator.share({ title: r.name, url: mapsDeepLink(r), text }).catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(text).catch(() => {});
              }
            }}
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            }
          />
        </div>

        {/* map preview */}
        {MAPS_KEY ? (
          <img
            src={staticMapSrc(r)}
            alt={`แผนที่ตำแหน่ง ${r.name}`}
            loading="lazy"
            style={{
              display: "block",
              marginTop: 14,
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 18,
            }}
          />
        ) : (
          <div
            className="rm-ph"
            style={{ marginTop: 14, height: 120, borderRadius: 18 }}
          >
            <span className="rm-ph-label">map preview · {r.addr}</span>
          </div>
        )}

        <button
          className="rm-tap font-display"
          onClick={onAgain}
          style={{
            width: "100%",
            marginTop: 14,
            background: "transparent",
            border: "none",
            color: "var(--ink-3)",
            fontWeight: 500,
            fontSize: 14.5,
            cursor: "pointer",
            padding: 8,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ArrowsClockwiseIcon size={16} weight="bold" /> หาร้านอื่นต่อ / เริ่มรอบใหม่
          </span>
        </button>
        <button
          className="rm-tap font-display"
          onClick={onHome}
          style={{
            width: "100%",
            marginTop: 4,
            background: "transparent",
            border: "none",
            color: "var(--ink-3)",
            fontWeight: 400,
            fontSize: 13.5,
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ArrowLeftIcon size={16} weight="bold" /> กลับหน้าหลัก
          </span>
        </button>
      </div>

      {/* thumb-zone main CTA */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(20px, env(safe-area-inset-bottom))",
        }}
      >
        <PrimaryButton
          color="linear-gradient(180deg,#FF6B4A,#E63946)"
          onClick={() => window.open(mapsDirLink(r), "_blank", "noopener,noreferrer")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            ไปกันเลย · นำทาง <NavigationArrowIcon size={20} weight="bold" />
          </span>
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function MiniAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className="rm-tap"
      onClick={onClick}
      aria-label={label}
      style={{
        flex: 1,
        border: "none",
        background: "#fff",
        borderRadius: 18,
        padding: "12px 4px",
        cursor: "pointer",
        boxShadow: "var(--sh-soft)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "var(--cream-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--cta)",
        }}
      >
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
        alignItems: "center",
        gap: 13,
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div>
        <div
          style={{ fontSize: 14.5, color: "var(--ink)", fontWeight: 500 }}
        >
          {main}
        </div>
        {sub && (
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{sub}</div>
        )}
      </div>
    </div>
  );
}
