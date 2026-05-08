"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useStoreHydration } from "@/store/useHydration";
import { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

interface NavbarProps {
  lang: Locale;
  dictionary: any;
}

const HIDE_ON_ROUTES = ["/preview-retro", "/preview-hero"];
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  border: "rgba(42,29,20,0.18)",
};

const TISSU_PATHS = [
  "M223.3,341.6c-17.2,0-29.8-4.6-37.7-13.7-8-9.1-11.9-22.4-11.9-39.8s.4-17.9,1.3-25.2c.9-7.3,1.8-14.4,2.7-21.4.9-6.9,1.8-14.1,2.7-21.4.9-7.3,1.3-15.7,1.3-25.2s0-7.2-.2-11c-.1-3.7-.5-7.1-1.2-10.2-.6-3.1-1.7-5.6-3.3-7.7-1.5-2.1-3.7-3.1-6.5-3.1-4.4,0-8.2,0-11.4.2-3.2.1-6.4.3-9.4.4-3.1.1-6.5.3-10.2.4-3.7.1-8.3.2-13.7.2s-6.7-2.2-9.4-6.5c-2.7-4.4-4.9-9.4-6.7-15.2-1.8-5.8-3.1-11.4-4-16.9-.9-5.5-1.3-9.6-1.3-12.1s0-3.1-.2-4.8c-.1-1.7,0-3.3.6-4.8,1.5-7.7,5.6-14.1,12.3-19.1,6.7-5,15.2-8.9,25.6-11.5,10.4-2.7,22.3-4.6,35.6-5.6,13.3-1,27.5-1.5,42.3-1.5s29.4.5,43.5,1.5c14.1,1,26.6,3.3,37.5,6.9,10.9,3.6,19.7,8.7,26.4,15.2,6.7,6.5,10,15.5,10,26.8s-.2,9.9-.6,15.8c-.4,5.9-1.3,11.5-2.7,16.9-1.4,5.4-3.3,9.9-5.8,13.5-2.4,3.6-5.6,5.4-9.4,5.4s-11.2-.8-18.3-2.3c-7.1-1.5-14.6-2.3-22.5-2.3s-7.3.5-9.6,1.5c-2.3,1-4,2.5-5,4.4-1,1.9-1.6,4.2-1.7,6.9-.1,2.7-.2,5.6-.2,8.7,0,10.3.6,19.8,1.9,28.5,1.3,8.7,2.7,17.3,4.2,25.8,1.5,8.5,2.9,17.3,4.2,26.4,1.3,9.1,1.9,19.3,1.9,30.6s-1.4,14.4-4.2,20.2c-2.8,5.8-6.6,10.5-11.4,14.2-4.8,3.7-10.2,6.5-16.4,8.3-6.2,1.8-12.6,2.7-19.2,2.7Z",
  "M405.8,334.7c-17.2,0-30.2-4.8-39.1-14.4-8.9-9.6-14.3-23-16.4-40.2-3.6-31.6-4.9-62.8-4-93.5.9-30.8,3.5-61.7,7.9-92.8.8-5.4,3-9.9,6.7-13.7,3.7-3.7,8.1-6.6,13.1-8.7,5-2.1,10.1-3.5,15.4-4.4,5.3-.9,9.9-1.3,14.1-1.3,9.8,0,18.5,2.3,26.4,6.9,7.8,4.6,12.8,13,14.8,25,2.3,13.3,4.2,28.6,5.8,45.6,1.5,17.1,2.9,34.5,4,52.4,1.2,17.8,2,35.4,2.5,52.7.5,17.3.8,32.9.8,46.8s-1.7,12.9-5,17.9c-3.3,5-7.5,9.1-12.5,12.3-5,3.2-10.6,5.6-16.7,7.1-6.2,1.5-12.1,2.3-17.7,2.3Z",
  "M572.9,340.1c-18,0-33.5-1-46.6-3.1-13.1-2.1-23.7-5.5-32-10.4-8.2-4.9-14.3-11.2-18.3-19.1-4-7.8-6-17.6-6-29.5s3.7-28.1,11.2-36.6c7.4-8.5,15.9-12.7,25.4-12.7s8.5,1.2,12.5,3.7c4,2.4,8.3,5.1,12.9,7.9,4.6,2.8,9.8,5.5,15.6,7.9,5.8,2.4,12.5,3.7,20.2,3.7s4.7-.3,8.1-1c3.3-.6,5-2.5,5-5.6s-1.9-6.7-5.6-10c-3.7-3.3-6.9-5.9-9.4-7.7-6.4-4.6-13-8.5-19.8-11.5-6.8-3.1-13.3-6-19.6-8.9-6.3-2.8-12.3-5.8-18.1-9-5.8-3.2-10.8-7.2-15-12.1-4.2-4.9-7.6-10.9-10-18.1-2.4-7.2-3.7-16-3.7-26.6s2.6-25.5,7.9-35.6c5.3-10.1,12.3-18.6,21.2-25.4,8.9-6.8,19.1-11.9,30.6-15.4,11.5-3.5,23.6-5.2,36.2-5.2,38.2,0,67.2,4.8,86.8,14.4,19.6,9.6,29.5,24.6,29.5,44.9s-1,8-3.1,13.1c-2.1,5.1-4.7,10-7.9,14.6-3.2,4.6-6.9,8.6-11,11.9-4.1,3.3-8.2,5-12.3,5s-6.5-1-9.6-2.9c-3.1-1.9-6.6-4-10.6-6.4-4-2.3-8.7-4.4-14.2-6.4-5.5-1.9-12.5-2.9-21-2.9s-2.4,0-4.2.2c-1.8.1-3.5.5-5,1-1.5.5-2.9,1.2-4,2.1-1.2.9-1.7,2.2-1.7,4,0,3.8,1.9,7.3,5.6,10.2,3.7,3,8.2,5.6,13.5,7.9,5.3,2.3,10.6,4.4,16,6.2,5.4,1.8,9.6,3.3,12.7,4.6,8,3.3,15.7,6.4,23.3,9.2,7.6,2.8,14.3,6.5,20.2,11,5.9,4.5,10.6,10.3,14.2,17.5,3.6,7.2,5.4,16.6,5.4,28.1,0,32.3-10.1,55.9-30.4,70.6-20.3,14.8-51.8,22.1-94.7,22.1Z",
  "M810.4,340.1c-18,0-33.5-1-46.6-3.1-13.1-2.1-23.7-5.5-32-10.4-8.2-4.9-14.3-11.2-18.3-19.1-4-7.8-6-17.6-6-29.5s3.7-28.1,11.2-36.6c7.4-8.5,15.9-12.7,25.4-12.7s8.5,1.2,12.5,3.7c4,2.4,8.3,5.1,12.9,7.9,4.6,2.8,9.8,5.5,15.6,7.9,5.8,2.4,12.5,3.7,20.2,3.7s4.7-.3,8.1-1c3.3-.6,5-2.5,5-5.6s-1.9-6.7-5.6-10c-3.7-3.3-6.9-5.9-9.4-7.7-6.4-4.6-13-8.5-19.8-11.5-6.8-3.1-13.3-6-19.6-8.9-6.3-2.8-12.3-5.8-18.1-9-5.8-3.2-10.8-7.2-15-12.1-4.2-4.9-7.6-10.9-10-18.1-2.4-7.2-3.7-16-3.7-26.6s2.6-25.5,7.9-35.6c5.3-10.1,12.3-18.6,21.2-25.4,8.9-6.8,19.1-11.9,30.6-15.4,11.5-3.5,23.6-5.2,36.2-5.2,38.2,0,67.2,4.8,86.8,14.4,19.6,9.6,29.5,24.6,29.5,44.9s-1,8-3.1,13.1c-2.1,5.1-4.7,10-7.9,14.6-3.2,4.6-6.9,8.6-11,11.9-4.1,3.3-8.2,5-12.3,5s-6.5-1-9.6-2.9c-3.1-1.9-6.6-4-10.6-6.4-4-2.3-8.7-4.4-14.2-6.4-5.5-1.9-12.5-2.9-21-2.9s-2.4,0-4.2.2c-1.8.1-3.5.5-5,1-1.5.5-2.9,1.2-4,2.1-1.2.9-1.7,2.2-1.7,4,0,3.8,1.9,7.3,5.6,10.2,3.7,3,8.2,5.6,13.5,7.9,5.3,2.3,10.6,4.4,16,6.2,5.4,1.8,9.6,3.3,12.7,4.6,8,3.3,15.7,6.4,23.3,9.2,7.6,2.8,14.3,6.5,20.2,11,5.9,4.5,10.6,10.3,14.2,17.5,3.6,7.2,5.4,16.6,5.4,28.1,0,32.3-10.1,55.9-30.4,70.6-20.3,14.8-51.8,22.1-94.7,22.1Z",
  "M1020.8,341c-11.1-4.3-21.6-10.1-31.3-16.9-18.9-13.3-24.4-27.9-30.9-49.6-3.3-11.2-5.9-22.5-7.7-34.1-1.8-11.5-3-22.8-3.5-33.9-.5-11-.8-20.7-.8-28.9,0-13.6.3-27.5,1-41.6.6-14.1,2.1-27.8,4.4-41.2,1-5.4,3.3-9.9,6.7-13.7,3.5-3.7,7.6-6.7,12.3-9,4.7-2.3,9.8-4,15.2-5,5.4-1,10.5-1.5,15.4-1.5s10.5.6,16,1.7c5.5,1.2,10.7,3,15.6,5.4,4.9,2.4,8.9,5.8,11.9,10,3.1,4.2,4.6,9.4,4.6,15.6s-.3,8.7-1,12.9c-.6,4.2-1.2,8.5-1.7,12.9-1.3,8.2-2.1,16.3-2.5,24.3-.4,8-.6,16-.6,24.3s0,6.5.2,11.9c.1,5.4.4,11.4,1,18.1.5,6.7,1.2,13.5,2.1,20.6.9,7.1,2.2,13.5,3.8,19.4,1.7,5.9,3.7,10.7,6,14.4,2.3,3.7,5.1,5.6,8.5,5.6s6.5-2.2,8.9-6.7c2.3-4.5,4.2-10.1,5.6-16.9,1.4-6.8,2.5-14.4,3.3-22.9.8-8.5,1.3-16.6,1.7-24.4.4-7.8.6-14.9.6-21.4v-13.9c0-11.3-1.3-21.2-4-29.8-2.7-8.6-4-17-4-25.2s1.3-11.4,3.8-15.8c2.6-4.4,6-8,10.2-10.8,4.2-2.8,8.9-4.9,14.1-6.2,5.1-1.3,10.4-1.9,15.8-1.9,9.2,0,17.1,2.2,23.5,6.5,6.4,4.4,11.7,10.1,16,17.3,4.2,7.2,7.5,15.3,9.8,24.4,2.3,9.1,4,18.3,5.2,27.5,1.2,9.2,1.9,18.3,2.1,27.1.3,8.9.4,16.5.4,22.9,0,45.7,5.1,93.2-31.7,127.6-24.5,22.9-59.6,33-92.9,29.1-11.3-1.3-22.4-4.2-33.1-8.3Z",
];

