"use client";

import { useEffect, useRef } from "react";

type ConfettiProps = {
  /** trigger the burst */
  fire: boolean;
  /** skip the burst entirely when reduced motion is preferred */
  reduced: boolean;
};

/** One-shot canvas confetti burst. */
export function Confetti({ fire, reduced }: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fire || reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = canvas.offsetHeight * 2);
    const colors = [
      "#FF5A3C",
      "#FFB627",
      "#FFC845",
      "#E63946",
      "#FF7A5E",
      "#1E9E6A",
      "#FF4D2E",
    ];
    const N = 130;
    const parts = Array.from({ length: N }, () => {
      const ang = Math.random() * Math.PI * 2;
      const sp = 6 + Math.random() * 16;
      return {
        x: W / 2,
        y: H * 0.42,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 8,
        g: 0.28 + Math.random() * 0.2,
        s: 8 + Math.random() * 12,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        c: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() > 0.5 ? "rect" : "circ",
        life: 1,
      };
    });

    let raf = 0;
    let t = 0;
    function frame() {
      if (!ctx) return;
      t++;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.vx *= 0.99;
        if (t > 60) p.life -= 0.012;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.shape === "rect") ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
        else {
          ctx.beginPath();
          ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (t < 170) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    }
    frame();
    return () => cancelAnimationFrame(raf);
  }, [fire, reduced]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 40,
      }}
    />
  );
}
