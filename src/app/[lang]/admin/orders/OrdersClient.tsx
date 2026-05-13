"use client";

import { useMemo, useState } from "react";
import { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, MapPin, Phone, MessageCircle, Truck, Loader2, Check, X } from "lucide-react";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  ink: "#2a1d14",
  softCream: "#f9f4eb",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

const STATUS_OPTIONS: Array<{ id: string; label_ka: string; label_en: string; color: string }> = [
  { id: "pending_confirmation", label_ka: "დადასტურების მოლოდინში", label_en: "Pending",          color: C.burnt },
  { id: "confirmed",            label_ka: "დადასტურებული",          label_en: "Confirmed",        color: C.green },
  { id: "awaiting_payment",     label_ka: "გადახდის მოლოდინში",      label_en: "Awaiting payment", color: C.mustard },
  { id: "paid",                 label_ka: "გადახდილი",              label_en: "Paid",             color: C.green },
  { id: "preparing",            label_ka: "მზადდება",                label_en: "Preparing",        color: C.burnt },
  { id: "shipped",              label_ka: "გაიგზავნა",               label_en: "Shipped",          color: C.green },
  { id: "completed",            label_ka: "დასრულდა",                label_en: "Completed",        color: C.green },
  { id: "cancelled",            label_ka: "გაუქმდა",                 label_en: "Cancelled",        color: C.rose },
];

function statusMeta(id: string, isKa: boolean) {
  const s = STATUS_OPTIONS.find(x => x.id === id) || STATUS_OPTIONS[0];
  return { label: isKa ? s.label_ka : s.label_en, color: s.color };
}

