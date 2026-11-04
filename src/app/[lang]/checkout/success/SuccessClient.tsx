"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin, Printer, Clock, Phone, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { useEffect, useState } from "react";
import { Order } from "@/lib/types";

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

interface SuccessClientProps {
  lang: Locale;
  dictionary: any;
  orderId?: string;
}

const CONTACT_LABEL: Record<string, { ka: string; en: string }> = {
  phone:     { ka: "ზარი",       en: "Phone call" },
  whatsapp:  { ka: "WhatsApp",   en: "WhatsApp" },
  messenger: { ka: "Messenger",  en: "Messenger" },
  instagram: { ka: "Instagram",  en: "Instagram" },
  email:     { ka: "ელ.ფოსტა",   en: "Email" },
};

const DELIVERY_LABEL: Record<string, { ka: string; en: string }> = {
  courier: { ka: "კურიერით მისამართზე", en: "Courier to address" },
  pickup:  { ka: "თბილისში თვითგატანა", en: "Pickup in Tbilisi" },
};

function ContactIcon({ method, size = 14 }: { method: string; size?: number }) {
  if (method === "instagram") return <InstagramIcon size={size} />;
  if (method === "email") return <Mail size={size} />;
  if (method === "phone") return <Phone size={size} />;
  return <MessageCircle size={size} />;
}

