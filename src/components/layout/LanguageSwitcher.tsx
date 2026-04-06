"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18n, Locale } from "@/i18n/config";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
  const pathname = usePathname();

  const redirectedPathname = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  // Helper to store language preference in a cookie
  const setLanguageCookie = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
  };

  return (
    <div 
      className="flex items-center gap-2 px-1 py-1 rounded-full border border-border/40 bg-white/40 backdrop-blur-md shadow-sm transition-all hover:border-brand-primary/20"
      aria-label="Select language"
    >
      <div className="flex items-center">
        {i18n.locales.map((locale) => {
          const isActive = currentLang === locale;
          return (
            <Link
              key={locale}
              href={redirectedPathname(locale)}
              onClick={() => setLanguageCookie(locale)}
              className={`relative px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                isActive ? "text-brand-dark" : "text-brand-dark/40 hover:text-brand-dark/70"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
              {locale}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