interface OrderRow {
  id: string;
  date: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

export default function OrdersClient({
  lang,
  initialOrders,
  initialFilter,
  initialOpenId,
}: {
  lang: Locale;
  initialOrders: OrderRow[];
  initialFilter: string;
  initialOpenId?: string;
}) {
  const isKa = lang === "ka";
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [filter, setFilter] = useState<string>(initialFilter);
  const [openId, setOpenId] = useState<string | null>(initialOpenId || null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter(o => o.status === filter);
  }, [filter, orders]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    setBannerError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Update failed");
      }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  const filters = [{ id: "all", label_ka: "ყველა", label_en: "All" }, ...STATUS_OPTIONS.map(s => ({ id: s.id, label_ka: s.label_ka, label_en: s.label_en }))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>
          Orders
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "6px 0 0" }}>
          ნახე, გაფილტრე და სცადე სტატუსები. ნებისმიერი ცვლილება ბაზაში ინახება დაუყოვნებლივ.
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {filters.map(f => {
          const count = f.id === "all" ? orders.length : orders.filter(o => o.status === f.id).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                background: active ? C.burnt : "white",
                color: active ? "white" : C.ink,
                border: `1.5px solid ${active ? C.burnt : "rgba(42,29,20,0.12)"}`,
                transition: "background 0.18s ease, color 0.18s ease",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {isKa ? f.label_ka : f.label_en}
              <span style={{ fontSize: 11, opacity: active ? 0.85 : 0.55 }}>· {count}</span>
            </button>
          );
        })}
      </div>

      {bannerError && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.rose, background: `${C.rose}14`, border: `1px solid ${C.rose}33`, padding: "10px 12px", borderRadius: 10, margin: 0 }}>
          {bannerError}
        </p>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: "white", border: `1px solid rgba(42,29,20,0.10)`, borderRadius: 18, padding: 36, textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.55, margin: 0 }}>
            ამ ფილტრით შეკვეთა არ მოიძებნა.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(o => {
            const isOpen = openId === o.id;
            const meta = statusMeta(o.status, isKa);
            const addr: any = (() => { try { return JSON.parse(o.shippingAddress); } catch { return {}; } })();
            const dateLabel = (() => { try { return new Date(o.date).toLocaleString(isKa ? "ka-GE" : "en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return o.date; } })();

            return (
              <div
                key={o.id}
                style={{
                  background: "white",
                  border: `1px solid rgba(42,29,20,0.10)`,
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: meta.color }} />
                <button
                  onClick={() => setOpenId(isOpen ? null : o.id)}
                  style={{
                    width: "100%", background: "transparent", border: "none", cursor: "pointer",
                    padding: "14px 16px 14px 22px",
                    textAlign: "left",
                  }}
                  className="hover:bg-[rgba(42,29,20,0.02)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div style={{ minWidth: 160 }}>
                      <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink }}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55 }}>{dateLabel}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink }}>
                        {addr.firstName} {addr.lastName}
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55 }}>
                        {addr.phone}{addr.city ? ` · ${addr.city}` : ""}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: meta.color, background: `${meta.color}14`,
                      padding: "4px 10px", borderRadius: 999,
                    }}>
                      {meta.label}
                    </span>
                    <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.ink, minWidth: 80, textAlign: "right" }}>
                      {formatPrice(o.total)}
                    </span>
                    <ChevronDown size={16} style={{ color: C.ink, opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }} />
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 22px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Items */}
                    {o.items.length > 0 && (
                      <div style={{ paddingTop: 8, borderTop: `1px dashed rgba(42,29,20,0.14)`, display: "flex", flexDirection: "column", gap: 10 }}>
                        {o.items.map(it => {
                          let pname: any = {}; let vname: any = {};
                          try { pname = JSON.parse(it.productName); } catch { /* noop */ }
                          try { vname = JSON.parse(it.variantName); } catch { /* noop */ }
                          const name = pname?.[lang] || pname?.ka || pname?.en || "";
                          const variant = vname?.[lang] || vname?.ka || vname?.en || "";
                          return (
                            <div key={it.id} className="flex items-center gap-3">
                              {it.image && (
                                <img src={it.image} alt={name} style={{ width: 48, height: 56, objectFit: "cover", borderRadius: 10, background: C.softCream, flexShrink: 0 }} />
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                                <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, margin: "2px 0 0" }}>{variant ? `${variant} · ` : ""}× {it.quantity}</p>
                              </div>
                              <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.ink }}>{formatPrice(it.price * it.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Meta grid */}
                    <div className="grid md:grid-cols-2 gap-4" style={{ paddingTop: 8, borderTop: `1px dashed rgba(42,29,20,0.14)` }}>
                      <div>
                        <Heading icon={<MapPin size={12} />}>{isKa ? "მისამართი" : "Address"}</Heading>
                        <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, lineHeight: 1.55, margin: 0, opacity: 0.85 }}>
                          {addr.firstName} {addr.lastName}<br />
                          {addr.streetAddress}, {addr.city}<br />
                          {addr.phone}
                          {addr.email && (<><br />{addr.email}</>)}
                        </p>
                      </div>
                      <div>
                        {addr.deliveryZone && (
                          <div style={{ marginBottom: 10 }}>
                            <Heading icon={<Truck size={12} />}>კურიერი</Heading>
                            <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.85, margin: 0 }}>
                              {addr.deliveryZone?.label?.[isKa ? "ka" : "en"]}
                              <span style={{ color: C.burnt, fontWeight: 700, marginLeft: 6 }}>· {addr.deliveryZone.fee} ₾</span>
                            </p>
                          </div>
                        )}
                        {addr.contactMethod && (
                          <div>
                            <Heading icon={addr.contactMethod === "phone" ? <Phone size={12} /> : <MessageCircle size={12} />}>{isKa ? "კონტაქტი" : "Contact"}</Heading>
                            <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.85, margin: 0 }}>
                              {addr.contactMethod === "phone" ? (isKa ? "ზარი" : "Phone") : addr.contactMethod === "whatsapp" ? "WhatsApp" : addr.contactMethod === "viber" ? "Viber" : addr.contactMethod}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {addr.notes && (
                      <div style={{ paddingTop: 8, borderTop: `1px dashed rgba(42,29,20,0.14)` }}>
                        <Heading>{isKa ? "კომენტარი" : "Notes"}</Heading>
                        <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.85, margin: 0, lineHeight: 1.55 }}>{addr.notes}</p>
                      </div>
                    )}

                    {/* Status change */}
                    <div style={{ paddingTop: 8, borderTop: `1px dashed rgba(42,29,20,0.14)` }}>
                      <Heading>{isKa ? "სტატუსის ცვლილება" : "Change status"}</Heading>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {STATUS_OPTIONS.map(s => {
                          const active = o.status === s.id;
                          const busy = updatingId === o.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => !active && updateStatus(o.id, s.id)}
                              disabled={busy || active}
                              style={{
                                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
                                padding: "6px 12px", borderRadius: 999, cursor: active || busy ? "default" : "pointer",
                                background: active ? s.color : "white",
                                color: active ? "white" : C.ink,
                                border: `1.5px solid ${active ? s.color : "rgba(42,29,20,0.14)"}`,
                                opacity: busy && !active ? 0.6 : 1,
                                display: "inline-flex", alignItems: "center", gap: 4,
                              }}
                            >
                              {active && <Check size={12} />}
                              {isKa ? s.label_ka : s.label_en}
                              {busy && active && <Loader2 size={12} className="animate-spin" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Totals */}
                    <div style={{ paddingTop: 8, borderTop: `1px dashed rgba(42,29,20,0.14)`, display: "flex", flexDirection: "column", gap: 6 }}>
                      <Row label={isKa ? "ნივთები" : "Subtotal"} value={formatPrice(o.subtotal)} />
                      <Row label={isKa ? "კურიერი" : "Delivery"} value={formatPrice(o.shipping)} bold accent />
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: `1px solid rgba(42,29,20,0.10)`, fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.ink }}>
                        <span>{isKa ? "ჯამი" : "Total"}</span>
                        <span>{formatPrice(o.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Heading({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: C.ink, opacity: 0.55,
      marginBottom: 6,
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {icon}
      {children}
    </div>
  );
}

function Row({ label, value, bold = false, accent = false }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.85 }}>
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: accent ? C.burnt : C.ink }}>{value}</span>
    </div>
  );
}
