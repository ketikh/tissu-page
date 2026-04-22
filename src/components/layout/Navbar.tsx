"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useStoreHydration } from "@/store/useHydration";
import { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

interface NavbarProps {
  lang: Locale;
  dictionary: any;
}

export function Navbar({ lang, dictionary }: NavbarProps) {
  const hydrated = useStoreHydration();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openCart = useUIStore((state) => state.openCart);
  const cartItemCount = hydrated
    ? useCartStore.getState().getSummary().itemsCount
    : 0;

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const links = [
    { name: dictionary.nav.shop ?? dictionary.nav.collection, href: `/${lang}/shop` },
    { name: lang === "ka" ? "ჩვენი ისტორია" : "Our story", href: `/${lang}/about` },
    { name: lang === "ka" ? "როგორ ვკერავთ" : "How it's made", href: `/${lang}/about#process` },
    { name: lang === "ka" ? "ჟურნალი" : "Journal", href: `/${lang}#journal` },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--tissu-cream)] border-b border-dashed border-[var(--border)]">
      <div className="container flex items-center justify-between gap-6 py-5">
        <Link href={`/${lang}`} className="flex items-center gap-2 group" aria-label="Tissu">
          <span className="font-serif text-[32px] md:text-[36px] leading-none tracking-[0.04em] text-[var(--tissu-terracotta)]">
            TISSU
          </span>
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded-full bg-[var(--tissu-mustard)] -translate-y-3 transition-transform group-hover:-translate-y-4"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2.5 rounded-full text-[15px] font-bold transition-colors",
                  isActive
                    ? "bg-[var(--tissu-ink)] text-[var(--tissu-cream)]"
                    : "text-[var(--tissu-ink-soft)] hover:text-[var(--tissu-ink)] hover:bg-[var(--tissu-white)]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden lg:block">
            <LanguageSwitcher currentLang={lang} />
          </div>
          <Link
            href={`/${lang}/account`}
            className="hidden md:inline-flex w-11 h-11 rounded-full border-[1.5px] border-[var(--tissu-ink)] items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
            aria-label={dictionary.nav.account}
          >
            <User className="w-[18px] h-[18px]" />
          </Link>
          <button
            type="button"
            aria-label={lang === "ka" ? "ძებნა" : "Search"}
            className="w-11 h-11 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label={dictionary.nav.cart}
            className="relative w-11 h-11 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-[var(--tissu-terracotta)] text-white text-[11px] font-extrabold inline-flex items-center justify-center px-1.5 border-2 border-[var(--tissu-cream)]"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden w-11 h-11 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)]"
            aria-label={dictionary.common.menu || (lang === "ka" ? "მენიუ" : "Menu")}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-[rgba(42,29,20,0.4)] backdrop-blur-[4px] z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-[var(--tissu-cream)] z-[60] shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center px-7 py-6 border-b border-dashed border-[var(--border)]">
                <span className="font-serif text-[28px] text-[var(--tissu-terracotta)]">TISSU</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-10 h-10 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center"
                  aria-label={dictionary.common.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-2 px-7 py-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-serif text-[26px] text-[var(--tissu-ink)] hover:text-[var(--tissu-terracotta)] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto px-7 py-6 border-t border-dashed border-[var(--border)] flex items-center justify-between">
                <LanguageSwitcher currentLang={lang} />
                <Link
                  href={`/${lang}/account`}
                  className="flex items-center gap-2 text-sm font-bold text-[var(--tissu-ink)] hover:text-[var(--tissu-terracotta)] transition-colors"
                >
                  <User className="w-4 h-4" />
                  {dictionary.nav.account}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
