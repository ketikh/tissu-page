"use client";

import { useState } from "react";
import { Locale } from "@/i18n/config";
import { Loader2, Lock, AlertCircle } from "lucide-react";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
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

function Star({ size = 14, color = C.mustard }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

export default function AdminLoginClient({ lang, next }: { lang: Locale; next?: string }) {
  const _lang = lang;
  void _lang;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Login failed");
      }
      // Hard navigation so the new cookie is on the next request.
      window.location.assign(next || `/${lang}/admin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        position: "relative",
        overflow: "hidden",
        padding: "60px 16px 80px",
        minHeight: "100vh",
      }}
    >
      <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "8%", opacity: 0.75 }}><Star size={18} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "10%", opacity: 0.6 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 80, right: "16%", opacity: 0.6 }}><Star size={15} color={C.green} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 100, left: "14%", opacity: 0.55 }}><Star size={12} /></span>

      <div aria-hidden="true" style={{ position: "absolute", top: 140, left: "-3%", width: 90, height: 90, background: C.mustard, opacity: 0.32, borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%", transform: "rotate(12deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 60, right: "-3%", width: 110, height: 110, background: C.burnt, opacity: 0.22, borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%", transform: "rotate(-8deg)" }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
      }}>
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
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "white",
            border: `1.5px solid rgba(42,29,20,0.10)`,
            borderRadius: 22,
            padding: "36px 32px 32px",
            boxShadow: "0 12px 40px rgba(42,29,20,0.06)",
            overflow: "hidden",
          }}
        >
          <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.burnt }} />

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <span style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `${C.burnt}1f`, color: C.burnt,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <Lock size={20} />
            </span>
          </div>

          <h1 style={{
            fontFamily: FRAUNCES, fontWeight: 700,
            fontSize: 26, color: C.ink,
            letterSpacing: "-0.005em", lineHeight: 1.15,
            margin: 0, textAlign: "center",
          }}>
            Admin login
          </h1>
          <p style={{
            fontFamily: FRAUNCES, fontStyle: "italic",
            fontSize: 13, color: C.ink, opacity: 0.6,
            textAlign: "center", margin: "6px 0 0",
          }}>
            შესვლა მხოლოდ Tissu-ს ადმინებისთვის
          </p>

          {error && (
            <div style={{
              marginTop: 20,
              background: `${C.rose}1a`,
              border: `1px solid ${C.rose}33`,
              color: C.rose,
              fontFamily: SANS, fontSize: 12,
              padding: "10px 12px",
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
            <Field label="Username">
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
                placeholder="admin"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 6,
                background: C.burnt, color: C.cream,
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 15,
                letterSpacing: "0.02em",
                border: "none",
                borderRadius: 14,
                padding: "14px 22px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
                transition: "transform 0.18s ease",
              }}
              className="hover:-translate-y-0.5"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <Lock size={14} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p style={{
            fontFamily: SANS, fontSize: 11, color: C.ink, opacity: 0.45,
            textAlign: "center", margin: "18px 0 0", lineHeight: 1.5,
          }}>
            ცალკე ცვლადებშია — ADMIN_USERNAME / ADMIN_PASSWORD env-ში
          </p>
        </div>
      </div>
    </div>
  );
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
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: C.ink, opacity: 0.55, marginLeft: 4,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
