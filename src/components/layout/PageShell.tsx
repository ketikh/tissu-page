import { ReactNode } from "react";

/**
 * Shared page-frame wrapper for the static text pages (about, FAQ, terms,
 * privacy). Renders the cream-dot pattern background, sprinkled mustard
 * stars and a few colourful pebbles so every "info" page reads in the same
 * home-page vibe with no per-page boilerplate.
 */

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

function Star({ size = 14, color = C.mustard }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

export function PageShell({
  children,
  decoration = "full",
}: {
  children: ReactNode;
  /** "full" = stars + pebbles + squiggles, "minimal" = only soft background. */
  decoration?: "full" | "minimal";
}) {
  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {decoration === "full" && (
        <>
          {/* Sprinkled stars */}
          <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "5%", opacity: 0.85 }}><Star size={18} /></span>
          <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "8%", opacity: 0.7 }}><Star size={12} color={C.burnt} /></span>
          <span aria-hidden="true" style={{ position: "absolute", top: "35%", right: "3%", opacity: 0.6 }}><Star size={14} color={C.rose} /></span>
          <span aria-hidden="true" style={{ position: "absolute", top: "55%", left: "3%", opacity: 0.55 }}><Star size={14} color={C.green} /></span>
          <span aria-hidden="true" style={{ position: "absolute", bottom: 200, left: "8%", opacity: 0.7 }}><Star size={16} /></span>
          <span aria-hidden="true" style={{ position: "absolute", bottom: 320, right: "10%", opacity: 0.6 }}><Star size={13} color={C.burnt} /></span>

          {/* Floating pebbles */}
          <div aria-hidden="true" style={{ position: "absolute", top: 220, left: "-3%", width: 110, height: 110, background: C.burnt, opacity: 0.22, borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%", transform: "rotate(-12deg)" }} />
          <div aria-hidden="true" style={{ position: "absolute", top: 80, right: "-2%", width: 90, height: 90, background: C.mustard, opacity: 0.32, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%", transform: "rotate(18deg)" }} />
          <div aria-hidden="true" style={{ position: "absolute", top: "45%", left: "-2%", width: 70, height: 70, background: C.green, opacity: 0.22, borderRadius: "50%" }} />
          <div aria-hidden="true" style={{ position: "absolute", top: "55%", right: "-3%", width: 100, height: 100, background: C.rose, opacity: 0.24, borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%", transform: "rotate(-6deg)" }} />
          <div aria-hidden="true" style={{ position: "absolute", bottom: 60, right: "-3%", width: 130, height: 130, background: C.mustard, opacity: 0.28, borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%", transform: "rotate(10deg)" }} />

          {/* Squiggle accents */}
          <svg aria-hidden="true" style={{ position: "absolute", top: 250, right: "12%", opacity: 0.55, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
            <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.burnt} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <svg aria-hidden="true" style={{ position: "absolute", bottom: 280, left: "16%", opacity: 0.55, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
            <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
