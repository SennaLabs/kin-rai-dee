/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  CheckIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { BackHeader } from "@/components/ui/back-header";
import { PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import {
  FilterControls,
  pricesToRange,
  type FilterFormValue,
} from "@/components/ui/filter-controls";
import { SettingCard } from "@/components/ui/setting-card";
import type { RoomFilters } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type CreateScreenProps = {
  onBack: () => void;
  onCreate: (filters: RoomFilters) => void;
  loading?: boolean;
  error?: string | null;
};

function geoErrorMessage(code: number): string {
  console.log({ code });
  switch (code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return "ตำแหน่งถูกบล็อก เปิดสิทธิ์ใน browser settings แล้วลองใหม่";
    case GeolocationPositionError.POSITION_UNAVAILABLE:
      return "หาตำแหน่งไม่ได้ เช็ก GPS/เน็ต";
    default:
      return "หมดเวลา ลองใหม่อีกครั้ง";
  }
}

export function CreateScreen({
  onBack,
  onCreate,
  loading = false,
  error,
}: CreateScreenProps) {
  const [filters, setFilters] = useState<FilterFormValue>({
    radiusKm: 2,
    prices: [1, 2],
    cuisines: ["restaurant"],
    openNow: true,
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoLabel, setGeoLabel] = useState("กำลังหาตำแหน่ง…");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoRequest, setGeoRequest] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setCoords(null);
    setGeoError(null);
    setGeoLabel("กำลังหาตำแหน่ง…");
    if (!navigator.geolocation) {
      console.log("Geolocation API not supported");
      setGeoLabel("เบราว์เซอร์ไม่รองรับตำแหน่ง");
      setGeoError("ต้องใช้ตำแหน่งปัจจุบันก่อนสร้างห้อง");
      return;
    }
    const onSuccess = (pos: GeolocationPosition) => {
      if (cancelled) return;
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeoLabel("ตำแหน่งปัจจุบัน");
      setGeoError(null);
    };

    const requestPosition = (retryOnTimeout: boolean) => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (error) => {
          if (cancelled) return;
          if (
            retryOnTimeout &&
            error.code === GeolocationPositionError.TIMEOUT
          ) {
            requestPosition(false);
            return;
          }
          console.error(`Geolocation error [${error.code}]: ${error.message}`);
          setCoords(null);
          setGeoLabel(geoErrorMessage(error.code));
          setGeoError("ต้องใช้ตำแหน่งปัจจุบันก่อนสร้างห้อง");
        },
        { timeout: 20_000, maximumAge: 60_000, enableHighAccuracy: false },
      );
    };

    requestPosition(true);
    return () => { cancelled = true; };
  }, [geoRequest]);

  function handleCreate() {
    if (!coords) return;
    onCreate({
      lat: coords.lat,
      lng: coords.lng,
      radiusKm: filters.radiusKm,
      ...pricesToRange(filters.prices),
      cuisines: filters.cuisines,
      openNow: filters.openNow,
    });
  }

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title="สร้างห้อง" onBack={onBack} />
      <div className="flex-1 overflow-auto px-4.5 pt-1.5 pb-4 flex flex-col gap-3.5">
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
              <div
                className={cn("text-xs", geoError ? "text-cta" : "text-ink-3")}
              >
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
              <MagnifyingGlassIcon
                size={22}
                weight="bold"
                color="var(--ink-2)"
              />
            </div>
            <div className="flex-1">
              <div className="font-display text-[15px] font-semibold text-ink">
                พิมพ์ค้นหา / ปักหมุด
              </div>
              <div className="text-xs text-ink-3">ฟีเจอร์ในอนาคต</div>
            </div>
          </button>
        </SettingCard>

        <FilterControls value={filters} onChange={setFilters} />
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
              ? "สร้างห้อง"
              : geoError
                ? "เปิดสิทธิ์ตำแหน่งก่อน"
                : "กำลังหาตำแหน่ง…"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function Check() {
  return (
    <span className="w-6 h-6 rounded-full bg-coral flex items-center justify-center shrink-0">
      <CheckIcon size={14} weight="bold" color="#fff" />
    </span>
  );
}
