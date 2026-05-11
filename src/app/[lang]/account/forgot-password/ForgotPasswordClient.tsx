"use client";

import { useState } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { AuthShell, authStyles } from "@/components/auth/AuthShell";

const { C, FRAUNCES, SANS, input, label, primaryButton, outlineButton } = authStyles;

interface ForgotPasswordClientProps {
  dictionary: any;
  lang: Locale;
}

export default function ForgotPasswordClient({ dictionary, lang }: ForgotPasswordClientProps) {
  useStoreHydration();
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, error } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch {
      // Error handled by store
    }
  };

  return (
    <AuthShell
      title={dictionary.auth.forgotPassword.title}
      subtitle={isSubmitted ? undefined : dictionary.auth.forgotPassword.subtitle}
    >
      {error && !isSubmitted && (
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

      {isSubmitted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `${C.green}1a`, color: C.green,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle2 size={28} />
            </span>
            <p style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 15, color: C.ink, textAlign: "center", margin: 0, lineHeight: 1.4 }}>
              {dictionary.auth.forgotPassword.success}
            </p>
          </div>
          <Link href={`/${lang}/account/login`} style={outlineButton} className="hover:bg-[rgba(42,29,20,0.05)]">
            <ArrowLeft size={14} />
            {dictionary.auth.forgotPassword.back}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={label}>{dictionary.auth.forgotPassword.email}</label>
            <input
              type="email"
              placeholder="hello@example.com"
              required
              style={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ ...primaryButton, marginTop: 6, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
            className="hover:-translate-y-0.5"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
              <>{dictionary.auth.forgotPassword.submit}<span aria-hidden="true">→</span></>
            )}
          </button>

          <Link
            href={`/${lang}/account/login`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: FRAUNCES, fontWeight: 500, fontSize: 13,
              color: C.ink, opacity: 0.6, textDecoration: "none",
              paddingTop: 8,
            }}
            className="hover:opacity-100"
          >
            <ArrowLeft size={14} />
            {dictionary.auth.forgotPassword.back}
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
