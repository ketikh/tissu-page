"use client";

import { ReactNode } from "react";

// Modern title/body font — Noto Sans Georgian renders Georgian cleanly without
// the dated retro feel. Latin falls back to Nunito and system sans.
const FRAUNCES = "var(--font-noto-sans), var(--font-nunito), 'Inter', system-ui, -apple-system, sans-serif";

const C = {
  cream: "#fef0d6",
  softCream: "#f9f4eb",
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

function scallopPath(width: number, height: number, scallopSize = 18): string {
  const xCount = Math.max(2, Math.floor(width / scallopSize));
  const yCount = Math.max(2, Math.floor(height / scallopSize));
  const dx = width / xCount;
  const dy = height / yCount;

  let d = `M ${dx} 0`;
  for (let i = 1; i < xCount; i++) {
    d += ` A ${dx / 2} ${dx / 2} 0 0 1 ${(i + 1) * dx} 0`;
  }
  for (let j = 1; j < yCount; j++) {
    d += ` A ${dy / 2} ${dy / 2} 0 0 1 ${width} ${(j + 1) * dy}`;
  }
  for (let i = xCount - 1; i >= 0; i--) {
    d += ` A ${dx / 2} ${dx / 2} 0 0 1 ${i * dx} ${height}`;
  }
  for (let j = yCount - 1; j >= 0; j--) {
    d += ` A ${dy / 2} ${dy / 2} 0 0 1 0 ${j * dy}`;
  }
  d += " Z";
  return d;
}

interface AuthShellProps {
  title: string;
  subtitle?: string;
  maxWidth?: number;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, maxWidth = 440, children }: AuthShellProps) {
  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        position: "relative",
        overflow: "hidden",
        padding: "60px 16px 80px",
      }}
    >
      {/* Sprinkled decorative stars */}
      <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "8%", opacity: 0.75 }}><Star size={18} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "10%", opacity: 0.6 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "45%", left: "4%", opacity: 0.5 }}><Star size={14} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "55%", right: "5%", opacity: 0.5 }}><Star size={16} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 100, left: "14%", opacity: 0.55 }}><Star size={12} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 80, right: "16%", opacity: 0.6 }}><Star size={15} color={C.green} /></span>

      {/* Decorative floating shapes (further out) */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 140, left: "-3%",
        width: 90, height: 90,
        background: C.mustard, opacity: 0.18,
        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        transform: "rotate(12deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 60, right: "-3%",
        width: 110, height: 110,
        background: C.burnt, opacity: 0.16,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(-8deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "50%", right: "-2%",
        width: 60, height: 60,
        background: C.green, opacity: 0.16,
        borderRadius: "50%",
      }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth,
        margin: "0 auto",
      }}>
        {/* Burnt accent peeking behind the card (top-left) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -22, left: -28,
            width: 90, height: 90,
            background: C.burnt,
            borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
            transform: "rotate(-14deg)",
            opacity: 0.85,
            zIndex: 0,
          }}
        />
        {/* Mustard accent (bottom-right) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -20, right: -24,
            width: 80, height: 80,
            background: C.mustard,
            borderRadius: "50% 50% 45% 55% / 55% 45% 55% 45%",
            transform: "rotate(18deg)",
            opacity: 0.9,
            zIndex: 0,
          }}
        />
        {/* Cream blob (large, behind everything) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -18,
            background: C.cream,
            borderRadius: "44% 56% 52% 48% / 50% 48% 52% 50%",
            transform: "rotate(-2deg)",
            opacity: 0.92,
            zIndex: 1,
          }}
        />

        {/* Scalloped border — sits between blob and card */}
        <svg
          aria-hidden="true"
          width="100%"
          viewBox="0 0 440 600"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: -8,
            width: "calc(100% + 16px)",
            height: "calc(100% + 16px)",
            zIndex: 2,
            pointerEvents: "none",
            transform: "rotate(1.2deg)",
          }}
        >
          <path
            d={scallopPath(440, 600, 18)}
            fill="none"
            stroke={C.mustard}
            strokeWidth="2"
            strokeOpacity="0.6"
          />
        </svg>

        {/* Card */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            background: "white",
            border: `1.5px solid rgba(42,29,20,0.10)`,
            borderRadius: 22,
            padding: "36px 32px 32px",
            boxShadow: "0 12px 40px rgba(42,29,20,0.06)",
          }}
        >
          {/* Mustard star above the title */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Star size={18} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <h1 style={{
              fontFamily: FRAUNCES, fontWeight: 700,
              fontSize: 32, color: C.ink,
              letterSpacing: "-0.01em", lineHeight: 1.1,
              margin: 0,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontFamily: FRAUNCES, fontStyle: "italic",
                fontSize: 14, color: C.ink, opacity: 0.6,
                margin: "8px 0 0 0",
              }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export const authStyles = {
  FRAUNCES,
  SANS: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  C,
  input: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    width: "100%",
    height: 48,
    padding: "0 16px",
    background: "white",
    border: `1.5px solid rgba(42,29,20,0.14)`,
    borderRadius: 12,
    color: C.ink,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.18s ease",
  } as React.CSSProperties,
  label: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: C.ink,
    opacity: 0.55,
  } as React.CSSProperties,
  primaryButton: {
    background: C.burnt, color: C.cream,
    fontFamily: FRAUNCES, fontWeight: 600, fontSize: 15,
    letterSpacing: "0.02em",
    border: "none",
    borderRadius: 14,
    padding: "14px 22px",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: "pointer",
    transition: "transform 0.18s ease",
    width: "100%",
  } as React.CSSProperties,
  outlineButton: {
    background: "transparent", color: C.ink,
    fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
    letterSpacing: "0.02em",
    border: `1.5px solid rgba(42,29,20,0.18)`,
    borderRadius: 14,
    padding: "12px 22px",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: "pointer",
    transition: "background 0.18s ease",
    width: "100%",
    textDecoration: "none",
  } as React.CSSProperties,
};
