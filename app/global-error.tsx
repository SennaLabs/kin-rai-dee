"use client";

import { useEffect } from "react";
import { Mitr, Sarabun } from "next/font/google";
import { Screen } from "@/components/ui/screen";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import "./globals.css";

const mitr = Mitr({
  variable: "--font-mitr",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // global-error replaces the root layout, so it re-declares html/body, fonts,
  // and globals.css — none of layout.tsx's setup applies here.
  return (
    <html lang="th" className={`${mitr.variable} ${sarabun.variable} antialiased`}>
      <body>
        <div className="relative mx-auto h-[100dvh] w-full max-w-107.5 overflow-hidden">
          <Screen>
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="text-[64px]">😵</div>
              <h1 className="font-display mt-4 text-[26px] font-bold text-ink leading-[1.2]">
                เกิดข้อผิดพลาดร้ายแรง
              </h1>
              {process.env.NODE_ENV === "development" ? (
                <p className="mt-2 text-sm text-ink-2 leading-[1.45] font-mono break-all">
                  {error.message}
                </p>
              ) : (
                <p className="mt-2 text-sm text-ink-2 leading-[1.45]">
                  มีบางอย่างผิดพลาดในระดับแอป ลองใหม่หรือกลับหน้าหลัก
                </p>
              )}
            </div>
            <div className="shrink-0 px-6 pb-[max(28px,env(safe-area-inset-bottom))] flex flex-col gap-2.5">
              <PrimaryButton onClick={unstable_retry}>ลองใหม่</PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  // Full reload, not client nav — the crashed root layout must refetch.
                  window.location.href = "/";
                }}
              >
                กลับหน้าหลัก
              </SecondaryButton>
            </div>
          </Screen>
        </div>
      </body>
    </html>
  );
}