export default function SuccessClient({ lang, orderId }: SuccessClientProps) {
  useStoreHydration();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const isKa = lang === "ka";

  useEffect(() => {
    if (isAuthenticated && user && orderId) {
      const found = user.orders.find(o => o.id === orderId);
      if (found) setOrder(found);
    }
  }, [isAuthenticated, user, orderId]);

  const addr = order?.shippingAddress as any;
  const contactMethod: string | undefined = addr?.contactMethod;
  const deliveryMethod: string | undefined = addr?.deliveryMethod;
  const deliveryZone: { label?: { ka: string; en: string }; fee?: number } | undefined = addr?.deliveryZone;
  const notes: string | undefined = addr?.notes;
  const email: string | undefined = addr?.email;

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
      {/* Decorative shapes */}
      <span aria-hidden="true" style={{ position: "absolute", top: 80, left: "8%", opacity: 0.75 }}><Star size={18} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "10%", opacity: 0.6 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 120, left: "6%", opacity: 0.6 }}><Star size={14} color={C.green} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 200, right: "8%", opacity: 0.65 }}><Star size={15} /></span>

      <div className="container max-w-3xl mx-auto" style={{ position: "relative" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            width: 84, height: 84, borderRadius: "50%",
            background: `${C.green}1f`, color: C.green,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 22,
            boxShadow: `0 8px 24px ${C.green}33`,
          }}>
            <CheckCircle2 size={42} />
          </span>
          <h1 style={{
            fontFamily: FRAUNCES, fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 40px)",
            color: C.ink, letterSpacing: "-0.01em",
            lineHeight: 1.15,
            margin: "0 0 12px",
          }}>
            {isKa ? "შენი შეკვეთა მიღებულია!" : "Your order request has been received!"}
          </h1>
          <p style={{
            fontFamily: SANS, fontSize: 15,
            color: C.ink, opacity: 0.7,
            maxWidth: 520, margin: "0 auto", lineHeight: 1.6,
          }}>
            {isKa
              ? "მალე დაგიკავშირდებით, რომ შევთანხმდეთ გადახდის და მიწოდების დეტალებზე."
              : "We will contact you shortly to agree on payment and delivery details."}
          </p>

          {orderId && (
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center",
              marginTop: 22, padding: "10px 20px",
              background: "white", border: `1px solid rgba(42,29,20,0.10)`,
              borderRadius: 14,
            }}>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink, opacity: 0.55 }}>
                {isKa ? "შეკვეთის #" : "Order #"}
              </span>
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontWeight: 700, fontSize: 16, color: C.ink, marginTop: 2 }}>
                {orderId.slice(0, 12).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* What happens next */}
        <div style={{
          background: "white",
          border: `1px solid rgba(42,29,20,0.10)`,
          borderRadius: 18,
          padding: 24,
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}>
          <span aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.mustard,
          }} />
          <h2 style={{
            fontFamily: FRAUNCES, fontWeight: 700, fontSize: 19,
            color: C.ink, letterSpacing: "-0.005em", margin: "0 0 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Star size={14} />
            {isKa ? "შემდეგი ნაბიჯები" : "What happens next"}
          </h2>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                ka: "მივიღებთ შენი შეკვეთის მოთხოვნას.",
                en: "We receive your order request.",
              },
              {
                ka: "დაგიკავშირდებით შენ მიერ მითითებული არხით (ჩვეულებრივ 24 საათში).",
                en: "We get in touch via the channel you chose (usually within 24 hours).",
              },
              {
                ka: "გადახდის (საბანკო გადარიცხვა ან მიწოდებისას) და მიწოდების დეტალებზე ვთანხმდებით.",
                en: "We agree on payment (bank transfer or cash on delivery) and delivery details.",
              },
              {
                ka: "ჩანთა იგზავნება ან მზადდება გასატანად.",
                en: "Your bag is shipped or prepared for pickup.",
              },
            ].map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: C.burnt, color: C.cream,
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 12,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.78, lineHeight: 1.55 }}>
                  {isKa ? step.ka : step.en}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTAs */}
        <div className="grid sm:grid-cols-2 gap-3" style={{ marginBottom: 28 }}>
          {isAuthenticated ? (
            <Link
              href={`/${lang}/account`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
                background: C.burnt, color: C.cream,
                borderRadius: 14, padding: "14px 22px",
                textDecoration: "none",
              }}
              className="hover:-translate-y-0.5"
            >
              <ShoppingBag size={16} />
              {isKa ? "ჩემი შეკვეთები" : "Your orders"}
            </Link>
          ) : (
            <Link
              href={`/${lang}/account/register`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
                background: C.burnt, color: C.cream,
                borderRadius: 14, padding: "14px 22px",
                textDecoration: "none",
              }}
              className="hover:-translate-y-0.5"
            >
              <ShoppingBag size={16} />
              {isKa ? "შექმენი ანგარიში" : "Create an account"}
            </Link>
          )}
          <Link
            href={`/${lang}/shop`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
              background: "transparent", color: C.ink,
              border: `1.5px solid rgba(42,29,20,0.18)`,
              borderRadius: 14, padding: "14px 22px",
              textDecoration: "none",
            }}
            className="hover:bg-[rgba(42,29,20,0.04)]"
          >
            {isKa ? "მაღაზიის გაგრძელება" : "Continue shopping"}
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Order summary — visible only to logged-in users with the order */}
        {order && (
          <div style={{
            background: "white",
            border: `1px solid rgba(42,29,20,0.10)`,
            borderRadius: 18,
            padding: 24,
            position: "relative",
            overflow: "hidden",
          }}>
            <span aria-hidden="true" style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.burnt,
            }} />
            <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
              <h2 style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 19,
                color: C.ink, letterSpacing: "-0.005em", margin: 0,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Star size={14} color={C.burnt} />
                {isKa ? "შეკვეთის დეტალები" : "Order details"}
              </h2>
              <button
                onClick={() => window.print()}
                style={{
                  fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
                  color: C.burnt, background: "transparent",
                  border: "none", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
                className="hover:underline"
              >
                <Printer size={14} />
                {isKa ? "ამობეჭდვა" : "Print"}
              </button>
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              {order.items.map((item, idx) => {
                const name = item.productName[lang] || item.productName["ka"];
                const variant = item.variantName[lang] || item.variantName["ka"];
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div style={{ position: "relative", width: 54, height: 64, borderRadius: 10, overflow: "hidden", background: C.softCream, flexShrink: 0 }}>
                      <Image src={item.image} alt={name} fill className="object-cover" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                      <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, margin: "2px 0 0" }}>{variant ? `${variant} · ` : ""}× {item.quantity}</p>
                    </div>
                    <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.ink }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Meta */}
            <div className="grid md:grid-cols-2 gap-6" style={{ paddingTop: 18, borderTop: `1px dashed rgba(42,29,20,0.18)` }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink, opacity: 0.55, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={12} /> {isKa ? "მისამართი" : "Address"}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.55, margin: 0, opacity: 0.85 }}>
                  {addr?.firstName} {addr?.lastName}<br />
                  {addr?.streetAddress}, {addr?.city}<br />
                  {addr?.phone}
                  {email && (<><br />{email}</>)}
                </p>
              </div>

              <div>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink, opacity: 0.55, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={12} /> {isKa ? "სტატუსი" : "Status"}
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.burnt, background: `${C.burnt}14`,
                  padding: "5px 10px", borderRadius: 999,
                }}>
                  {isKa ? "დადასტურების მოლოდინში" : "Pending confirmation"}
                </span>

                {(deliveryZone || deliveryMethod) && (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.85, margin: "12px 0 0", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.45 }}>
                    <Package size={13} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span>
                      {deliveryZone?.label?.[isKa ? "ka" : "en"] || (deliveryMethod ? DELIVERY_LABEL[deliveryMethod]?.[isKa ? "ka" : "en"] : "")}
                      {deliveryZone?.fee != null && (
                        <span style={{ color: C.burnt, fontWeight: 700, marginLeft: 6 }}>
                          · {deliveryZone.fee} ₾
                        </span>
                      )}
                    </span>
                  </p>
                )}
                {contactMethod && (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.75, margin: "6px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <ContactIcon method={contactMethod} />
                    {CONTACT_LABEL[contactMethod]?.[isKa ? "ka" : "en"] || contactMethod}
                  </p>
                )}
              </div>
            </div>

            {notes && (
              <div style={{ paddingTop: 16, marginTop: 16, borderTop: `1px dashed rgba(42,29,20,0.18)` }}>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink, opacity: 0.55, marginBottom: 6 }}>
                  {isKa ? "კომენტარი" : "Notes"}
                </div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.75, margin: 0, lineHeight: 1.55 }}>{notes}</p>
              </div>
            )}

            <div style={{ paddingTop: 18, marginTop: 18, borderTop: `1px solid rgba(42,29,20,0.10)`, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.75 }}>
                <span>{isKa ? "ნივთები" : "Subtotal"}</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.85 }}>
                <span>{isKa ? "კურიერი" : "Courier delivery"}</span>
                <span style={{ fontWeight: 700, color: C.burnt }}>
                  {formatPrice(order.shipping)}
                </span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 13, color: C.green, fontWeight: 600 }}>
                  <span>{isKa ? "ფასდაკლება" : "Discount"}</span>
                  <span>−{order.discount}%</span>
                </div>
              )}
              <div className="flex items-baseline justify-between" style={{ paddingTop: 8, borderTop: `1px dashed rgba(42,29,20,0.14)` }}>
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.ink }}>
                  {isKa ? "ჯამი" : "Total"}
                </span>
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 24, color: C.ink }}>
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 11, color: C.ink, opacity: 0.55, margin: "8px 0 0", textAlign: "right" }}>
              {isKa
                ? "გადახდის დეტალები (გადარიცხვა ან ნაღდი) დადასტურდება ჩვენთან დაკავშირებისას."
                : "Payment details (transfer or cash) confirmed when we get in touch."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
