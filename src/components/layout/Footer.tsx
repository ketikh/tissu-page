"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

interface FooterProps {
  dictionary: any;
}

export function Footer({}: FooterProps) {
  const params = useParams();
  const lang = ((params?.lang as string) || "en") as Locale;
  const copy = getLandingCopy(lang);

  const shopHrefs = [
    `/${lang}/shop?category=pouches`,
    `/${lang}/shop?category=laptop-sleeves`,
    `/${lang}/shop?category=totes`,
    `/${lang}/shop?category=gift`,
  ];
  const careHrefs = [
    `/${lang}/faq#shipping`,
    `/${lang}/faq#returns`,
    `/${lang}/faq#wash`,
    `/${lang}/faq`,
  ];
  const studioHrefs = [
    `/${lang}/about`,
    `/${lang}#journal`,
    `/${lang}/contact?topic=wholesale`,
    `/${lang}/contact`,
  ];

  return (
    <footer className="bg-[var(--tissu-cream)] text-[var(--tissu-ink-soft)] pt-16 pb-8">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] mb-10">
          <div className="space-y-4">
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <span className="font-serif text-[32px] leading-none text-[var(--tissu-terracotta)] tracking-[0.04em]">
                TISSU
              </span>
              <span
                className="w-3.5 h-3.5 rounded-full bg-[var(--tissu-mustard)] -translate-y-3"
                aria-hidden="true"
              />
            </Link>
            <p className="max-w-[340px] text-sm leading-relaxed">{copy.footer.tagline}</p>
          </div>

          <div>
            <h5 className="font-serif text-[18px] text-[var(--tissu-ink)] mb-4">
              {copy.footer.cols.shop}
            </h5>
            <ul className="space-y-2.5">
              {copy.footer.shopLinks.map((label, i) => (
                <li key={label}>
                  <Link
                    href={shopHrefs[i]}
                    className="text-sm hover:text-[var(--tissu-terracotta)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif text-[18px] text-[var(--tissu-ink)] mb-4">
              {copy.footer.cols.care}
            </h5>
            <ul className="space-y-2.5">
              {copy.footer.careLinks.map((label, i) => (
                <li key={label}>
                  <Link
                    href={careHrefs[i]}
                    className="text-sm hover:text-[var(--tissu-terracotta)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-serif text-[18px] text-[var(--tissu-ink)] mb-4">
              {copy.footer.cols.studio}
            </h5>
            <ul className="space-y-2.5">
              {copy.footer.studioLinks.map((label, i) => (
                <li key={label}>
                  <Link
                    href={studioHrefs[i]}
                    className="text-sm hover:text-[var(--tissu-terracotta)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-dashed border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[13px]">
          <span>
            © {new Date().getFullYear()} Tissu Shop · {copy.footer.copyrightSuffix}
          </span>
          <div className="flex items-center gap-2.5">
            <a
              href="https://instagram.com/thetissushop"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="w-10 h-10 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.6 5.8a4.8 4.8 0 0 1-2.8-1.8v9.4a4.2 4.2 0 1 1-4.2-4.2v2.2a2 2 0 1 0 2 2V2h2a4.8 4.8 0 0 0 3 3v2.8z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Pinterest"
              className="w-10 h-10 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v9M9 14l3-3 3 3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
