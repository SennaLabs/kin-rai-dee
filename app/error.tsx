"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Screen } from "@/components/ui/screen";
import { PrimaryButton } from "@/components/ui/buttons";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
              <span className="text-[60px] animate-float">😵</span>
            </div>
          </div>
          <h1 className="font-display text-[26px] font-bold text-ink leading-[1.2]">
            เกิดข้อผิดพลาด
          </h1>
          {process.env.NODE_ENV === "development" ? (
            <p className="mt-2 text-sm text-ink-2 leading-[1.45] font-mono break-all">
              {error.message}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-2 leading-[1.45]">
              มีบางอย่างผิดพลาด ลองใหม่หรือกลับหน้าหลัก
            </p>
          )}
        </div>
        <div className="shrink-0 px-6 pb-[max(28px,env(safe-area-inset-bottom))] flex flex-col gap-2.5">
          <PrimaryButton onClick={unstable_retry}>ลองใหม่</PrimaryButton>
          <Link
            href="/"
            className="rm-tap font-display flex items-center justify-center w-full min-h-14 rounded-pill bg-white/65 text-cta border-2 border-coral font-semibold text-lg cursor-pointer"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </Screen>
    </div>
  );
}
