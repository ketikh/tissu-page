"use client";

/**
 * Phones run out of GPU/memory budget when our home page tries to keep ~10
 * framer-motion infinite loops alive (floating flowers, marquees, mirror
 * flips). The browser then evicts off-screen content under pressure, so
 * scrolling back up shows blank gaps that have to re-paint.
 *
 * MotionConfig with reducedMotion="always" tells every <motion.*> child to
 * snap to its final value instead of running the transition (including
 * infinite repeat loops). We flip it on below 768px so desktop keeps the
 * full retro animation and phones stay smooth.
 */
import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function MobileMotionGate({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
