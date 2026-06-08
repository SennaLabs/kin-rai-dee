import { StarIcon } from "@phosphor-icons/react";

type StarProps = {
  size: number;
  color: string;
};

function Star({ size, color }: StarProps) {
  return (
    <StarIcon size={size} weight="fill" color={color} style={{ display: "block" }} />
  );
}

type StarsProps = {
  value: number;
  size?: number;
  color?: string;
};

/** Five-star rating with fractional fill. Decorative (aria-hidden). */
export function Stars({ value, size = 14, color = "var(--amber)" }: StarsProps) {
  return (
    <span
      style={{ display: "inline-flex", gap: 1, verticalAlign: "middle" }}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span
            key={i}
            style={{
              position: "relative",
              width: size,
              height: size,
              display: "inline-block",
            }}
          >
            <Star size={size} color="rgba(43,27,23,0.15)" />
            <span
              style={{
                position: "absolute",
                inset: 0,
                width: `${fill * 100}%`,
                overflow: "hidden",
              }}
            >
              <Star size={size} color={color} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
