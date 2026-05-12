"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Locale } from "@/i18n/config";
import { Loader2, AlertCircle } from "lucide-react";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useStoreHydration } from "@/store/useHydration";
import { AuthShell, authStyles } from "@/components/auth/AuthShell";

const { C, FRAUNCES, SANS, input, label, primaryButton } = authStyles;

interface RegisterClientProps {
  dictionary: any;
  lang: Locale;
}

export default function RegisterClient({ dictionary, lang }: RegisterClientProps) {
  useStoreHydration();
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
    if (useAuthStore.getState().isAuthenticated) {
      window.location.assign(`/${lang}/account`);
    }
  };

  return (
    <AuthShell title={dictionary.auth.register.title} subtitle={dictionary.auth.register.subtitle} maxWidth={500}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={label}>{dictionary.auth.register.firstName}</label>
            <input
              name="firstName"
              placeholder={dictionary.auth.register.firstName}
              required
              style={input}
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={label}>{dictionary.auth.register.lastName}</label>
            <input
              name="lastName"
              placeholder={dictionary.auth.register.lastName}
              required
              style={input}
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={label}>{dictionary.auth.register.email}</label>
          <input
            name="email"
            type="email"
            placeholder="hello@example.com"
            required
            style={input}
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={label}>{dictionary.auth.register.password}</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            style={input}
            value={formData.password}
            onChange={handleChange}
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
            <>{dictionary.auth.register.submit}<span aria-hidden="true">→</span></>
          )}
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <SocialAuth lang={lang} dictionary={dictionary} />
      </div>

      <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.65, marginTop: 22 }}>
        <span style={{ marginRight: 6 }}>{dictionary.auth.register.haveAccount}</span>
        <Link
          href={`/${lang}/account/login`}
          style={{ fontFamily: FRAUNCES, fontWeight: 600, color: C.burnt, textDecoration: "none" }}
          className="hover:underline"
        >
          {dictionary.auth.register.login}
        </Link>
      </div>
    </AuthShell>
  );
}
