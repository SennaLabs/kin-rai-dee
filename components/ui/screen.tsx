import type { CSSProperties, ReactNode } from "react";

type ScreenProps = {
  children: ReactNode;
  /** background color or gradient for the screen */
  bg?: string;
  style?: CSSProperties;
};

/** Full-bleed screen shell — warm background, column layout, clips overflow. */
export function Screen({ children, bg, style }: ScreenProps) {
  return (
    <div
      className="relative h-full flex flex-col overflow-hidden text-ink font-body bg-cream"
      style={{
        background: bg || undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
