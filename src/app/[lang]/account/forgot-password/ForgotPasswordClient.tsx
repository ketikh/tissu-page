"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Locale } from "@/i18n/config";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";

interface ForgotPasswordClientProps {
  dictionary: any;
  lang: Locale;
}

export default function ForgotPasswordClient({ dictionary, lang }: ForgotPasswordClientProps) {
  useStoreHydration();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
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
            {dictionary.auth.forgotPassword.title}
          </h1>
          {!isSubmitted && (
            <p className="text-sm text-muted-foreground">
              {dictionary.auth.forgotPassword.subtitle}
            </p>
          )}
        </div>

        {error && !isSubmitted && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-brand-dark font-medium">
                {dictionary.auth.forgotPassword.success}
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark">{dictionary.auth.forgotPassword.email}</label>
              <Input 
                type="email" 
                placeholder="hello@example.com" 
                required 
                className="h-12" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" variant="premium" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                dictionary.auth.forgotPassword.submit
              )}
            </Button>

            <Link 
              href={`/${lang}/account/login`} 
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-brand-primary transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {dictionary.auth.forgotPassword.back}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
