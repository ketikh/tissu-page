import { Locale } from "@/i18n/config";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = { ink: "#2a1d14", softCream: "#f9f4eb", burnt: "#d56826" };

export default async function AdminSettingsPage({
  params: _params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await _params;

  const rows: Array<{ key: string; label: string; hint: string }> = [
    { key: "ADMIN_USERNAME",       label: "Admin username",       hint: "The username typed into /admin/login." },
    { key: "ADMIN_PASSWORD",       label: "Admin password",       hint: "The password typed into /admin/login. Plain text in env; rotate by changing it and restarting." },
    { key: "ADMIN_SESSION_SECRET", label: "Admin session secret", hint: "Random string used to sign the admin cookie. Change to invalidate every existing admin session." },
    { key: "TELEGRAM_BOT_TOKEN", label: "Telegram bot",      hint: "BotFather token. Used for the new-order notifier." },
    { key: "TELEGRAM_CHAT_ID",   label: "Telegram chat id",  hint: "Where new-order pings land." },
    { key: "TISSU_BANK_INFO",    label: "Bank info",         hint: "Pre-filled in the customer reply message." },
    { key: "ADMIN_API_URL",      label: "Admin API URL",     hint: "Upstream that serves /api/storefront/* + /api/promo-codes." },
    { key: "ADMIN_API_KEY",      label: "Admin API key",     hint: "Used server-side only; never sent to the browser." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>
          Settings
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "6px 0 0" }}>
          ეს მნიშვნელობები ცხოვრობს `.env` ფაილში (ლოკალურად) და Railway-ში (პროდუქციაში). შესაცვლელად — ცვლი env-ში და გადატვირთე server-ი.
        </p>
      </div>

      <div style={{ background: "white", border: `1px solid rgba(42,29,20,0.10)`, borderRadius: 18, overflow: "hidden" }}>
        {rows.map((r, idx) => (
          <div key={r.key} style={{
            padding: "16px 18px",
            borderTop: idx === 0 ? "none" : "1px solid rgba(42,29,20,0.08)",
            display: "grid",
            gridTemplateColumns: "minmax(180px, 240px) 1fr",
            gap: 16,
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink }}>{r.label}</div>
              <div style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 11, color: C.ink, opacity: 0.55, marginTop: 2 }}>{r.key}</div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.7, lineHeight: 1.55 }}>{r.hint}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: C.softCream,
        border: `1px solid rgba(42,29,20,0.08)`,
        borderRadius: 14,
        padding: 16,
        fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.75, lineHeight: 1.55,
      }}>
        Live ცვლადების შესაცვლელად მომავალში დავამატებთ ფორმას, რომელიც წერს Supabase-ის ცხრილში — ახლა ეს გვერდი მხოლოდ-წასაკითხია, რომ შემთხვევით არ გადავიწეროთ key-ები.
      </div>
    </div>
  );
}
