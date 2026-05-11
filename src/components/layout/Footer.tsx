import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { Locale } from "@/i18n/config";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
};

function Star({ size = 12, color = C.mustard }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

const SOCIAL_CIRCLE: React.CSSProperties = {
  width: 42, height: 42, borderRadius: "50%",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  border: "2px solid rgba(254,240,214,0.4)",
  color: C.cream,
  transition: "background 0.18s ease, border-color 0.18s ease",
};

export function Footer({ dictionary, lang = "ka" }: { dictionary?: any; lang?: Locale }) {
  const isKa = lang === "ka";

  const shopLinks = [
    { label: isKa ? "ყველა" : "All", href: `/${lang}/shop` },
    { label: isKa ? "ჩანთები" : "Pouches", href: `/${lang}/shop?category=pouch` },
    { label: isKa ? "ლეპტოპის ქერქი" : "Laptop sleeves", href: `/${lang}/shop?category=laptop` },
    { label: isKa ? "ბავშვის ჩანთა" : "Kids' backpacks", href: `/${lang}/shop?category=kidsbackpack` },
    { label: isKa ? "ფარტუხები" : "Aprons", href: `/${lang}/shop?category=apron` },
    { label: isKa ? "ყელსაბამები" : "Necklaces", href: `/${lang}/shop?category=necklace` },
  ];

  const helpLinks = [
    { label: isKa ? "ხშირი კითხვები" : "FAQ", href: `/${lang}/faq` },
    { label: isKa ? "მიწოდება" : "Delivery", href: `/${lang}/faq#shipping` },
    { label: isKa ? "გაცვლა-დაბრუნება" : "Returns & exchanges", href: `/${lang}/faq#returns` },
  ];

  const aboutLinks = [
    { label: isKa ? "ჩვენი ამბავი" : "Our story", href: `/${lang}/about` },
    { label: isKa ? "კონტაქტი" : "Contact", href: `/${lang}/contact` },
  ];

  const policyLinks = [
    { label: isKa ? "კონფიდენციალურობა" : "Privacy", href: `/${lang}/privacy` },
    { label: isKa ? "პირობები" : "Terms", href: `/${lang}/terms` },
  ];

  return (
    <footer
      style={{
        background: C.green,
        color: C.cream,
        position: "relative",
        overflow: "hidden",
        marginTop: 40,
      }}
    >
      {/* Decorative sprinkled stars */}
      <span aria-hidden="true" style={{ position: "absolute", top: 36, left: "6%", opacity: 0.7 }}><Star size={14} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 80, right: "9%", opacity: 0.6 }}><Star size={10} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 60, left: "12%", opacity: 0.55 }}><Star size={12} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 120, right: "5%", opacity: 0.5 }}><Star size={16} color={C.burnt} /></span>

      <div className="container" style={{ padding: "64px 16px 32px", position: "relative" }}>

        {/* Top: navigation grid */}
        <div
          style={{ display: "grid", gap: 48 }}
          className="md:grid-cols-[1.4fr_1fr_1fr_1fr]"
        >
          {/* Brand block */}
          <div>
            <Image
              src="/static/logo.png"
              alt="Tissu"
              width={140}
              height={44}
              style={{ height: 40, width: "auto", filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.18))" }}
            />
            <p style={{
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 15, lineHeight: 1.6,
              color: C.cream, opacity: 0.85,
              maxWidth: 320, marginTop: 16,
            }}>
              {isKa
                ? "ხელით ნაკერი ჩანთები — სიყვარულით თბილისიდან."
                : "Handmade bags — made with love in Tbilisi."}
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <a
                href="https://instagram.com/thetissushop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={SOCIAL_CIRCLE}
                className="hover:bg-[rgba(254,240,214,0.15)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.23-5.22 1.23-5.22s-.31-.63-.31-1.56c0-1.46.85-2.56 1.9-2.56.9 0 1.33.67 1.33 1.48 0 .9-.58 2.26-.87 3.51-.25 1.05.52 1.9 1.55 1.9 1.86 0 3.12-2.4 3.12-5.23 0-2.16-1.46-3.67-3.55-3.67-2.42 0-3.84 1.81-3.84 3.69 0 .73.28 1.51.63 1.94.07.09.08.16.06.25-.06.26-.2.84-.23.96-.04.16-.13.19-.3.11-1.12-.52-1.82-2.17-1.82-3.49 0-2.84 2.06-5.44 5.94-5.44 3.12 0 5.55 2.22 5.55 5.19 0 3.1-1.95 5.59-4.65 5.59-.91 0-1.76-.47-2.05-1.03l-.56 2.08c-.2.78-.75 1.75-1.12 2.35.85.26 1.74.4 2.67.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop column */}
          <FooterColumn title={isKa ? "მაღაზია" : "Shop"} links={shopLinks} />

          {/* Help column */}
          <FooterColumn title={isKa ? "მომსახურება" : "Help"} links={helpLinks} />

          {/* About + contact column */}
          <div>
            <div style={columnTitleStyle}>
              {isKa ? "ჩვენ" : "About"}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {aboutLinks.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={{
                      fontFamily: SANS, fontSize: 14,
                      color: C.cream, opacity: 0.78,
                      textDecoration: "none",
                    }}
                    className="hover:opacity-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li style={{ ...contactItemStyle, marginTop: 6 }}>
                <MapPin size={14} style={{ opacity: 0.7, marginTop: 3, flexShrink: 0 }} />
                <span>{isKa ? "თბილისი, საქართველო" : "Tbilisi, Georgia"}</span>
              </li>
              <li style={contactItemStyle}>
                <Mail size={14} style={{ opacity: 0.7, marginTop: 3, flexShrink: 0 }} />
                <a href="mailto:hello@tissu.ge" style={{ color: "inherit", textDecoration: "none" }} className="hover:opacity-100">hello@tissu.ge</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 22,
            borderTop: "1px dashed rgba(254,240,214,0.22)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16,
          }}
        >
          <span style={{
            fontFamily: SANS, fontSize: 12,
            color: C.cream, opacity: 0.65,
          }}>
            © {new Date().getFullYear()} Tissu · {isKa ? "სიყვარულით თბილისიდან" : "Made with love in Tbilisi"}
          </span>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {policyLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: FRAUNCES, fontWeight: 500, fontSize: 12,
                  letterSpacing: "0.04em",
                  color: C.cream, opacity: 0.75,
                  textDecoration: "none",
                }}
                className="hover:opacity-100"
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

const columnTitleStyle: React.CSSProperties = {
  fontFamily: FRAUNCES, fontWeight: 600,
  fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.mustard,
  marginBottom: 18,
};

const contactItemStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14,
  color: C.cream, opacity: 0.78,
  display: "flex", alignItems: "flex-start", gap: 10,
  lineHeight: 1.5,
};

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div style={columnTitleStyle}>{title}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              style={{
                fontFamily: SANS, fontSize: 14,
                color: C.cream, opacity: 0.78,
                textDecoration: "none",
                transition: "opacity 0.18s ease",
              }}
              className="hover:opacity-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
