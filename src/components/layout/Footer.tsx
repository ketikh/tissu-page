import Link from "next/link";
import Image from "next/image";
import { Locale } from "@/i18n/config";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
};

const STARS: { left?: string; right?: string; top?: string; bottom?: string; size: number }[] = [
  { left: "6%",  top: "18%",  size: 18 },
  { right: "8%", top: "22%",  size: 14 },
  { left: "14%", top: "62%",  size: 12 },
  { right: "16%", top: "70%", size: 16 },
  { left: "40%", top: "8%",   size: 10 },
  { right: "44%", bottom: "12%", size: 12 },
];

const SOCIAL_CIRCLE: React.CSSProperties = {
  width: 44, height: 44, borderRadius: "50%",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  border: "2px solid rgba(254,240,214,0.4)",
  color: C.cream,
  transition: "background 0.18s ease, border-color 0.18s ease",
};

export function Footer({ dictionary, lang = "ka" }: { dictionary?: any; lang?: Locale }) {
  const isKa = lang === "ka";

  const links = [
    { label: isKa ? "ჩვენი ამბავი" : "Our story", href: `/${lang}/about` },
    { label: isKa ? "ხშირი კითხვები" : "FAQ", href: `/${lang}/faq` },
    { label: isKa ? "კონტაქტი" : "Contact", href: `/${lang}/contact` },
    { label: isKa ? "კონფიდენციალურობა" : "Privacy", href: `/${lang}/privacy` },
    { label: isKa ? "წესები" : "Terms", href: `/${lang}/terms` },
  ];

  return (
    <footer
      style={{
        background: C.green,
        color: C.cream,
        position: "relative",
        overflow: "hidden",
        padding: "72px 0 36px",
      }}
    >
      {/* Sprinkled mustard stars */}
      {STARS.map((s, i) => (
        <svg
          key={i}
          width={s.size}
          height={s.size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: s.left, right: s.right, top: s.top, bottom: s.bottom,
            opacity: 0.65,
          }}
        >
          <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={C.mustard} />
        </svg>
      ))}

      <div className="container relative flex flex-col items-center gap-7 text-center" style={{ position: "relative" }}>

        {/* Logo */}
        <Image
          src="/static/logo.png"
          alt="Tissu"
          width={200}
          height={64}
          style={{ height: 48, width: "auto", filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.22))" }}
        />

        {/* Tagline */}
        <p style={{
          fontFamily: FRAUNCES, fontStyle: "italic",
          fontSize: 15, lineHeight: 1.6,
          color: C.cream, opacity: 0.85,
          maxWidth: 320, margin: 0,
        }}>
          {isKa
            ? "ხელით ნაკერი ჩანთები — სიყვარულით თბილისიდან."
            : "Handmade bags — made with love in Tbilisi."}
        </p>

        {/* Social icons */}
        <div style={{ display: "flex", gap: 14 }}>
          <a
            href="https://instagram.com/thetissushop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={SOCIAL_CIRCLE}
            className="hover:bg-[rgba(254,240,214,0.15)]"
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
            style={SOCIAL_CIRCLE}
            className="hover:bg-[rgba(254,240,214,0.15)]"
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
            style={SOCIAL_CIRCLE}
            className="hover:bg-[rgba(254,240,214,0.15)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.23-5.22 1.23-5.22s-.31-.63-.31-1.56c0-1.46.85-2.56 1.9-2.56.9 0 1.33.67 1.33 1.48 0 .9-.58 2.26-.87 3.51-.25 1.05.52 1.9 1.55 1.9 1.86 0 3.12-2.4 3.12-5.23 0-2.16-1.46-3.67-3.55-3.67-2.42 0-3.84 1.81-3.84 3.69 0 .73.28 1.51.63 1.94.07.09.08.16.06.25-.06.26-.2.84-.23.96-.04.16-.13.19-.3.11-1.12-.52-1.82-2.17-1.82-3.49 0-2.84 2.06-5.44 5.94-5.44 3.12 0 5.55 2.22 5.55 5.19 0 3.1-1.95 5.59-4.65 5.59-.91 0-1.76-.47-2.05-1.03l-.56 2.08c-.2.78-.75 1.75-1.12 2.35.85.26 1.74.4 2.67.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div style={{ width: 96, height: 1, background: "rgba(254,240,214,0.25)" }} />

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full"
          style={{ fontFamily: FRAUNCES, fontSize: 12 }}
        >
          <span style={{ color: "rgba(254,240,214,0.55)" }}>
            © {new Date().getFullYear()} Tissu · {isKa ? "სიყვარულით თბილისიდან" : "Made with love in Tbilisi"}
          </span>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  color: "rgba(254,240,214,0.62)",
                  textDecoration: "none",
                  transition: "color 0.18s ease",
                }}
                className="hover:text-[#fef0d6]!"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
