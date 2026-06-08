import type { ReactNode } from "react";

export function SettingCard({
  title,
  children,
  hint,
}: {
  title: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-[22px] p-4 shadow-card">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-display text-base font-semibold text-ink">
          {title}
        </span>
        {hint && <span className="text-xs text-ink-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
