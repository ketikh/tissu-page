"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Locale } from "@/i18n/config";
import { Loader2, AlertCircle } from "lucide-react";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { AUTH_CONFIG } from "@/lib/config/auth.config";
import { useStoreHydration } from "@/store/useHydration";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

function Star({ size = 14, color = C.mustard, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    >
      <path
        d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
        fill={color}
      />
    </svg>
  );
}

/* Scalloped border path — used as decorative outline around the form card */
function scallopPath(width: number, height: number, scallopSize = 14): string {
  const r = scallopSize / 2;
  const xCount = Math.floor(width / scallopSize);
  const yCount = Math.floor(height / scallopSize);
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

const inputStyle: React.CSSProperties = {
  fontFamily: SANS,
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
};

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.ink,
  opacity: 0.55,
};

interface LoginClientProps {
  dictionary: any;
  lang: Locale;
}

export default function LoginClient({ dictionary, lang }: LoginClientProps) {
  useStoreHydration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${lang}${AUTH_CONFIG.REDIRECTS.AFTER_LOGIN}`;

  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isKa = lang === "ka";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    if (useAuthStore.getState().isAuthenticated) {
      router.push(callbackUrl);
    }
  };

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
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "10%", opacity: 0.55 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "50%", left: "4%", opacity: 0.5 }}><Star size={14} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "55%", right: "5%", opacity: 0.5 }}><Star size={16} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 100, left: "14%", opacity: 0.55 }}><Star size={12} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 80, right: "16%", opacity: 0.6 }}><Star size={15} /></span>

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
      }}>
        {/* Behind: rotated softCream blob with rounded asymmetric corners */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -18,
            background: C.cream,
            borderRadius: "44% 56% 52% 48% / 50% 48% 52% 50%",
            transform: "rotate(-2deg)",
            opacity: 0.85,
            zIndex: 0,
          }}
        />

        {/* Decorative scalloped frame (SVG) — sits between blob and card */}
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
            zIndex: 1,
            pointerEvents: "none",
            transform: "rotate(1.2deg)",
          }}
        >
          <path
            d={scallopPath(440, 600, 18)}
            fill="none"
            stroke={C.mustard}
            strokeWidth="2"
            strokeOpacity="0.55"
          />
        </svg>

        {/* Card */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
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
              {dictionary.auth.login.title}
            </h1>
            <p style={{
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 14, color: C.ink, opacity: 0.6,
              margin: "8px 0 0 0",
            }}>
              {dictionary.auth.login.subtitle}
            </p>
          </div>

          {error && (
            <div style={{
              background: `${C.rose}1a`,
              border: `1px solid ${C.rose}33`,
              color: C.rose,
              fontFamily: SANS, fontSize: 12,
              padding: "10px 12px",
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 18,
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>{dictionary.auth.login.email}</label>
              <input
                type="email"
                placeholder="hello@example.com"
                required
                style={inputStyle}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) clearError();
                }}
                disabled={isLoading}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label style={labelStyle}>{dictionary.auth.login.password}</label>
                <Link
                  href={`/${lang}/account/forgot-password`}
                  style={{
                    fontFamily: FRAUNCES, fontWeight: 500, fontSize: 12,
                    color: C.burnt, textDecoration: "none",
                  }}
                  className="hover:underline"
                >
                  {dictionary.auth.login.forgot}
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                required
                style={inputStyle}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) clearError();
                }}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 6,
                background: C.burnt, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 15,
                letterSpacing: "0.02em",
                border: "none",
                borderRadius: 14,
                padding: "14px 22px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "transform 0.18s ease",
              }}
              className="hover:-translate-y-0.5"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {dictionary.auth.login.submit}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 20 }}>
            <SocialAuth lang={lang} dictionary={dictionary} />
          </div>

          <div style={{
            textAlign: "center",
            fontFamily: SANS, fontSize: 13,
            color: C.ink, opacity: 0.65,
            marginTop: 22,
          }}>
            <span style={{ marginRight: 6 }}>{dictionary.auth.login.noAccount}</span>
            <Link
              href={`/${lang}/account/register`}
              style={{
                fontFamily: FRAUNCES, fontWeight: 600,
                color: C.burnt, textDecoration: "none",
              }}
              className="hover:underline"
            >
              {dictionary.auth.login.register}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
