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
      style={{
        height: 7,
        borderRadius: 999,
        background: "rgba(43,27,23,0.10)",
        overflow: "hidden",
        width: "100%",
      }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: "width .5s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}
