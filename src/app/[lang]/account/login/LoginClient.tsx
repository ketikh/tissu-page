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
import { AuthShell, authStyles } from "@/components/auth/AuthShell";

const { C, FRAUNCES, SANS, input, label, primaryButton } = authStyles;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    if (useAuthStore.getState().isAuthenticated) {
      // Hard navigation so middleware sees the freshly-set Supabase cookies
      // on the next request — router.push() can race the cookie write.
      window.location.assign(callbackUrl);
    }
  };

  return (
    <AuthShell title={dictionary.auth.login.title} subtitle={dictionary.auth.login.subtitle}>
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
          <label style={label}>{dictionary.auth.login.email}</label>
          <input
            type="email"
            placeholder="hello@example.com"
            required
            style={input}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
            disabled={isLoading}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={label}>{dictionary.auth.login.password}</label>
            <Link
              href={`/${lang}/account/forgot-password`}
              style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: 12, color: C.burnt, textDecoration: "none" }}
              className="hover:underline"
            >
              {dictionary.auth.login.forgot}
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            required
            style={input}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
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
            <>{dictionary.auth.login.submit}<span aria-hidden="true">→</span></>
          )}
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <SocialAuth lang={lang} dictionary={dictionary} />
      </div>

      <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.65, marginTop: 22 }}>
        <span style={{ marginRight: 6 }}>{dictionary.auth.login.noAccount}</span>
        <Link
          href={`/${lang}/account/register`}
          style={{ fontFamily: FRAUNCES, fontWeight: 600, color: C.burnt, textDecoration: "none" }}
          className="hover:underline"
        >
          {dictionary.auth.login.register}
        </Link>
      </div>
    </AuthShell>
  );
}
