"use client";

import { useState, type CSSProperties } from "react";
import type { Restaurant } from "@/lib/types";

type FoodPhotoProps = {
  r: Restaurant;
  style?: CSSProperties;
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
export function FoodPhoto({ r, style, label = true, big }: FoodPhotoProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(r.photoName) && !failed;
  // Hero/card usages render large; reel/thumb usages render small.
  const width = big ? 800 : 400;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: `linear-gradient(150deg, ${r.g[0]}, ${r.g[1]})`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
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
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {!showPhoto && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            transform: "translate(-50%,-50%)",
            fontSize: big ? 96 : 72,
            filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.22))",
          }}
        >
          {r.emoji}
        </div>
      )}

      {!showPhoto && label && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 10,
            letterSpacing: 0.5,
            color: "rgba(255,255,255,0.82)",
            textTransform: "uppercase",
            background: "rgba(43,27,23,0.22)",
            padding: "3px 8px",
            borderRadius: 6,
            whiteSpace: "nowrap",
          }}
        >
          photo · {r.cuisine}
        </div>
      )}
    </div>
  );
}
