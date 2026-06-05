/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import { BackHeader } from "@/components/ui/back-header";
import { Chip, PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import { FOOD_PLACE_TYPE_OPTIONS, priceStr } from "@/lib/data";
import type { RoomFilters } from "@/lib/types";

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
        setGeoLabel("ตำแหน่งปัจจุบัน ✓");
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
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "6px 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* location */}
        <SettingCard title="ตำแหน่ง">
          <button
            className="rm-tap"
            onClick={() => setGeoRequest((n) => n + 1)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 16,
              border: "2px solid var(--coral)",
              background: "rgba(255,90,60,0.06)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(150deg,#FF7A5E,#E63946)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              <MapPinIcon size={22} weight="fill" color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="font-display"
                style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}
              >
                ใช้ตำแหน่งปัจจุบัน
              </div>
              <div style={{ fontSize: 12.5, color: geoError ? "var(--cta)" : "var(--ink-3)" }}>
                {geoLabel}
              </div>
            </div>
            {coords && <Check />}
          </button>
          <button
            className="rm-tap"
            disabled
            aria-disabled="true"
            style={{
              width: "100%",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 16,
              border: "2px dashed var(--line-strong)",
              background: "rgba(255,255,255,0.58)",
              cursor: "not-allowed",
              textAlign: "left",
              opacity: 0.58,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "var(--cream-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              <MagnifyingGlassIcon size={22} weight="bold" color="var(--ink-2)" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="font-display"
                style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}
              >
                พิมพ์ค้นหา / ปักหมุด
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
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
            className="rm-focusable"
            aria-label="รัศมีค้นหา (กิโลเมตร)"
            style={{ width: "100%", accentColor: "var(--coral)", height: 28 }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--ink-3)",
            }}
          >
            <span>ใกล้ๆ</span>
            <span>ไกลหน่อย</span>
          </div>
        </SettingCard>

        {/* price */}
        <SettingCard title="ช่วงราคา">
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4].map((n) => (
              <Chip
                key={n}
                active={price.includes(n)}
                onClick={() => togglePrice(n)}
                style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 15 }}
              >
                {priceStr(n)}
              </Chip>
            ))}
          </div>
        </SettingCard>

        {/* cuisines */}
        <SettingCard
          title="ประเภทอาหาร"
          hint={cuisines.length ? `${cuisines.length} type` : "ทุกประเภทอาหาร"}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: "14px 16px",
            boxShadow: "var(--sh-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              className="font-display"
              style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}
            >
              เปิดอยู่ตอนนี้
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
              โชว์เฉพาะร้านที่เปิดอยู่
            </div>
          </div>
          <Toggle on={openNow} onChange={() => setOpenNow((v) => !v)} />
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(20px, env(safe-area-inset-bottom))",
        }}
      >
        {(error || geoError) && (
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 13.5,
              color: "var(--cta)",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
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
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        padding: "16px 16px",
        boxShadow: "var(--sh-card)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          className="font-display"
          style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}
        >
          {title}
        </span>
        {hint && (
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Check() {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "var(--coral)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12l5 5L20 6" />
      </svg>
    </span>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="rm-tap"
      style={{
        width: 54,
        height: 32,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: on ? "var(--good)" : "#D8C9C0",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 25 : 3,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          transition: "left .2s cubic-bezier(.34,1.5,.5,1)",
        }}
      />
    </button>
  );
}
