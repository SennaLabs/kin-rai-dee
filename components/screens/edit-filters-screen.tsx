"use client";

import { useState } from "react";
import { BackHeader } from "@/components/ui/back-header";
import { PrimaryButton } from "@/components/ui/buttons";
import {
  FilterControls,
  pricesToRange,
  rangeToPrices,
  type FilterFormValue,
} from "@/components/ui/filter-controls";
import { Screen } from "@/components/ui/screen";
import type { RoomFilters } from "@/lib/types";

type EditFiltersScreenProps = {
  filters: RoomFilters;
  onSave: (filters: RoomFilters) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
  title?: string;
  submitLabel?: string;
  loadingLabel?: string;
};

export function EditFiltersScreen({
  filters,
  onSave,
  onBack,
  loading = false,
  error,
  title = "แก้ไขห้อง",
  submitLabel = "บันทึก",
  loadingLabel = "กำลังบันทึก…",
}: EditFiltersScreenProps) {
  const [value, setValue] = useState<FilterFormValue>({
    radiusKm: filters.radiusKm,
    prices: rangeToPrices(filters.priceMin, filters.priceMax),
    cuisines: filters.cuisines,
    openNow: filters.openNow,
  });

  function handleSave() {
    onSave({
      ...filters,
      radiusKm: value.radiusKm,
      ...pricesToRange(value.prices),
      cuisines: value.cuisines,
      openNow: value.openNow,
    });
  }

  return (
    <Screen bg="var(--cream-2)">
      <BackHeader title={title} onBack={onBack} />
      <div className="flex-1 overflow-auto px-4.5 pt-1.5 pb-4 flex flex-col gap-3.5">
        <FilterControls value={value} onChange={setValue} />
      </div>
      <div className="shrink-0 px-6 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        {error && (
          <p className="m-0 mb-2.5 text-[13.5px] text-cta text-center font-semibold">
            {error}
          </p>
        )}
        <PrimaryButton onClick={handleSave} disabled={loading}>
          {loading ? loadingLabel : submitLabel}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
