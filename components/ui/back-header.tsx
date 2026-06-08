import { CaretLeftIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/cn";

type BackHeaderProps = {
  title: string;
  onBack: () => void;
  /** white treatment for use over dark/photo backgrounds */
  light?: boolean;
};

/** Screen header with a circular back button + title. */
export function BackHeader({ title, onBack, light }: BackHeaderProps) {
  const c = light ? "#fff" : "var(--ink)";
  return (
    <div className="shrink-0 flex items-center gap-2 pt-[max(env(safe-area-inset-top,0px)+6px,20px)] px-4 pb-1.5">
      <button
        className={cn(
          "rm-tap flex items-center justify-center shrink-0 size-10.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(43,27,23,0.1)]",
          light ? "bg-white/20" : "bg-white/80",
        )}
        aria-label="ย้อนกลับ"
        onClick={onBack}>
        <CaretLeftIcon size={20} weight="bold" color={c} />
      </button>
      <h2
        className={cn(
          "font-display m-0 text-2xl font-semibold",
          light ? "text-white" : "text-ink",
        )}>
        {title}
      </h2>
    </div>
  );
}
