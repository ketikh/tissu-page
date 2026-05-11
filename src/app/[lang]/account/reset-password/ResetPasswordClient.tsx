"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { AuthShell, authStyles } from "@/components/auth/AuthShell";

const { C, FRAUNCES, SANS, input, label, primaryButton, outlineButton } = authStyles;

interface ResetPasswordClientProps {
  dictionary: any;
  lang: Locale;
}

export default function ResetPasswordClient({ dictionary, lang }: ResetPasswordClientProps) {
  useStoreHydration();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, isLoading, error: storeError, clearError } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || storeError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError(dictionary.validation?.passwordsMatch || "Passwords do not match");
      return;
    }

    try {
      await resetPassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/${lang}/account/login`);
      }, 3000);
    } catch {
      // Error handled by store
    }
  };

  return (
    <AuthShell
      title={dictionary.auth.resetPassword.title}
      subtitle={dictionary.auth.resetPassword.subtitle}
    >
      {isSuccess ? (
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
              {dictionary.auth.resetPassword.success}
            </p>
          </div>
          <Link href={`/${lang}/account/login`} style={outlineButton} className="hover:bg-[rgba(42,29,20,0.05)]">
            {dictionary.auth.forgotPassword.back}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
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

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={label}>{dictionary.auth.resetPassword.newPassword}</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              style={input}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError(null);
                if (storeError) clearError();
              }}
              disabled={isLoading}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={label}>{dictionary.auth.resetPassword.confirmPassword}</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              style={input}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (localError) setLocalError(null);
                if (storeError) clearError();
              }}
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
              <>{dictionary.auth.resetPassword.submit}<span aria-hidden="true">→</span></>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
