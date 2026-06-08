import { cn } from "@/lib/utils/cn";

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
};

/** Thin rounded progress track. */
export function ProgressBar({ value, max, color = "var(--coral)" }: ProgressBarProps) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      className={cn("h-1.75 w-full rounded-full bg-line overflow-hidden")}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-in-out")}
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
    </div>
  );
}
