"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

interface RetroNewsletterProps {
  isKa?: boolean;
}

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  mustard: "#f3b62b",
  green: "#3f6f56",
  ink: "#2a1d14",
};

const STARS = [
  { left: "7%",  top: "18%",    size: 20, delay: 0 },
  { right: "10%", top: "22%",   size: 15, delay: 0.6 },
  { left: "20%", bottom: "16%", size: 13, delay: 1.2 },
  { right: "18%", bottom: "20%",size: 17, delay: 1.8 },
  { left: "50%", top: "8%",     size: 11, delay: 0.9 },
  { right: "38%", bottom: "10%",size: 10, delay: 2.1 },
];

export default function RetroNewsletter({ isKa = false }: RetroNewsletterProps) {
  const params = useParams();
  const lang = ((params?.lang as string) || "en") as Locale;
  const copy = getLandingCopy(lang);

  const legalLinks = [
    { label: isKa ? "პოლიტიკა" : "Privacy",  href: `/${lang}/privacy` },
    { label: isKa ? "წესები"   : "Terms",    href: `/${lang}/terms` },
    { label: isKa ? "მიწოდება" : "Shipping", href: `/${lang}/faq#shipping` },
    { label: isKa ? "დაბრუნება": "Returns",  href: `/${lang}/faq#returns` },
  ];

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24"
      style={{ background: C.green, color: C.cream }}
    >
      {/* Scattered stars */}
      {STARS.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ left: s.left, right: s.right, top: s.top, bottom: s.bottom, color: C.mustard, fontSize: s.size }}
          animate={{ rotate: [0, 360], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}

      <div className="container relative flex flex-col items-center gap-7 text-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Image
            src="/static/logo.png"
            alt="Tissu"
            width={200}
            height={64}
            className="h-12 w-auto"
            style={{ filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.25))" }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-xs text-[15px] leading-relaxed"
          style={{ fontFamily: FRAUNCES, fontStyle: "italic" }}
        >
          {copy.footer.tagline}
        </motion.p>

        {/* Social icons */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <a
            href="https://instagram.com/thetissushop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-12 h-12 rounded-full inline-flex items-center justify-center transition-colors"
            style={{ border: "2px solid rgba(254,240,214,0.4)", color: C.cream }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(254,240,214,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = C.cream; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(254,240,214,0.4)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>

          <a
            href="https://tiktok.com/@thetissushop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="w-12 h-12 rounded-full inline-flex items-center justify-center transition-colors"
            style={{ border: "2px solid rgba(254,240,214,0.4)", color: C.cream }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(254,240,214,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = C.cream; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(254,240,214,0.4)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.6 5.8a4.8 4.8 0 0 1-2.8-1.8v9.4a4.2 4.2 0 1 1-4.2-4.2v2.2a2 2 0 1 0 2 2V2h2a4.8 4.8 0 0 0 3 3v2.8z" />
            </svg>
          </a>

          <a
            href="https://pinterest.com/thetissushop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pinterest"
            className="w-12 h-12 rounded-full inline-flex items-center justify-center transition-colors"
            style={{ border: "2px solid rgba(254,240,214,0.4)", color: C.cream }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(254,240,214,0.15)"; (e.currentTarget as HTMLElement).style.borderColor = C.cream; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(254,240,214,0.4)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.23-5.22 1.23-5.22s-.31-.63-.31-1.56c0-1.46.85-2.56 1.9-2.56.9 0 1.33.67 1.33 1.48 0 .9-.58 2.26-.87 3.51-.25 1.05.52 1.9 1.55 1.9 1.86 0 3.12-2.4 3.12-5.23 0-2.16-1.46-3.67-3.55-3.67-2.42 0-3.84 1.81-3.84 3.69 0 .73.28 1.51.63 1.94.07.09.08.16.06.25-.06.26-.2.84-.23.96-.04.16-.13.19-.3.11-1.12-.52-1.82-2.17-1.82-3.49 0-2.84 2.06-5.44 5.94-5.44 3.12 0 5.55 2.22 5.55 5.19 0 3.1-1.95 5.59-4.65 5.59-.91 0-1.76-.47-2.05-1.03l-.56 2.08c-.2.78-.75 1.75-1.12 2.35.85.26 1.74.4 2.67.4 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </a>
        </motion.div>

        {/* Divider */}
        <div className="w-24 h-px" style={{ background: "rgba(254,240,214,0.25)" }} />

        {/* Bottom bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-[12px]"
          style={{ color: "rgba(254,240,214,0.55)", fontFamily: FRAUNCES }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span>© {new Date().getFullYear()} Tissu · {isKa ? "სიყვარულით თბილისიდან" : "Made with love in Tbilisi"}</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[#fef0d6]"
                style={{ color: "rgba(254,240,214,0.55)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
