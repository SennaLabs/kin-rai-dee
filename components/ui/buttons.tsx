"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { HeartIcon, XIcon } from "@phosphor-icons/react";
import { buzz } from "./motion";

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** override the gradient/background */
  color?: string;
  style?: CSSProperties;
  ariaLabel?: string;
};

/** Full-width pill CTA with a tactile press + ripple. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  color,
  style,
  ariaLabel,
}: PrimaryButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const bg =
    color || "linear-gradient(180deg, var(--cta) 0%, var(--cta-deep) 100%)";

  function ripple(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    buzz(14);
    const el = ref.current;
    if (!el) return;
    const r = document.createElement("span");
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height);
    r.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;width:${d}px;height:${d}px;left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px;background:rgba(255,255,255,0.45);transform:scale(0);opacity:0.7;transition:transform .5s ease,opacity .6s ease;`;
    el.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transform = "scale(1)";
      r.style.opacity = "0";
    });
    setTimeout(() => r.remove(), 600);
  }

  return (
    <button
      ref={ref}
      className="rm-btn rm-tap font-display"
      aria-label={ariaLabel}
      onClick={(e) => {
        ripple(e);
        if (!disabled) onClick?.(e);
      }}
      disabled={disabled}
      style={{
        position: "relative",
        overflow: "hidden",
        border: "none",
        width: "100%",
        minHeight: 58,
        borderRadius: "var(--r-pill)",
        background: disabled ? "#E7D5CB" : bg,
        color: disabled ? "#B49A8E" : "#fff",
        fontWeight: 600,
        fontSize: 19,
        boxShadow: disabled ? "none" : "var(--sh-btn)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform .12s cubic-bezier(.34,1.56,.64,1), filter .15s",
        ...style,
      }}
      onPointerDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.955)";
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

type SecondaryButtonProps = {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  ariaLabel?: string;
};

/** Outlined pill — secondary action. */
export function SecondaryButton({
  children,
  onClick,
  style,
  ariaLabel,
}: SecondaryButtonProps) {
  return (
    <button
      className="rm-btn rm-tap font-display"
      aria-label={ariaLabel}
      onClick={(e) => {
        buzz(10);
        onClick?.(e);
      }}
      style={{
        width: "100%",
        minHeight: 56,
        borderRadius: "var(--r-pill)",
        background: "rgba(255,255,255,0.65)",
        color: "var(--cta)",
        border: "2px solid var(--coral)",
        fontWeight: 600,
        fontSize: 18,
        cursor: "pointer",
        transition: "transform .12s cubic-bezier(.34,1.56,.64,1)",
        ...style,
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

type RoundButtonProps = {
  kind: "like" | "pass";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  size?: number;
  big?: boolean;
};

/** Circular like / pass action — label + icon, min 64px tap target. */
export function RoundButton({ kind, onClick, size = 66, big }: RoundButtonProps) {
  const like = kind === "like";
  return (
    <button
      className="rm-btn rm-tap"
      onClick={(e) => {
        buzz(16);
        onClick?.(e);
      }}
      aria-label={like ? "ชอบร้านนี้" : "ผ่านร้านนี้"}
      style={{
        width: big ? 74 : size,
        height: big ? 74 : size,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        background: like
          ? "linear-gradient(180deg,#FF6B4A,#E63946)"
          : "#FFFFFF",
        color: like ? "#fff" : "var(--pass)",
        boxShadow: like
          ? "0 10px 22px rgba(230,57,70,0.36)"
          : "0 8px 20px rgba(43,27,23,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform .14s cubic-bezier(.34,1.7,.6,1)",
        fontSize: big ? 32 : 28,
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.88)")}
      onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {like ? (
        <HeartIcon size={big ? 34 : 30} weight="fill" />
      ) : (
        <XIcon size={big ? 32 : 28} weight="bold" />
      )}
    </button>
  );
}

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
};

/** Toggleable filter chip. */
export function Chip({ children, active, onClick, style }: ChipProps) {
  return (
    <button
      className="rm-tap font-body"
      onClick={onClick}
      aria-pressed={!!active}
      style={{
        padding: "9px 15px",
        borderRadius: "var(--r-pill)",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
        border: active
          ? "2px solid var(--coral)"
          : "2px solid var(--line-strong)",
        background: active ? "var(--coral)" : "#fff",
        color: active ? "#fff" : "var(--ink-2)",
        transition: "all .15s",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
