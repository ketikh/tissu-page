"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, User, Search, X, Mail, Globe, MessageCircle } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStoreHydration } from "@/store/useHydration";

interface NavbarProps {
  lang: Locale;
  dictionary: any;
}

export function Navbar({ lang, dictionary }: NavbarProps) {
  const hydrated = useStoreHydration();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openCart = useUIStore((state) => state.openCart);
  const cartItemCount = hydrated ? useCartStore.getState().getSummary().itemsCount : 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const links = [
    { name: dictionary.nav.collection, href: `/${lang}/shop` },
    { name: dictionary.nav.bestsellers, href: `/${lang}/shop?sort=featured` },
    { name: dictionary.nav.about, href: `/${lang}/about` },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-border/10 py-2 shadow-sm" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container relative flex h-14 md:h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        
        {/* Left Side: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-dark/70">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative group transition-colors hover:text-brand-dark"
              >
                {link.name}
                <motion.span 
                  className={cn(
                    "absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-brand-primary origin-left",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-brand-dark transition-all hover:text-brand-primary active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:outline-none rounded-sm"
            aria-label={dictionary.common.menu || "Open menu"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Logo */}
        <Link 
          href={`/${lang}`} 
          className="absolute left-1/2 -translate-x-1/2 group transition-transform duration-500 active:scale-95"
        >
          <img 
            src="/static/logo.svg" 
            alt="Tissu Logo" 
            className="h-7 md:h-9 w-auto transition-transform group-hover:scale-105" 
          />
        </Link>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="hidden lg:block">
            <LanguageSwitcher currentLang={lang} />
          </div>
          
          <button 
            className="p-2 text-brand-dark/70 hover:text-brand-primary transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:outline-none rounded-full hidden sm:block"
            aria-label={dictionary.notfound.search || "Search"}
          >
            <Search className="w-[20px] h-[20px]" />
          </button>
          
          <Link 
            href={`/${lang}/account`} 
            className="p-2 text-brand-dark/70 hover:text-brand-primary transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:outline-none rounded-full"
            aria-label={dictionary.nav.account}
          >
            <User className="w-[20px] h-[20px]" />
          </Link>

          <button 
            onClick={openCart} 
            className="p-2 text-brand-dark/70 hover:text-brand-primary transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:outline-none rounded-full relative"
            aria-label={dictionary.nav.cart}
          >
            <ShoppingBag className="w-[22px] h-[22px]" />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white shadow-lg shadow-brand-primary/20"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-[#fcfbf9] z-[70] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <img src="/static/logo.svg" alt="Tissu Logo" className="h-7 w-auto" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-brand-soft border border-border/50 text-brand-dark hover:bg-brand-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:outline-none"
                  aria-label={dictionary.common.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {links.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                    >
                      <Link 
                        href={link.href}
                        className={cn(
                          "text-3xl font-serif transition-colors flex items-center gap-4",
                          isActive ? "text-brand-primary" : "text-brand-dark hover:text-brand-primary"
                        )}
                      >
                        {link.name}
                        {isActive && (
                          <motion.div 
                            layoutId="active-mobile"
                            className="h-1.5 w-1.5 rounded-full bg-brand-primary"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8 border-t border-border/30 flex flex-col gap-8">
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-4"
                 >
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">{dictionary.nav.language}</span>
                       <LanguageSwitcher currentLang={lang} />
                    </div>
                    <Link 
                       href={`/${lang}/account`}
                       className="flex items-center gap-3 text-brand-dark font-bold text-sm hover:text-brand-primary transition-colors"
                    >
                       <User className="w-4 h-4" />
                       {dictionary.nav.account}
                    </Link>
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col gap-4"
                 >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">{dictionary.nav.socials}</span>
                    <div className="flex gap-5">
                       <a href="#" className="text-brand-dark hover:text-brand-primary transition-colors" aria-label="Instagram">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                       </a>
                       <a href="#" className="text-brand-dark hover:text-brand-primary transition-colors" aria-label="Facebook">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                       </a>
                       <a href="mailto:hello@tissu.ge" className="text-brand-dark hover:text-brand-primary transition-colors" aria-label="Email">
                          <Mail className="w-5 h-5" />
                       </a>
                    </div>
                    <div className="text-[10px] text-brand-dark/50 leading-relaxed">
                       {dictionary.footer.shop.tagline}
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
