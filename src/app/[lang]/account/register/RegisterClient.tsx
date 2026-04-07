"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { Locale } from "@/i18n/config";
import { Loader2, AlertCircle } from "lucide-react";
import { SocialAuth } from "@/components/auth/SocialAuth";
import { useStoreHydration } from "@/store/useHydration";

interface RegisterClientProps {
  dictionary: any;
  lang: Locale;
}

export default function RegisterClient({ dictionary, lang }: RegisterClientProps) {
  const hydrated = useStoreHydration();
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
      router.push(`/${lang}/account`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-20 bg-brand-soft/20">
      <div className="w-full max-w-md space-y-8 bg-card p-10 rounded-3xl shadow-xl shadow-brand-dark/5 border border-border relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-primary/20" />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-brand-dark font-medium">{dictionary.auth.register.title}</h1>
          <p className="text-sm text-muted-foreground">{dictionary.auth.register.subtitle}</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">{dictionary.auth.register.firstName}</label>
                <Input
                  name="firstName"
                  placeholder={dictionary.auth.register.firstName}
                  required
                  className="h-12"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">{dictionary.auth.register.lastName}</label>
                <Input
                  name="lastName"
                  placeholder={dictionary.auth.register.lastName}
                  required
                  className="h-12"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark">{dictionary.auth.register.email}</label>
              <Input
                name="email"
                type="email"
                placeholder="hello@example.com"
                required
                className="h-12"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark">{dictionary.auth.register.password}</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-12"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" variant="premium" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              dictionary.auth.register.submit
            )}
          </Button>
        </form>

        <SocialAuth lang={lang} dictionary={dictionary} />

        <div className="text-center text-sm text-muted-foreground mt-6">
          <span className="mr-1">{dictionary.auth.register.haveAccount}</span>
          <Link href={`/${lang}/account/login`} className="text-brand-primary font-medium hover:underline hover:text-brand-dark transition-colors">
            {dictionary.auth.register.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
