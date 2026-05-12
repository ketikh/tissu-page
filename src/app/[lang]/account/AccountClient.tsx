"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Clock,
  Truck,
  Plus,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils";
import { useStoreHydration } from "@/store/useHydration";
import { authStyles } from "@/components/auth/AuthShell";

const { C, FRAUNCES, SANS, input, label, primaryButton, outlineButton } = authStyles;

function Star({ size = 14, color = C.mustard, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0, ...style }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

/* Reusable card shell with a colored corner accent (modernist touch) */
function Card({
  children,
  padding = 24,
  accent = "burnt",
  style = {},
}: {
  children: React.ReactNode;
  padding?: number;
  accent?: "burnt" | "mustard" | "green" | "rose" | "cream";
  style?: React.CSSProperties;
}) {
  const accentMap: Record<string, string> = {
    burnt: C.burnt,
    mustard: C.mustard,
    green: C.green,
    rose: C.rose,
    cream: C.cream,
  };
  const accentColor = accentMap[accent];
  return (
    <div style={{
      background: "white",
      border: `1px solid rgba(42,29,20,0.10)`,
      borderRadius: 18,
      padding,
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {/* Top stripe — modernist colorful accent */}
      <span aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 4,
        background: accentColor,
        opacity: 0.95,
      }} />
      {/* Top-right corner blob — organic counter to the geometric stripe */}
      <span aria-hidden="true" style={{
        position: "absolute", top: -22, right: -22,
        width: 70, height: 70,
        background: accentColor, opacity: 0.18,
        borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%",
        transform: "rotate(-12deg)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ children, num, color = C.burnt }: { children: React.ReactNode; num?: string; color?: string }) {
  return (
    <h2 style={{
      fontFamily: FRAUNCES, fontWeight: 700,
      fontSize: 19, color: C.ink, letterSpacing: "-0.005em",
      margin: 0,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <Star size={14} color={color} />
      {num && <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color }}>{num}</span>}
      {children}
    </h2>
  );
}

interface AccountClientProps {
  dictionary: any;
  lang: Locale;
}

type Tab = "overview" | "orders" | "addresses" | "wishlist" | "settings";

export default function AccountClient({ dictionary, lang }: AccountClientProps) {
  const hydrated = useStoreHydration();
  const router = useRouter();
  const { user, logout, updateProfile, addAddress, removeAddress, setAddressAsDefault, refreshProfile, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profileChecked, setProfileChecked] = useState(false);
  const isKa = lang === "ka";

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      setProfileChecked(true);
      return;
    }
    refreshProfile().finally(() => setProfileChecked(true));
  }, [hydrated, user, refreshProfile]);

  useEffect(() => {
    if (profileChecked && !useAuthStore.getState().user) {
      router.push(`/${lang}/account/login`);
    }
  }, [profileChecked, router, lang]);

  if (!hydrated || !user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffcf5" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: C.burnt }} />
      </div>
    );
  }

  const sidebarItems: { id: Tab; icon: any; label: string; color: string }[] = [
    { id: "overview", icon: UserIcon, label: dictionary.account.sidebar.profile, color: C.burnt },
    { id: "orders", icon: Package, label: dictionary.account.sidebar.orders, color: C.mustard },
    { id: "addresses", icon: MapPin, label: dictionary.account.sidebar.addresses, color: C.green },
    { id: "wishlist", icon: Heart, label: dictionary.account.sidebar.wishlist, color: C.rose },
    { id: "settings", icon: Settings, label: dictionary.account.sidebar.settings, color: C.ink },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(`/${lang}`);
  };

  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        position: "relative",
        overflow: "hidden",
        padding: "48px 0 80px",
      }}
    >
      {/* Decorative sprinkled stars */}
      <span aria-hidden="true" style={{ position: "absolute", top: 60, left: "5%", opacity: 0.85 }}><Star size={16} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: 90, right: "8%", opacity: 0.75 }}><Star size={12} color={C.burnt} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "32%", right: "3%", opacity: 0.65 }}><Star size={14} color={C.rose} /></span>
      <span aria-hidden="true" style={{ position: "absolute", top: "60%", left: "2%", opacity: 0.65 }}><Star size={14} color={C.green} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 200, left: "8%", opacity: 0.7 }}><Star size={15} /></span>
      <span aria-hidden="true" style={{ position: "absolute", bottom: 320, right: "10%", opacity: 0.65 }}><Star size={13} color={C.burnt} /></span>

      {/* Vibrant floating pebbles in all brand colors */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 180, left: "-3%",
        width: 130, height: 130,
        background: C.burnt, opacity: 0.32,
        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        transform: "rotate(-12deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 80, right: "-2%",
        width: 90, height: 90,
        background: C.mustard, opacity: 0.45,
        borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%",
        transform: "rotate(18deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "40%", left: "-2%",
        width: 70, height: 70,
        background: C.green, opacity: 0.3,
        borderRadius: "50%",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "55%", right: "-3%",
        width: 100, height: 100,
        background: C.rose, opacity: 0.32,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(-6deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 60, right: "-3%",
        width: 140, height: 140,
        background: C.mustard, opacity: 0.38,
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        transform: "rotate(10deg)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 160, left: "-2%",
        width: 80, height: 80,
        background: C.burnt, opacity: 0.28,
        borderRadius: "50%",
      }} />

      {/* Squiggly wavy lines */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", top: 230, right: "12%", opacity: 0.55, pointerEvents: "none" }}
        width="120" height="22" viewBox="0 0 120 22"
      >
        <path d="M 2 11 Q 12 1 22 11 T 42 11 T 62 11 T 82 11 T 102 11 T 118 11" stroke={C.burnt} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg
        aria-hidden="true"
        style={{ position: "absolute", top: "48%", left: "10%", opacity: 0.55, pointerEvents: "none", transform: "rotate(-8deg)" }}
        width="90" height="20" viewBox="0 0 90 20"
      >
        <path d="M 2 10 Q 10 1 18 10 T 34 10 T 50 10 T 66 10 T 82 10 T 88 10" stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg
        aria-hidden="true"
        style={{ position: "absolute", bottom: 280, left: "16%", opacity: 0.6, pointerEvents: "none" }}
        width="100" height="20" viewBox="0 0 100 20"
      >
        <path d="M 2 10 Q 11 1 20 10 T 38 10 T 56 10 T 74 10 T 92 10 T 98 10" stroke={C.mustard} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg
        aria-hidden="true"
        style={{ position: "absolute", bottom: 80, right: "20%", opacity: 0.5, pointerEvents: "none", transform: "rotate(12deg)" }}
        width="110" height="22" viewBox="0 0 110 22"
      >
        <path d="M 2 11 Q 12 1 22 11 T 42 11 T 62 11 T 82 11 T 102 11 T 108 11" stroke={C.rose} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      <div className="container max-w-6xl" style={{ position: "relative" }}>
        {/* Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
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
              {isKa ? "ჩემი სივრცე" : "Your space"}
            </span>
            <h1 style={{
              fontFamily: FRAUNCES, fontWeight: 700,
              fontSize: "clamp(26px, 3.5vw, 38px)",
              color: C.ink, letterSpacing: "-0.01em",
              lineHeight: 1.1,
              margin: 0,
            }}>
              {dictionary.account.title}
            </h1>
          </div>
          <span style={{
            fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.6,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            {isKa ? "ონლაინ" : "Online"}
          </span>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside style={{
            background: "white",
            border: `1px solid rgba(42,29,20,0.10)`,
            borderRadius: 18,
            padding: 10,
            position: "sticky",
            top: 96,
            overflow: "hidden",
          }}>
            {/* Decorative blobs in the sidebar background */}
            <span aria-hidden="true" style={{
              position: "absolute", top: -20, right: -20,
              width: 80, height: 80,
              background: C.mustard, opacity: 0.18,
              borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%",
            }} />
            <span aria-hidden="true" style={{
              position: "absolute", bottom: -30, left: -20,
              width: 70, height: 70,
              background: C.green, opacity: 0.15,
              borderRadius: "50%",
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      position: "relative",
                      width: "100%",
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                      color: active ? C.cream : C.ink,
                      background: active ? item.color : "transparent",
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      transition: "background 0.18s ease, color 0.18s ease",
                      textAlign: "left",
                      overflow: "hidden",
                    }}
                    className={active ? "" : "hover:bg-[rgba(42,29,20,0.04)]"}
                  >
                    {/* Left color bar when not active (always shows the color) */}
                    {!active && (
                      <span aria-hidden="true" style={{
                        position: "absolute", left: 0, top: 8, bottom: 8,
                        width: 3,
                        background: item.color,
                        borderRadius: 999,
                        opacity: 0.85,
                      }} />
                    )}
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: active ? "rgba(254,240,214,0.22)" : `${item.color}1f`,
                      color: active ? C.cream : item.color,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={15} />
                    </span>
                    {item.label}
                  </button>
                );
              })}

              <div style={{ height: 1, background: "rgba(42,29,20,0.10)", margin: "8px 14px" }} />

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                  color: C.rose,
                  background: "transparent",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.18s ease",
                }}
                className="hover:bg-[rgba(196,132,154,0.08)]"
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${C.rose}1f`, color: C.rose,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <LogOut size={15} />
                </span>
                {dictionary.account.sidebar.logout}
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {activeTab === "overview" && <OverviewTab user={user} dictionary={dictionary} lang={lang} onEdit={() => setActiveTab("settings")} />}
            {activeTab === "orders" && <OrdersTab user={user} dictionary={dictionary} lang={lang} />}
            {activeTab === "addresses" && (
              <AddressesTab
                user={user}
                dictionary={dictionary}
                lang={lang}
                onAdd={addAddress}
                onRemove={removeAddress}
                onSetDefault={setAddressAsDefault}
                isLoading={isLoading}
              />
            )}
            {activeTab === "settings" && <SettingsTab user={user} dictionary={dictionary} lang={lang} onUpdate={updateProfile} isLoading={isLoading} />}
            {activeTab === "wishlist" && <WishlistTab dictionary={dictionary} lang={lang} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Overview ────────── */
function OverviewTab({ user, dictionary, lang, onEdit }: { user: any; dictionary: any; lang: Locale; onEdit: () => void }) {
  const isKa = lang === "ka";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome card with burnt-accent behind avatar */}
      <Card padding={24} accent="burnt">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-5">
            <div style={{ position: "relative", width: 76, height: 76 }}>
              <div aria-hidden="true" style={{
                position: "absolute", inset: -10,
                background: C.cream, opacity: 0.9,
                borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%",
                transform: "rotate(-8deg)",
              }} />
              <div aria-hidden="true" style={{
                position: "absolute", inset: -3,
                background: C.burnt, opacity: 0.85,
                borderRadius: "50%",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: C.cream,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 24,
                color: C.burnt,
              }}>
                {(user.firstName?.[0] || "?")}{(user.lastName?.[0] || "")}
              </div>
            </div>
            <div>
              <h2 style={{
                fontFamily: FRAUNCES, fontWeight: 700,
                fontSize: 26, color: C.ink, letterSpacing: "-0.01em",
                margin: 0, lineHeight: 1.15,
              }}>
                {dictionary.account.welcome}, {user.firstName}
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "4px 0 0 0" }}>
                {user.email}
              </p>
            </div>
          </div>
          <button onClick={onEdit} style={{ ...outlineButton, width: "auto", padding: "10px 22px" }} className="hover:bg-[rgba(42,29,20,0.05)]">
            {dictionary.account.edit}
          </button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Order */}
        <Card accent="mustard">
          <div className="flex justify-between items-center mb-5">
            <SectionTitle color={C.mustard}>{dictionary.account.recentOrder}</SectionTitle>
          </div>

          {user.orders && user.orders.length > 0 ? (
            (() => {
              const recent = user.orders[0];
              const firstItem = recent.items?.[0];
              const productName = firstItem ? (typeof firstItem.productName === "string" ? JSON.parse(firstItem.productName) : firstItem.productName) : null;
              const variantName = firstItem ? (typeof firstItem.variantName === "string" ? JSON.parse(firstItem.variantName) : firstItem.variantName) : null;
              const orderDate = new Date(recent.date).toLocaleDateString(isKa ? "ka-GE" : "en-US", { year: "numeric", month: "short", day: "numeric" });
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>Order #{recent.id.slice(0, 8).toUpperCase()}</p>
                      <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, margin: "2px 0 0 0" }}>{dictionary.account.placed} {orderDate}</p>
                    </div>
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: C.burnt, background: `${C.burnt}14`,
                      padding: "4px 10px", borderRadius: 999,
                    }}>
                      {recent.status}
                    </span>
                  </div>

                  {firstItem && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: 12, borderRadius: 14,
                      background: C.softCream,
                      border: `1px solid rgba(42,29,20,0.06)`,
                    }}>
                      <div style={{ position: "relative", width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "white", flexShrink: 0 }}>
                        <Image src={firstItem.image || "/static/placeholder.jpg"} alt="Product" fill className="object-cover" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {productName?.[lang] || productName?.en || "Product"}
                        </p>
                        <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, margin: "2px 0 0 0" }}>
                          {variantName?.[lang] || variantName?.en || ""}
                        </p>
                      </div>
                    </div>
                  )}

                  <button style={{ ...outlineButton, padding: "10px 18px" }} className="hover:bg-[rgba(42,29,20,0.05)]">
                    <Clock size={14} />
                    {dictionary.account.track}
                  </button>
                </div>
              );
            })()
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{
                width: 56, height: 56, borderRadius: "50%",
                background: C.softCream, color: C.burnt,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                <Package size={24} />
              </span>
              <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: 0 }}>
                {isKa ? "შეკვეთები ჯერ არ გაქვს" : "No orders yet"}
              </p>
              <Link href={`/${lang}/shop`} style={{ ...outlineButton, display: "inline-flex", width: "auto", padding: "10px 22px" }} className="hover:bg-[rgba(42,29,20,0.05)]">
                {isKa ? "მაღაზიაში გადასვლა" : "Browse shop"}
              </Link>
            </div>
          )}
        </Card>

        {/* Default Address */}
        <Card accent="green">
          <div className="mb-5">
            <SectionTitle color={C.green}>{dictionary.account.defaultShipping}</SectionTitle>
          </div>

          {user.addresses.find((a: any) => a.isDefault) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: C.softCream, color: C.burnt,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <MapPin size={16} />
                </span>
                <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: C.ink }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{user.firstName} {user.lastName}</p>
                  <p style={{ margin: "2px 0 0", opacity: 0.75 }}>{user.addresses.find((a: any) => a.isDefault).streetAddress}</p>
                  <p style={{ margin: 0, opacity: 0.75 }}>{user.addresses.find((a: any) => a.isDefault).city}, Georgia</p>
                  <p style={{ margin: "6px 0 0", color: C.burnt, fontWeight: 600 }}>{user.addresses.find((a: any) => a.isDefault).phone}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingTop: 12, borderTop: `1px dashed rgba(42,29,20,0.18)` }}>
                <Truck size={16} style={{ color: C.burnt, opacity: 0.6, marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.6, margin: 0, lineHeight: 1.5 }}>
                  {isKa ? "სწრაფი მიწოდება ავტომატურად აირჩევა შენი ნაგულისხმევი მისამართის მიხედვით." : "The fastest shipping method is auto-selected based on your default address."}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: 0 }}>
              {isKa ? "ნაგულისხმევი მისამართი არ გაქვს დამატებული." : "No default address saved."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ────────── Orders ────────── */
function OrdersTab({ user, dictionary, lang }: { user: any; dictionary: any; lang: Locale }) {
  const isKa = lang === "ka";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle color={C.mustard}>{dictionary.account.orders.title}</SectionTitle>

      {user.orders.length === 0 ? (
        <Card padding={48} accent="mustard">
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span style={{
              width: 72, height: 72, borderRadius: "50%",
              background: C.softCream, color: C.burnt,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <Package size={32} />
            </span>
            <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: 0 }}>
              {dictionary.account.orders.empty}
            </p>
            <Link href={`/${lang}/shop`} style={{ ...primaryButton, display: "inline-flex", width: "auto" }} className="hover:-translate-y-0.5">
              {isKa ? "მაღაზიაში გადასვლა" : "Browse shop"}
            </Link>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {user.orders.map((order: any, idx: number) => (
            <Card key={order.id} padding={18} accent={(["mustard", "burnt", "green", "rose"] as const)[idx % 4]}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>#{String(order.id).slice(0, 8).toUpperCase()}</p>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, margin: "2px 0 0" }}>{order.date}</p>
                </div>
                <span style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.green, background: `${C.green}14`,
                  padding: "4px 10px", borderRadius: 999,
                }}>
                  {order.status}
                </span>
                <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.ink }}>
                  {formatPrice(order.total)}
                </span>
                <button style={{
                  fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                  color: C.burnt, background: "transparent",
                  border: "none", cursor: "pointer", padding: "8px 4px",
                }} className="hover:underline">
                  {dictionary.account.orders.details} →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────── Addresses ────────── */
function AddressesTab({ user, dictionary, lang, onAdd, onRemove, onSetDefault, isLoading }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    streetAddress: "",
    city: "Tbilisi",
    phone: user.phone || "",
    isDefault: user.addresses.length === 0,
  });
  const isKa = lang === "ka";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setAddError(null);
    const before = useAuthStore.getState().user?.addresses.length ?? 0;
    await onAdd(newAddr);
    const after = useAuthStore.getState().user?.addresses.length ?? 0;
    const storeError = useAuthStore.getState().error;

    if (after > before) {
      setShowAddForm(false);
      setNewAddr({ ...newAddr, streetAddress: "", isDefault: false });
    } else {
      setAddError(
        storeError ||
          (isKa ? "მისამართის შენახვა ვერ მოხერხდა — სცადე თავიდან." : "Couldn't save the address. Try again."),
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="flex justify-between items-center flex-wrap gap-3">
        <SectionTitle color={C.green}>{dictionary.account.addresses.title}</SectionTitle>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} style={{ ...primaryButton, width: "auto", padding: "10px 18px", fontSize: 13 }} className="hover:-translate-y-0.5">
            <Plus size={14} /> {dictionary.account.addresses.add}
          </button>
        )}
      </div>

      {showAddForm && (
        <Card padding={24} accent="green">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input style={input} placeholder={dictionary.checkout.firstName} required value={newAddr.firstName} onChange={e => setNewAddr({ ...newAddr, firstName: e.target.value })} />
              <input style={input} placeholder={dictionary.checkout.lastName} required value={newAddr.lastName} onChange={e => setNewAddr({ ...newAddr, lastName: e.target.value })} />
            </div>
            <input style={input} placeholder={dictionary.checkout.street} required value={newAddr.streetAddress} onChange={e => setNewAddr({ ...newAddr, streetAddress: e.target.value })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input style={input} placeholder={dictionary.checkout.city} required value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} />
              <input style={input} placeholder={dictionary.checkout.phone} required value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={newAddr.isDefault}
                onChange={e => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: C.burnt }}
              />
              <span style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.7 }}>
                {isKa ? "დააყენე ნაგულისხმევ მისამართად" : "Set as default address"}
              </span>
            </label>
            {addError && (
              <p style={{
                fontFamily: SANS, fontSize: 12, color: C.rose,
                background: `${C.rose}14`, border: `1px solid ${C.rose}33`,
                padding: "8px 12px", borderRadius: 10,
                margin: 0,
              }}>
                {addError}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, paddingTop: 6 }}>
              <button type="button" onClick={() => { setShowAddForm(false); setAddError(null); }} style={{ ...outlineButton, flex: 1 }} className="hover:bg-[rgba(42,29,20,0.05)]">
                {dictionary.common.cancel}
              </button>
              <button type="submit" disabled={isLoading} style={{ ...primaryButton, flex: 1, opacity: isLoading ? 0.7 : 1 }} className="hover:-translate-y-0.5">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : dictionary.common.save}
              </button>
            </div>
          </form>
        </Card>
      )}

      {user.addresses.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {user.addresses.map((addr: any, idx: number) => (
            <Card
              key={addr.id}
              padding={20}
              accent={addr.isDefault ? "burnt" : (["green", "mustard", "rose"] as const)[idx % 3]}
              style={addr.isDefault ? { border: `1.5px solid ${C.burnt}`, background: `${C.burnt}05` } : {}}
            >
              <div className="flex justify-between items-start mb-4">
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: addr.isDefault ? `${C.burnt}1a` : C.softCream,
                  color: C.burnt,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MapPin size={16} />
                </span>
                {addr.isDefault && (
                  <span style={{
                    fontFamily: SANS, fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: C.burnt, background: `${C.burnt}14`,
                    padding: "4px 10px", borderRadius: 999,
                  }}>
                    {dictionary.account.addresses.default}
                  </span>
                )}
              </div>

              <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: C.ink, marginBottom: 16 }}>
                <p style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, margin: 0 }}>{addr.firstName} {addr.lastName}</p>
                <p style={{ margin: "4px 0 0", opacity: 0.75 }}>{addr.streetAddress}</p>
                <p style={{ margin: 0, opacity: 0.75 }}>{addr.city}, Georgia</p>
                <p style={{ margin: "8px 0 0", color: C.burnt, fontWeight: 600 }}>{addr.phone}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 12, borderTop: `1px dashed rgba(42,29,20,0.14)` }}>
                {!addr.isDefault && (
                  <button onClick={() => onSetDefault(addr.id)} style={{
                    fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
                    color: C.ink, opacity: 0.6,
                    background: "transparent", border: "none", cursor: "pointer", padding: 0,
                  }} className="hover:opacity-100">
                    {dictionary.account.addresses.setAsDefault}
                  </button>
                )}
                <button
                  onClick={() => onRemove(addr.id)}
                  style={{
                    fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
                    color: C.rose, opacity: 0.85,
                    background: "transparent", border: "none", cursor: "pointer", padding: 0,
                    marginLeft: "auto",
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}
                  className="hover:opacity-100"
                >
                  <Trash2 size={13} />
                  {dictionary.common.delete}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {user.addresses.length === 0 && !showAddForm && (
        <Card padding={56} accent="green">
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <span style={{
              width: 64, height: 64, borderRadius: "50%",
              background: C.softCream, color: C.burnt,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <MapPin size={26} />
            </span>
            <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: 0 }}>
              {dictionary.account.addresses.empty}
            </p>
            <button onClick={() => setShowAddForm(true)} style={{ ...outlineButton, display: "inline-flex", width: "auto", padding: "10px 22px" }} className="hover:bg-[rgba(42,29,20,0.05)]">
              <Plus size={14} /> {isKa ? "დაამატე პირველი მისამართი" : "Add your first address"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ────────── Settings ────────── */
function SettingsTab({ user, dictionary, lang, onUpdate, isLoading }: any) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const isKa = lang === "ka";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await onUpdate(formData);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle color={C.burnt}>{dictionary.account.profile.title}</SectionTitle>

      <Card padding={24} accent="burnt">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={label}>{dictionary.account.profile.firstName}</label>
              <input style={input} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={label}>{dictionary.account.profile.lastName}</label>
              <input style={input} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={label}>{dictionary.account.profile.email}</label>
              <input style={input} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={label}>{dictionary.account.profile.phone}</label>
              <input style={input} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+995 5XX XXX XXX" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 4 }}>
            <button type="submit" disabled={isLoading} style={{ ...primaryButton, width: "auto", padding: "12px 30px", opacity: isLoading ? 0.7 : 1 }} className="hover:-translate-y-0.5">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : dictionary.account.profile.update}
            </button>
            {isSuccess && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 13, color: C.green, fontWeight: 600 }}>
                <Check size={14} />
                {dictionary.common.success}
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card padding={24} accent="rose" style={{ background: C.softCream }}>
        <div className="flex flex-col gap-3">
          <h3 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18, color: C.ink, margin: 0 }}>
            {isKa ? "პაროლი და უსაფრთხოება" : "Password & security"}
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.65, margin: 0, lineHeight: 1.55 }}>
            {isKa ? "შეცვალე პაროლი ან მართე უსაფრთხოების პარამეტრები." : "Change your password or manage security settings."}
          </p>
          <Link href={`/${lang}/account/forgot-password`} style={{ ...outlineButton, display: "inline-flex", width: "auto", padding: "10px 18px" }} className="hover:bg-[rgba(42,29,20,0.05)]">
            {isKa ? "პაროლის შეცვლა" : "Change password"}
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* ────────── Wishlist (placeholder) ────────── */
function WishlistTab({ dictionary, lang }: { dictionary: any; lang: Locale }) {
  const isKa = lang === "ka";
  return (
    <Card padding={56} accent="rose">
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span style={{
          width: 64, height: 64, borderRadius: "50%",
          background: C.softCream, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          <Heart size={28} />
        </span>
        <h3 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 20, color: C.ink, margin: 0 }}>
          {dictionary.account.sidebar.wishlist}
        </h3>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: 0 }}>
          {isKa ? "სასურველთა სია ცარიელია." : "Your wishlist is currently empty."}
        </p>
        <Link href={`/${lang}/shop`} style={{ ...outlineButton, display: "inline-flex", width: "auto", padding: "10px 22px" }} className="hover:bg-[rgba(42,29,20,0.05)]">
          {isKa ? "მაღაზიის დათვალიერება" : "Explore shop"}
        </Link>
      </div>
    </Card>
  );
}