function TissuLogo({ fill = C.burnt, className = "" }: { fill?: string; className?: string }) {
  return (
    <svg viewBox="0 0 1282.8 410" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: "block" }} aria-hidden="true">
      <g fill={fill}>
        {TISSU_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

export function Navbar({ lang, dictionary }: NavbarProps) {
  const hydrated = useStoreHydration();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const openCart = useUIStore((state) => state.openCart);
  const cartItemCount = hydrated ? useCartStore.getState().getSummary().itemsCount : 0;
  const copy = getLandingCopy(lang);

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const isHidden = isHome || HIDE_ON_ROUTES.some((p) => pathname?.includes(p));
  const isProductPage = !!pathname?.includes(`/${lang}/product/`);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setIsMobileOpen(false); setShopOpen(false); }, [pathname]);

  if (isHidden) return null;

  const categories = [
    { label: lang === "ka" ? "ყველა პროდუქტი" : "All products", href: `/${lang}/shop` },
    { label: copy.shop.filters.bag, href: `/${lang}/shop?category=tote` },
    { label: copy.shop.filters.pouch, href: `/${lang}/shop?category=pouch` },
    { label: copy.shop.filters.laptop, href: `/${lang}/shop?category=laptop` },
    { label: copy.shop.filters.kidsbackpack, href: `/${lang}/shop?category=kidsbackpack` },
    { label: copy.shop.filters.apron, href: `/${lang}/shop?category=apron` },
    { label: copy.shop.filters.necklace, href: `/${lang}/shop?category=necklace` },
  ];

  const rightLinks = [
    { name: copy.nav.story, href: `/${lang}/about` },
  ];

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: isProductPage ? "transparent" : "white",
        boxShadow: isProductPage ? "none" : "0 1px 6px rgba(42,29,20,0.08)",
        position: "relative",
        paddingBottom: 0,
      }}
    >
      {/* ── Top accent stripe (hidden on product page) ── */}
      {!isProductPage && (
        <div
          style={{
            height: 3,
            background: "linear-gradient(to right, #f3b62b, #d56826, #c4849a, #f3b62b)",
          }}
        />
      )}

      {/* ── Desktop: 3-column centred-logo layout ── */}
      <div className="hidden md:grid grid-cols-3 items-center px-6 py-3">

        {/* LEFT — Shop dropdown + extra links */}
        <div className="flex items-center gap-1">
          {/* Shop with dropdown */}
          <div className="relative" ref={shopRef}>
            <button
              type="button"
              onClick={() => setShopOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] rounded-full transition-colors"
              style={{ fontFamily: FRAUNCES, color: shopOpen ? C.burnt : C.ink, background: shopOpen ? "rgba(213,104,38,0.08)" : "transparent" }}
            >
              {copy.nav.shop}
              <motion.span animate={{ rotate: shopOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            </button>

            <AnimatePresence>
              {shopOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 top-full mt-2 min-w-[200px] z-50 rounded-2xl overflow-hidden"
                  style={{ background: C.cream, border: `1.5px solid rgba(201,168,108,0.4)`, boxShadow: `0 8px 32px rgba(196,132,154,0.18)` }}
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setShopOpen(false)}
                      className="block px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[#d56826] hover:text-[#fef0d6]"
                      style={{ fontFamily: FRAUNCES, color: C.ink, borderBottom: `1px solid ${C.border}` }}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {rightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] rounded-full transition-colors hover:text-[#d56826] after:content-[''] after:block after:w-1 after:h-1 after:rounded-full after:bg-[#d56826] after:mx-auto after:mt-0.5 after:opacity-0 hover:after:opacity-100"
              style={{ fontFamily: FRAUNCES, color: pathname === link.href ? C.burnt : C.ink }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CENTER — TISSU logo */}
        <div className="flex justify-center">
          <Link href={`/${lang}`} aria-label="Tissu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/static/logo.svg" alt="Tissu" className="h-8 w-auto" />
          </Link>
        </div>

        {/* RIGHT — Language + Account + Cart */}
        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher currentLang={lang} />

          <Link
            href={`/${lang}/account`}
            className="w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors hover:bg-[rgba(201,168,108,0.18)]"
            style={{ border: `1.5px solid rgba(201,168,108,0.5)`, color: C.ink }}
            aria-label={dictionary.nav.account}
          >
            <User className="w-[17px] h-[17px]" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-label={dictionary.nav.cart}
            className="relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors hover:bg-[rgba(201,168,108,0.18)]"
            style={{ border: `1.5px solid rgba(201,168,108,0.5)`, color: C.ink }}
          >
            <ShoppingBag className="w-[17px] h-[17px]" />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-[#d56826] text-white text-[10px] font-extrabold inline-flex items-center justify-center px-1 border-2 border-[#fef0d6]"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile: hamburger · TISSU · cart ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-10 h-10 rounded-full inline-flex items-center justify-center"
          style={{ border: `1.5px solid rgba(201,168,108,0.5)`, color: C.ink }}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href={`/${lang}`} aria-label="Tissu">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/static/logo.svg" alt="Tissu" className="h-7 w-auto" />
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label={dictionary.nav.cart}
          className="relative w-10 h-10 rounded-full inline-flex items-center justify-center"
          style={{ border: `1.5px solid rgba(201,168,108,0.5)`, color: C.ink }}
        >
          <ShoppingBag className="w-[17px] h-[17px]" />
          <AnimatePresence>
            {cartItemCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-[#d56826] text-white text-[10px] font-extrabold inline-flex items-center justify-center px-1 border-2 border-[#fef0d6]"
              >
                {cartItemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Wavy bottom border */}
      <div style={{ height: 10, lineHeight: 0, overflow: "hidden" }}>
        <svg viewBox="0 0 1440 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <path d="M0,5 Q40,0 80,5 Q120,10 160,5 Q200,0 240,5 Q280,10 320,5 Q360,0 400,5 Q440,10 480,5 Q520,0 560,5 Q600,10 640,5 Q680,0 720,5 Q760,10 800,5 Q840,0 880,5 Q920,10 960,5 Q1000,0 1040,5 Q1080,10 1120,5 Q1160,0 1200,5 Q1240,10 1280,5 Q1320,0 1360,5 Q1400,10 1440,5" fill="none" stroke="#f3b62b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Mobile slide panel ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-[rgba(42,29,20,0.45)] backdrop-blur-[3px] z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] z-[60] flex flex-col overflow-y-auto"
              style={{ background: C.cream, borderLeft: `1.5px solid rgba(201,168,108,0.35)`, boxShadow: `-8px 0 32px rgba(42,29,20,0.12)` }}
            >
              {/* Panel header */}
              <div className="flex justify-between items-center px-6 py-5" style={{ borderBottom: `1.5px solid rgba(201,168,108,0.3)` }}>
                <TissuLogo fill={C.burnt} className="h-7 w-auto" />
                <button onClick={() => setIsMobileOpen(false)} className="w-9 h-9 rounded-full inline-flex items-center justify-center" style={{ border: `1.5px solid rgba(201,168,108,0.5)`, color: C.ink }} aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel nav */}
              <nav className="flex flex-col px-6 py-5 gap-1 flex-1">
                {/* Shop expandable */}
                <button
                  type="button"
                  onClick={() => setMobileShopOpen((v) => !v)}
                  className="flex items-center justify-between w-full py-3"
                  style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: C.ink, borderBottom: `1px solid ${C.border}` }}
                >
                  {copy.nav.shop}
                  <motion.span animate={{ rotate: mobileShopOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                    <ChevronDown className="w-5 h-5" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {mobileShopOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="pt-1 pb-2 pl-4 flex flex-col gap-0.5">
                        {categories.map((cat) => (
                          <Link key={cat.href} href={cat.href} onClick={() => setIsMobileOpen(false)} className="py-2 text-[13px] font-bold uppercase tracking-[0.1em] hover:text-[#d56826] transition-colors" style={{ fontFamily: FRAUNCES, color: C.ink }}>
                            → {cat.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {rightLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="py-3 hover:text-[#d56826] transition-colors"
                    style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: C.ink, borderBottom: `1px solid ${C.border}` }}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Panel footer */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ borderTop: `1.5px solid rgba(201,168,108,0.3)` }}>
                <LanguageSwitcher currentLang={lang} />
                <Link href={`/${lang}/account`} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] hover:text-[#d56826] transition-colors" style={{ fontFamily: FRAUNCES, color: C.ink }}>
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
