import type { Metadata, Viewport } from "next";
import { Mitr, Sarabun } from "next/font/google";
import "./globals.css";

// Display font — headings, buttons, big numbers.
const mitr = Mitr({
  variable: "--font-mitr",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

// Body font — paragraphs, labels, captions.
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Restaurant Match — ปัดหาร้านพร้อมกัน",
  description:
    "เลิกเถียงว่าจะกินอะไร — ปัดการ์ดหาร้านพร้อมเพื่อน แล้วให้ดวงตัดสิน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${mitr.variable} ${sarabun.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
