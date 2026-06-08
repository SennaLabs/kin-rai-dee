import Link from "next/link";
import { Screen } from "@/components/ui/screen";

export default function NotFound() {
  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-107.5 overflow-hidden">
      <Screen>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="relative mb-7 flex items-center justify-center h-28 w-28">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-coral/10 blur-2xl" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 pointer-events-none">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="absolute rounded-full border-2 border-coral/10"
                  style={{ inset: i * 40 }}
                />
              ))}
            </div>
            <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-white shadow-card">
              <span className="text-[60px] animate-float">🍽️</span>
            </div>
          </div>

          <span className="font-display rounded-pill bg-cream-3 px-3.5 py-1 text-xs font-semibold tracking-[2px] text-ink-3">
            404
          </span>
          <h1 className="font-display mt-3.5 text-[26px] font-bold text-ink leading-[1.2]">
            ไม่เจอหน้านี้
          </h1>
          <p className="mt-2 text-sm text-ink-2 leading-[1.45]">
            ลิงก์อาจหมดอายุหรือไม่มีอยู่แล้ว
          </p>
        </div>
        <div className="shrink-0 px-6 pb-[max(28px,env(safe-area-inset-bottom))]">
          <Link
            href="/"
            className="rm-tap font-display flex items-center justify-center w-full min-h-14.5 rounded-pill font-semibold text-[19px] text-white shadow-btn cursor-pointer"
            style={{
              background:
                "linear-gradient(180deg, var(--cta) 0%, var(--cta-deep) 100%)",
            }}
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </Screen>
    </div>
  );
}
