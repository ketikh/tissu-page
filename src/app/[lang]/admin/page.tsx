import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

export const dynamic = "force-dynamic";

interface DashboardProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminDashboard({ params }: DashboardProps) {
  const { lang } = await params;
  const locale = lang as Locale;

  // Stats — kept defensive in case the DB is empty / unreachable.
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);

  let todayCount = 0, weekCount = 0, pendingCount = 0;
  let todayRevenue = 0, weekRevenue = 0;
  let recent: Array<{ id: string; date: Date; status: string; total: number; shippingAddress: string }> = [];

  try {
    const [today, week, pending, recentRows] = await Promise.all([
      prisma.order.findMany({ where: { date: { gte: todayStart } }, select: { total: true } }),
      prisma.order.findMany({ where: { date: { gte: weekStart  } }, select: { total: true } }),
      prisma.order.count({ where: { status: "pending_confirmation" } }),
      prisma.order.findMany({
        orderBy: { date: "desc" },
        take: 6,
        select: { id: true, date: true, status: true, total: true, shippingAddress: true },
      }),
    ]);
    todayCount = today.length;
    weekCount = week.length;
    pendingCount = pending;
    todayRevenue = today.reduce((s, o) => s + (o.total || 0), 0);
    weekRevenue = week.reduce((s, o) => s + (o.total || 0), 0);
    recent = recentRows;
  } catch (err) {
    console.warn("[admin/dashboard] DB read failed:", err);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Header
        title="Dashboard"
        subtitle={`სალამი! მენეჯე შენი მაღაზია ერთ ადგილას.`}
      />

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="დღევანდელი შეკვეთები" value={String(todayCount)}  hint={formatPrice(todayRevenue)} accent={C.burnt} />
        <StatCard label="ბოლო 7 დღე"            value={String(weekCount)}   hint={formatPrice(weekRevenue)}  accent={C.mustard} />
        <StatCard label="დადასტურების მოლოდინში" value={String(pendingCount)} hint="ცოცხალი" accent={C.rose} />
        <StatCard label="სტატუსი"                value="ონლაინ"             hint="ყველაფერი მუშაობს" accent={C.green} />
      </div>

      {/* Recent orders */}
      <div style={{
        background: "white",
        border: `1px solid rgba(42,29,20,0.10)`,
        borderRadius: 18,
        padding: 22,
        position: "relative",
        overflow: "hidden",
      }}>
        <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.burnt }} />
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <h2 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18, color: C.ink, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={16} style={{ color: C.burnt }} />
            ბოლო შეკვეთები
          </h2>
          <Link
            href={`/${locale}/admin/orders`}
            style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13, color: C.burnt, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            className="hover:underline"
          >
            ყველა <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.55, margin: 0, padding: "24px 0" }}>
            ჯერ არ მოსულა შეკვეთა.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map(o => {
              let firstName = "", phone = "";
              try {
                const addr = JSON.parse(o.shippingAddress);
                firstName = `${addr.firstName || ""} ${addr.lastName || ""}`.trim();
                phone = addr.phone || "";
              } catch { /* noop */ }
              return (
                <Link
                  key={o.id}
                  href={`/${locale}/admin/orders?id=${o.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px",
                    background: C.softCream,
                    border: `1px solid rgba(42,29,20,0.06)`,
                    borderRadius: 12,
                    textDecoration: "none",
                    color: C.ink,
                    transition: "background 0.18s ease",
                  }}
                  className="hover:bg-[rgba(42,29,20,0.04)]"
                >
                  <StatusDot status={o.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14, color: C.ink, lineHeight: 1.2 }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                      {firstName && <span style={{ opacity: 0.6, fontWeight: 500, marginLeft: 8 }}>· {firstName}</span>}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, marginTop: 1 }}>
                      {new Date(o.date).toLocaleString(locale === "ka" ? "ka-GE" : "en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {phone && ` · ${phone}`}
                    </div>
                  </div>
                  <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15, color: C.ink }}>
                    {formatPrice(o.total)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── helpers ───────── */

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>
        {title}
      </h1>
      <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "6px 0 0" }}>
        {subtitle}
      </p>
    </div>
  );
}

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div style={{
      position: "relative",
      background: "white",
      border: `1px solid rgba(42,29,20,0.10)`,
      borderRadius: 16,
      padding: 18,
      overflow: "hidden",
    }}>
      <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />
      <span aria-hidden="true" style={{ position: "absolute", top: -16, right: -16, width: 56, height: 56, background: accent, opacity: 0.18, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%" }} />
      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink, opacity: 0.55 }}>
        {label}
      </div>
      <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 6, letterSpacing: "-0.01em" }}>
        {value}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: accent, fontWeight: 600, marginTop: 4 }}>
        {hint}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { color: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
    pending_confirmation: { color: C.burnt,   Icon: Clock },
    confirmed:            { color: C.green,   Icon: CheckCircle2 },
    awaiting_payment:     { color: C.mustard, Icon: Clock },
    paid:                 { color: C.green,   Icon: CheckCircle2 },
    preparing:            { color: C.burnt,   Icon: Clock },
    shipped:              { color: C.green,   Icon: CheckCircle2 },
    completed:            { color: C.green,   Icon: CheckCircle2 },
    cancelled:            { color: C.rose,    Icon: AlertCircle },
  };
  const meta = map[status] || map.pending_confirmation;
  const Icon = meta.Icon;
  return (
    <span style={{
      width: 32, height: 32, borderRadius: 10,
      background: `${meta.color}1a`, color: meta.color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={16} />
    </span>
  );
}
