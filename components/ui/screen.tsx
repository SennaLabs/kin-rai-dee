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
      className="font-body"
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: bg || "var(--cream)",
        color: "var(--ink)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
