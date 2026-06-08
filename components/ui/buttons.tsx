"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { HeartIcon, XIcon } from "@phosphor-icons/react";
import { buzz } from "./motion";
import { cn } from "@/lib/utils/cn";

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** override the gradient/background */
  color?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  className?: string;
};

/** Full-width pill CTA with a tactile press + ripple. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  color,
  style,
  ariaLabel,
  className,
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
      className={cn(
        "rm-btn rm-tap font-display",
        "relative overflow-hidden w-full min-h-14.5 rounded-pill font-semibold text-[19px] transition-[transform,filter] duration-150 ease-[cubic-bezier(.34,1.56,.64,1)]",
        disabled
          ? "text-[#B49A8E] cursor-not-allowed"
          : "text-white shadow-btn cursor-pointer active:scale-[0.955]",
        className
      )}
      aria-label={ariaLabel}
      onClick={(e) => {
        ripple(e);
        if (!disabled) onClick?.(e);
      }}
      disabled={disabled}
      style={{
        background: disabled ? "#E7D5CB" : bg,
        ...style,
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
  className?: string;
};

/** Outlined pill — secondary action. */
export function SecondaryButton({
  children,
  onClick,
  style,
  ariaLabel,
  className,
}: SecondaryButtonProps) {
  return (
    <button
      className={cn(
        "rm-btn rm-tap font-display",
        "w-full min-h-14 rounded-pill bg-white/65 text-cta border-2 border-coral font-semibold text-lg cursor-pointer transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-[0.96]",
        className
      )}
      aria-label={ariaLabel}
      onClick={(e) => {
        buzz(10);
        onClick?.(e);
      }}
      style={style}
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
      className={cn(
        "rm-btn rm-tap",
        "rounded-full shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-150 ease-[cubic-bezier(.34,1.7,.6,1)] active:scale-[0.88]",
        like
          ? "bg-[linear-gradient(180deg,#FF6B4A,#E63946)] text-white shadow-[0_10px_22px_rgba(230,57,70,0.36)]"
          : "bg-white text-pass shadow-[0_8px_20px_rgba(43,27,23,0.16)]"
      )}
      onClick={(e) => {
        buzz(16);
        onClick?.(e);
      }}
      aria-label={like ? "ชอบร้านนี้" : "ผ่านร้านนี้"}
      style={{
        width: big ? 74 : size,
        height: big ? 74 : size,
      }}
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
  className?: string;
};

/** Toggleable filter chip. */
export function Chip({ children, active, onClick, style, className }: ChipProps) {
  return (
    <button
      className={cn(
        "rm-tap font-body",
        "px-4 py-2.5 rounded-pill cursor-pointer font-semibold text-sm transition-all duration-150 whitespace-nowrap",
        active
          ? "border-2 border-coral bg-coral text-white"
          : "border-2 border-line-strong bg-white text-ink-2",
        className
      )}
      onClick={onClick}
      aria-pressed={!!active}
      style={style}
    >
      {children}
    </button>
  );
}
