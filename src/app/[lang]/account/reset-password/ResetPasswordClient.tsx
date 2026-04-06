"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Locale } from "@/i18n/config";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

interface ResetPasswordClientProps {
  dictionary: any;
  lang: Locale;
}

export default function ResetPasswordClient({ dictionary, lang }: ResetPasswordClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, isLoading, error: storeError, clearError } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || storeError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError(dictionary.validation.passwordsMatch);
      return;
    }

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/${lang}/account/login`);
      }, 3000);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-20 bg-brand-soft/20">
      <div className="w-full max-w-sm space-y-8 bg-card p-10 rounded-3xl shadow-xl shadow-brand-dark/5 border border-border relative overflow-hidden">
        {/* Top decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-primary/20" />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-brand-dark font-medium">
            {dictionary.auth.resetPassword.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dictionary.auth.resetPassword.subtitle}
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-brand-dark font-medium">
                {dictionary.auth.resetPassword.success}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/account/login`}>
                {dictionary.auth.forgotPassword.back}
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">{dictionary.auth.resetPassword.code}</label>
                <Input 
                  type="text" 
                  placeholder={dictionary.auth.resetPassword.codePlaceholder} 
                  required 
                  maxLength={6}
                  className="h-12 text-center text-xl tracking-[0.5em] font-bold" 
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                    if (localError) setLocalError(null);
                    if (storeError) clearError();
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">{dictionary.auth.resetPassword.newPassword}</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-12" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                    if (storeError) clearError();
                  }}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">{dictionary.auth.resetPassword.confirmPassword}</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="h-12" 
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (localError) setLocalError(null);
                    if (storeError) clearError();
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                dictionary.auth.resetPassword.submit
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// Helper to keep Link working in ResetPasswordClient
import Link from "next/link";
