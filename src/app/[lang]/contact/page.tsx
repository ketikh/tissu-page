"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { Mail, Phone, MapPin, Send, Loader2, Check } from "lucide-react";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

function Star({ size = 14, color = C.mustard }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: SANS,
  width: "100%",
  height: 48,
  padding: "0 16px",
  background: "white",
  border: `1.5px solid rgba(42,29,20,0.14)`,
  borderRadius: 12,
  color: C.ink,
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.18s ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.ink,
  opacity: 0.55,
  marginLeft: 4,
};

export default function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = lang as Locale;
  const isKa = locale === "ka";
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Placeholder — connect to /api/contact later if needed.
    await new Promise(r => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        position: "relative",
        overflow: "hidden",
        padding: "60px 16px 80px",
      }}
    >
      {/* Sprinkled stars in brand colours */}
      <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "5%", opacity: 0.85 }}><Star size={18} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "8%", opacity: 0.7 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "35%", right: "3%", opacity: 0.65 }}><Star size={14} color={C.rose} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "55%", left: "3%", opacity: 0.6 }}><Star size={14} color={C.green} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 120, left: "8%", opacity: 0.7 }}><Star size={16} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 200, right: "10%", opacity: 0.65 }}><Star size={13} color={C.burnt} /></span>

      {/* Floating pebbles */}
      <div aria-hidden="true" style={{ position: "absolute", top: 180, left: "-3%", width: 130, height: 130, background: C.burnt, opacity: 0.26, borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%", transform: "rotate(-12deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 80, right: "-2%", width: 100, height: 100, background: C.mustard, opacity: 0.36, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%", transform: "rotate(18deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: "44%", left: "-2%", width: 80, height: 80, background: C.green, opacity: 0.22, borderRadius: "50%" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: "55%", right: "-3%", width: 110, height: 110, background: C.rose, opacity: 0.26, borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%", transform: "rotate(-6deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 60, right: "-3%", width: 140, height: 140, background: C.mustard, opacity: 0.3, borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%", transform: "rotate(10deg)" }} />

      {/* Squiggly accents */}
      <svg aria-hidden="true" style={{ position: "absolute", top: 230, right: "12%", opacity: 0.55, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.burnt} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" style={{ position: "absolute", bottom: 280, left: "16%", opacity: 0.6, pointerEvents: "none" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <div className="container max-w-6xl" style={{ position: "relative" }}>
        {/* Pill + heading */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: FRAUNCES, fontSize: 13, fontWeight: 600,
            letterSpacing: "0.06em",
            color: C.ink, opacity: 0.7,
            background: "white",
            border: `1px solid rgba(42,29,20,0.10)`,
            borderRadius: 999,
            padding: "6px 14px",
            marginBottom: 14,
          }}>
            <Star size={10} />
            {isKa ? "მოგვწერე" : "Get in touch"}
          </span>
          <h1 style={{
            fontFamily: FRAUNCES, fontWeight: 700,
            fontSize: "clamp(30px, 5vw, 48px)",
            color: C.ink, letterSpacing: "-0.01em",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: 560,
            marginLeft: "auto", marginRight: "auto",
          }}>
            {isKa ? "გვიამბე შენი ამბავი." : "Tell us your story."}
          </h1>
          <p style={{
            fontFamily: FRAUNCES, fontStyle: "italic",
            fontSize: 15,
            color: C.ink, opacity: 0.65,
            margin: "12px auto 0",
            maxWidth: 520, lineHeight: 1.55,
          }}>
            {isKa
              ? "შეკითხვა, სურვილი ან უბრალოდ მოსალმება — ხელით ვპასუხობთ ყველა მესიჯს ჩვეულებრივ 1–2 დღეში."
              : "A question, a wish or just a hello — we reply by hand, usually in 1–2 days."}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          {/* Contact info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ContactCard
              icon={<Mail size={18} />}
              accent="burnt"
              label={isKa ? "ელფოსტა" : "Email"}
              value="hello@tissu.ge"
              href="mailto:hello@tissu.ge"
            />
            <ContactCard
              icon={<Phone size={18} />}
              accent="green"
              label={isKa ? "ტელეფონი" : "Phone"}
              value="+995 555 12 34 56"
              href="tel:+995555123456"
            />
            <ContactCard
              icon={<InstagramIcon size={18} />}
              accent="rose"
              label="Instagram"
              value="@thetissushop"
              href="https://instagram.com/thetissushop"
            />
            <ContactCard
              icon={<MapPin size={18} />}
              accent="mustard"
              label={isKa ? "სტუდია" : "Studio"}
              value={isKa ? "თბილისი, საქართველო" : "Tbilisi, Georgia"}
            />

            {/* Wholesale / collab promo card */}
            <div style={{
              position: "relative",
              background: C.green,
              color: C.cream,
              borderRadius: 18,
              padding: 24,
              overflow: "hidden",
              marginTop: 8,
            }}>
              <span aria-hidden="true" style={{ position: "absolute", top: -18, right: -18, width: 80, height: 80, background: C.mustard, opacity: 0.45, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%" }} />
              <span aria-hidden="true" style={{ position: "absolute", top: 12, left: 12 }}><Star size={14} /></span>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 20, margin: "0 0 8px", color: C.cream }}>
                  {isKa ? "საბითუმო ან თანამშრომლობა?" : "Wholesale or a collab?"}
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.55 }}>
                  {isKa
                    ? "მოგვწერე მოკლე აღწერით — დაგიკავშირდებით რამდენიმე დღეში."
                    : "Send us a short brief — we'll get back to you in a few days."}
                </p>
                <a
                  href="mailto:hello@tissu.ge"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                    color: C.cream, opacity: 0.85,
                    textDecoration: "underline",
                    marginTop: 10,
                  }}
                  className="hover:opacity-100"
                >
                  hello@tissu.ge →
                </a>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div style={{
            position: "relative",
            background: "white",
            border: `1px solid rgba(42,29,20,0.10)`,
            borderRadius: 22,
            padding: 28,
            overflow: "hidden",
          }}>
            <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.burnt }} />
            <span aria-hidden="true" style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, background: C.burnt, opacity: 0.16, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%", transform: "rotate(-12deg)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 22,
                color: C.ink, letterSpacing: "-0.005em",
                margin: "0 0 18px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Star size={14} color={C.burnt} />
                {isKa ? "მოგვწერე" : "Send us a message"}
              </h2>

              {submitted ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "30px 10px", gap: 14 }}>
                  <span style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: `${C.green}1f`, color: C.green,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={28} />
                  </span>
                  <p style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18, color: C.ink, margin: 0 }}>
                    {isKa ? "მესიჯი მიღებულია!" : "Message received!"}
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.65, margin: 0, maxWidth: 360, lineHeight: 1.55 }}>
                    {isKa
                      ? "მალე დაგიკავშირდებით ხელით დაწერილი პასუხით."
                      : "We'll get back to you with a hand-written reply soon."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={labelStyle}>{isKa ? "სახელი" : "Name"}</label>
                      <input type="text" required placeholder={isKa ? "შენი სახელი" : "Your name"} style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={labelStyle}>{isKa ? "ელფოსტა" : "Email"}</label>
                      <input type="email" required placeholder="you@lovely.com" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>{isKa ? "თემა" : "Topic"}</label>
                    <select style={{ ...inputStyle, padding: "0 16px", cursor: "pointer" }}>
                      <option>{isKa ? "შეკითხვა" : "A question"}</option>
                      <option>{isKa ? "შეკვეთა / ყელსაბამი" : "Custom necklace order"}</option>
                      <option>{isKa ? "საბითუმო" : "Wholesale"}</option>
                      <option>{isKa ? "თანამშრომლობა" : "Collaboration"}</option>
                      <option>{isKa ? "სხვა" : "Something else"}</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={labelStyle}>{isKa ? "წერილი" : "Message"}</label>
                    <textarea
                      required
                      rows={5}
                      placeholder={isKa ? "მოგვიყევი..." : "Tell us everything..."}
                      style={{ ...inputStyle, height: "auto", padding: "12px 16px", lineHeight: 1.55, resize: "vertical", minHeight: 120 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: 4,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, letterSpacing: "0.02em",
                      background: C.burnt, color: C.cream,
                      border: "none",
                      borderRadius: 14,
                      padding: "14px 22px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                      transition: "transform 0.18s ease",
                    }}
                    className="hover:-translate-y-0.5"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        {isKa ? "გაგზავნა" : "Send message"}
                        <Send size={14} />
                      </>
                    )}
                  </button>

                  <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.5, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                    {isKa ? "ხელით ვპასუხობთ — ჩვეულებრივ 1–2 დღეში." : "We reply by hand — usually within 1–2 days."}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  accent = "burnt",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  accent?: "burnt" | "green" | "rose" | "mustard";
}) {
  const accentColor =
    accent === "burnt" ? C.burnt :
    accent === "green" ? C.green :
    accent === "rose" ? C.rose : C.mustard;

  const content = (
    <div
      style={{
        position: "relative",
        background: "white",
        border: `1px solid rgba(42,29,20,0.10)`,
        borderRadius: 16,
        padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
        overflow: "hidden",
        transition: "transform 0.18s ease",
      }}
      className="hover:-translate-y-0.5"
    >
      <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: accentColor }} />
      <span aria-hidden="true" style={{ position: "absolute", top: -16, right: -16, width: 56, height: 56, background: accentColor, opacity: 0.18, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%" }} />
      <span style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${accentColor}1a`, color: accentColor,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginLeft: 4,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink, opacity: 0.55 }}>
          {label}
        </div>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 17, color: C.ink, lineHeight: 1.25, marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  );

  if (!href) return content;
  if (href.startsWith("http")) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{content}</a>
  );
  return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
}
