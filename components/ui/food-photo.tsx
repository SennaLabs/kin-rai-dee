"use client";

import { useState, type CSSProperties } from "react";
import type { Restaurant } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type FoodPhotoProps = {
  r: Restaurant;
  style?: CSSProperties;
  className?: string;
  /** show the "photo · cuisine" caption (placeholder mode only) */
  label?: boolean;
  /** larger emoji for hero/card usage */
  big?: boolean;
};

/**
 * Restaurant photo. When the place carries a Places API (New) photo resource
 * name we lazily resolve it through /api/places/photo (proxied + cached); the
 * warm gradient + cuisine emoji is the skeleton/fallback shown until the image
 * loads, or permanently when there's no photo or it fails.
 */
export function FoodPhoto({ r, style, className, label = true, big }: FoodPhotoProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(r.photoName) && !failed;
  // Hero/card usages render large; reel/thumb usages render small.
  const width = big ? 800 : 400;

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{ background: `linear-gradient(150deg, ${r.g[0]}, ${r.g[1]})`, ...style }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 14px, rgba(255,255,255,0) 14px 28px)",
        }}
      />

      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/places/photo?name=${encodeURIComponent(r.photoName!)}&w=${width}`}
          alt={r.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {!showPhoto && (
        <div
          className={cn(
            "absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_8px_14px_rgba(0,0,0,0.22)]",
            big ? "text-[96px]" : "text-[72px]"
          )}
        >
          {r.emoji}
        </div>
      )}

      {!showPhoto && label && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5px] uppercase text-white/80 bg-[rgba(43,27,23,0.22)] px-2 py-0.75 rounded-md whitespace-nowrap">
          photo · {r.cuisine}
        </div>
      )}
    </div>
  );
}
