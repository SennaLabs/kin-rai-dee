import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ไม่รู้กินไร — ปัดหาร้านพร้อมกัน",
    short_name: "ไม่รู้กินไร",
    description:
      "เถียงกันทุกวันว่าจะกินไหน จบในห้องเดียว — ปัดการ์ดหาร้านพร้อมเพื่อน",
    start_url: "/",
    display: "standalone",
    background_color: "#F4574F",
    theme_color: "#F4574F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
