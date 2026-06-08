import { createElement } from "react";
import { avatars } from "@/assets/avatars";
import type { Player } from "@/lib/types";

const avatarById = new Map(avatars.map((a) => [String(a.id), a.Component]));

type AvatarProps = {
  p: Player;
  size?: number;
  /** fade out (e.g. not-yet-ready) */
  dim?: boolean;
  /** coral ring around the bubble */
  ring?: boolean;
  /** show the green "ready" checkmark badge */
  check?: boolean;
  /** play the pop-in animation when a player joins */
  joinPop?: boolean;
};

/** Player avatar bubble with online-presence dot. */
export function Avatar({ p, size = 40, dim, ring, check, joinPop }: AvatarProps) {
  const AvatarSvg = avatarById.get(p.emoji);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        animation: joinPop ? "rmPop .5s cubic-bezier(.34,1.7,.5,1)" : undefined,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: p.me
            ? "linear-gradient(150deg,#FFE0B2,#FFC845)"
            : "#fff",
          border: ring
            ? "2.5px solid var(--coral)"
            : "2px solid rgba(255,255,255,0.9)",
          boxShadow: "0 3px 8px rgba(43,27,23,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.52,
          opacity: dim ? 0.42 : 1,
          transition: "opacity .3s",
        }}
      >
        {AvatarSvg
          ? createElement(AvatarSvg, {
              width: size,
              height: size,
              style: { display: "block" },
            })
          : p.emoji}
      </div>
      {/* presence dot */}
      <span
        style={{
          position: "absolute",
          right: -1,
          bottom: -1,
          width: size * 0.28,
          height: size * 0.28,
          minWidth: 10,
          minHeight: 10,
          borderRadius: "50%",
          background: "var(--good)",
          border: "2px solid var(--cream)",
        }}
      />
      {check && (
        <span
          style={{
            position: "absolute",
            right: -4,
            top: -4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--good)",
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "rmPop .4s ease",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12l5 5L20 6" />
          </svg>
        </span>
      )}
    </div>
  );
}
