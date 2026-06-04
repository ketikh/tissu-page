"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";
import {
  LogOut,
  ExternalLink,
  ImageIcon,
  MessageSquare,
} from "lucide-react";

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

export default function AdminShell({
  children,
  lang,
  username,
}: {
  children: React.ReactNode;
  lang: Locale;
  username: string;
}) {
  const pathname = usePathname();

  // Trimmed admin — orders/products/content/promo are handled by the tissu-
  // agent admin. Photos is site-only (frame positioning). Reviews stays for
  // now because the agent doesn't host them yet — once it does, this tab
  // moves there too.
  const items = [
    { id: "photos",  href: `/${lang}/admin/photos`,  icon: ImageIcon,     label: "Photos",  color: C.mustard },
    { id: "reviews", href: `/${lang}/admin/reviews`, icon: MessageSquare, label: "Reviews", color: C.rose },
  ];

  // Match active link: exact for dashboard, prefix for the rest.
  const isActive = (href: string) =>
    href === `/${lang}/admin` ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{
      background: "#fffcf5",
      minHeight: "100vh",
      position: "relative",
    }}>
      <div className="container max-w-7xl mx-auto" style={{ padding: "32px 16px 80px" }}>
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <aside style={{
            background: "white",
            border: `1px solid rgba(42,29,20,0.10)`,
            borderRadius: 18,
            padding: 12,
            position: "sticky",
            top: 96,
          }}>
            <div style={{ padding: "8px 10px 14px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.ink, opacity: 0.55,
                background: C.softCream,
                border: `1px solid rgba(42,29,20,0.08)`,
                borderRadius: 999,
                padding: "4px 10px",
                marginBottom: 10,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.burnt }} />
                Admin
              </div>
              <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18, color: C.ink, lineHeight: 1.2 }}>
                Tissu
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, marginTop: 2 }}>
                @{username}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    style={{
                      position: "relative",
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px",
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                      color: active ? C.cream : C.ink,
                      background: active ? item.color : "transparent",
                      borderRadius: 12,
                      textDecoration: "none",
                      transition: "background 0.18s ease, color 0.18s ease",
                      overflow: "hidden",
                    }}
                    className={active ? "" : "hover:bg-[rgba(42,29,20,0.04)]"}
                  >
                    {!active && (
                      <span aria-hidden="true" style={{
                        position: "absolute", left: 0, top: 8, bottom: 8,
                        width: 3, background: item.color,
                        borderRadius: 999, opacity: 0.85,
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
                  </Link>
                );
              })}

              <div style={{ height: 1, background: "rgba(42,29,20,0.10)", margin: "8px 14px" }} />

              <Link
                href={`/${lang}`}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px",
                  fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                  color: C.ink, opacity: 0.7,
                  background: "transparent",
                  borderRadius: 12,
                  textDecoration: "none",
                }}
                className="hover:bg-[rgba(42,29,20,0.04)] hover:opacity-100"
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(42,29,20,0.06)", color: C.ink, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <ExternalLink size={15} />
                </span>
                View site
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/admin/auth", { method: "DELETE" });
                  window.location.assign(`/${lang}/admin/login`);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px",
                  fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                  color: C.rose,
                  background: "transparent",
                  borderRadius: 12,
                  textDecoration: "none",
                  border: "none", cursor: "pointer",
                  textAlign: "left", width: "100%",
                }}
                className="hover:bg-[rgba(196,132,154,0.08)]"
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: `${C.rose}1f`, color: C.rose, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={15} />
                </span>
                Sign out
              </button>
            </div>
          </aside>

          {/* Main */}
          <div style={{ minWidth: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
