"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient mouse effects:
 * 1. A soft radial glow that trails the cursor (screen blend, lerped for smoothness).
 * 2. Feeds --mx / --my CSS vars into every .glass-card so each card gets a
 *    pointer-tracking spotlight via its ::before layer.
 */
export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;
    let raf = 0;
    let lastCardScan = 0;

    const scanCards = () => {
      document.querySelectorAll<HTMLElement>(".glass-card").forEach((card) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty(
          "--mx",
          `${Math.min(Math.max(targetX - r.left, 0), r.width)}px`
        );
        card.style.setProperty(
          "--my",
          `${Math.min(Math.max(targetY - r.top, 0), r.height)}px`
        );
      });
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const now = performance.now();
      if (now - lastCardScan > 200) {
        lastCardScan = now;
        // Only touch card styles on user movement — never at mount — so we
        // never mutate React-managed DOM during the hydration window.
        scanCards();
      }
    };

    const onResize = () => scanCards();

    const tick = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      glow.style.opacity = "1";
      glow.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[600px] w-[600px] rounded-full opacity-0"
      style={{
        background:
          "radial-gradient(circle, rgba(16,185,129,0.07) 0%, rgba(255,255,255,0.045) 35%, transparent 70%)",
        mixBlendMode: "screen",
        willChange: "transform",
      }}
    />
  );
}
