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
  title: "ไม่รู้กินไร — ปัดหาร้านพร้อมกัน",
  description:
    "เถียงกันทุกวันว่าจะกินไหน จบในห้องเดียว — ปัดการ์ดหาร้านพร้อมเพื่อน",
  applicationName: "ไม่รู้กินไร",
  authors: [{ name: "Senna Labs" }],
  creator: "Senna Labs",
  publisher: "Senna Labs",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ไม่รู้กินไร",
  description:
    "เถียงกันทุกวันว่าจะกินไหน จบในห้องเดียว — ปัดการ์ดหาร้านพร้อมเพื่อน",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  author: {
    "@type": "Organization",
    name: "Senna Labs",
    url: "https://sennalabs.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Senna Labs",
    url: "https://sennalabs.com",
  },
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
      <body suppressHydrationWarning>
        {children}
        <link rel="author" type="text/plain" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </body>
    </html>
  );
}
