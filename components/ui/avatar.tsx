import { createElement } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { avatars } from "@/assets/avatars";
import { cn } from "@/lib/utils/cn";
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

export function Avatar({ p, size = 40, dim, ring, check, joinPop }: AvatarProps) {
  const AvatarSvg = avatarById.get(p.emoji);
  return (
    <div
      className={cn("relative shrink-0", joinPop && "animate-[rmPop_.5s_cubic-bezier(.34,1.7,.5,1)]")}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center transition-opacity duration-300",
          "shadow-[0_3px_8px_rgba(43,27,23,0.14)]",
          p.me ? "bg-[linear-gradient(150deg,#FFE0B2,#FFC845)]" : "bg-white",
          ring ? "border-[2.5px] border-coral" : "border-2 border-white/90",
          dim ? "opacity-[0.42]" : "opacity-100",
        )}
        style={{ width: size, height: size, fontSize: size * 0.52 }}
      >
        {AvatarSvg
          ? createElement(AvatarSvg, {
              width: size,
              height: size,
              style: { display: "block" },
            })
          : p.emoji}
      </div>
      <span
        className="absolute -right-px -bottom-px min-w-2.5 min-h-2.5 rounded-full bg-good border-2 border-cream"
        style={{ width: size * 0.28, height: size * 0.28 }}
      />
      {check && (
        <span className="absolute -right-1 -top-1 w-4.5 h-4.5 rounded-full bg-good border-2 border-white flex items-center justify-center animate-pop">
          <CheckIcon size={10} weight="bold" color="#fff" />
        </span>
      )}
    </div>
  );
}
