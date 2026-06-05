"use client";

import { ArrowsClockwiseIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { PrimaryButton } from "@/components/ui/buttons";
import { Screen } from "@/components/ui/screen";
import type { Player } from "@/lib/types";

type NoMatchScreenProps = {
  players: Player[];
  onNewGame: () => void;
  onRegenerate: () => void;
  onAdjust: () => void;
  reduced: boolean;
};

export function NoMatchScreen({
  players,
  onNewGame,
  onRegenerate,
  onAdjust,
  reduced,
}: NoMatchScreenProps) {
  return (
    <Screen bg="var(--cream-2)">
      <div style={{ flexShrink: 0, padding: "60px 24px 0", textAlign: "center" }}>
        <div
          style={{
            fontSize: 54,
            animation: reduced ? "none" : "rmFloat 3.4s ease-in-out infinite",
          }}
        >
          🫥
        </div>
        <h1
          className="font-display"
          style={{
            margin: "12px 0 0",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--ink)",
            lineHeight: 1.2,
          }}
        >
          No restaurants matched this group&apos;s preferences.
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 15,
            color: "var(--ink-2)",
            lineHeight: 1.45,
          }}
        >
          Everyone finished the deck, but no restaurant received a like.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {players.map((p) => (
            <span
              key={p.id}
              style={{
                background: "#fff",
                borderRadius: 999,
                padding: "7px 12px",
                boxShadow: "var(--sh-card)",
                color: "var(--ink-2)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {p.emoji} {p.name}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 24px max(20px, env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <PrimaryButton onClick={onNewGame}>Start a new game</PrimaryButton>
        <button
          className="rm-tap font-display"
          onClick={onRegenerate}
          style={{
            minHeight: 48,
            borderRadius: "var(--r-pill)",
            background: "#fff",
            border: "2px solid var(--line-strong)",
            color: "var(--ink)",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Regenerate a new deck <ArrowsClockwiseIcon size={18} weight="bold" />
          </span>
        </button>
        <button
          className="rm-tap font-display"
          onClick={onAdjust}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink-2)",
            fontWeight: 500,
            fontSize: 14.5,
            cursor: "pointer",
            padding: 6,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            Adjust filters and try again <SlidersHorizontalIcon size={17} weight="bold" />
          </span>
        </button>
      </div>
    </Screen>
  );
}
