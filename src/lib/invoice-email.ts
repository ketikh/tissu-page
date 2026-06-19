/**
 * Customer order-confirmation / invoice email via Resend's HTTP API.
 *
 * Configuration (env):
 *   RESEND_API_KEY      — Resend API key. Without it, sending is skipped (no-op).
 *   INVOICE_FROM_EMAIL  — sender, e.g. "Tissu <orders@tissu.ge>". Requires a
 *                         domain verified in Resend. Defaults to Resend's
 *                         onboarding sender, which only delivers to your own
 *                         Resend account email (fine for testing).
 *   INVOICE_OWNER_EMAIL — optional: send a blind copy of every invoice here.
 *
 * Best-effort: never throws — a failed email must not break checkout.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.INVOICE_FROM_EMAIL || "Tissu <onboarding@resend.dev>";
const OWNER_COPY = process.env.INVOICE_OWNER_EMAIL;
const SITE_URL = process.env.SITE_URL?.replace(/\/$/, "") || "https://tissu.ge";
// Email clients can't render SVG, so we use the PNG wordmark served from /public.
const LOGO_URL = `${SITE_URL}/static/logo.png`;

export interface InvoiceItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
}

export interface InvoiceParams {
  orderId: string;
  to: string;
  lang: "ka" | "en";
  customerName: string;
  phone: string;
  addressCity: string;
  addressStreet: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function money(n: number): string {
  return `${Math.round(n * 100) / 100}₾`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function t(lang: "ka" | "en") {
  return lang === "ka"
    ? {
        title: "მადლობა შენი შეკვეთისთვის!",
        intro: "მივიღეთ შენი მოთხოვნა. მალე დაგიკავშირდებით გადახდისა და მიწოდების დეტალების შესათანხმებლად.",
        order: "შეკვეთა", item: "ნივთი", qty: "რაოდ.", price: "ფასი",
        subtotal: "ჯამი", shipping: "მიწოდება", discount: "ფასდაკლება", total: "სულ",
        ship_to: "მიწოდება", phone: "ტელეფონი", notes: "შენიშვნა",
        note: "ეს არ არის გადახდის დადასტურება — გადახდა შევთანხმდებით დაკავშირებისას.",
      }
    : {
        title: "Thank you for your order!",
        intro: "We've received your request and will contact you shortly to arrange payment and delivery.",
        order: "Order", item: "Item", qty: "Qty", price: "Price",
        subtotal: "Subtotal", shipping: "Shipping", discount: "Discount", total: "Total",
        ship_to: "Ship to", phone: "Phone", notes: "Notes",
        note: "This is not a payment confirmation — we'll agree on payment when we reach out.",
      };
}

function buildInvoiceHtml(p: InvoiceParams): string {
  const L = t(p.lang);
  const short = p.orderId.slice(0, 8).toUpperCase();
  const rows = p.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee2cc;font-family:Georgia,serif;color:#2a1d14">
          ${esc(i.name)}${i.variant ? `<br><span style="font-size:12px;color:#8a7560">${esc(i.variant)}</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee2cc;text-align:center;color:#2a1d14">${i.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee2cc;text-align:right;color:#2a1d14">${money(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  const line = (label: string, val: string, bold = false) =>
    `<tr><td colspan="2" style="padding:4px 0;text-align:right;color:#2a1d14;${bold ? "font-weight:700;font-size:16px" : "color:#6b5947"}">${label}</td>
      <td style="padding:4px 0;text-align:right;color:#2a1d14;${bold ? "font-weight:700;font-size:16px" : ""}">${val}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;background:#fffcf5;padding:24px;font-family:-apple-system,Segoe UI,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee2cc;border-radius:16px;overflow:hidden">
      <div style="background:#fef0d6;padding:20px 28px;border-bottom:3px solid #d56826;text-align:center">
        <img src="${LOGO_URL}" alt="Tissu" width="132" height="42" style="display:inline-block;border:0;height:42px;width:auto" />
      </div>
      <div style="padding:28px">
        <h1 style="font-family:Georgia,serif;font-size:22px;color:#2a1d14;margin:0 0 8px">${L.title}</h1>
        <p style="color:#6b5947;font-size:14px;line-height:1.6;margin:0 0 18px">${L.intro}</p>
        <p style="color:#2a1d14;font-size:14px;margin:0 0 18px">${L.order} <strong>#${short}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
          <thead><tr>
            <th style="text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a7560;padding-bottom:8px">${L.item}</th>
            <th style="text-align:center;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a7560;padding-bottom:8px">${L.qty}</th>
            <th style="text-align:right;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a7560;padding-bottom:8px">${L.price}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
          ${line(L.subtotal, money(p.subtotal))}
          ${line(L.shipping, money(p.shipping))}
          ${p.discount > 0 ? line(L.discount, `−${money(p.discount)}`) : ""}
          ${line(L.total, money(p.total), true)}
        </table>
        <div style="background:#fef7e9;border-radius:12px;padding:14px 16px;font-size:13px;color:#2a1d14;line-height:1.6">
          <strong>${L.ship_to}:</strong> ${esc(p.customerName)}<br>
          ${esc(p.addressStreet)}, ${esc(p.addressCity)}<br>
          <strong>${L.phone}:</strong> ${esc(p.phone)}
          ${p.notes ? `<br><strong>${L.notes}:</strong> ${esc(p.notes)}` : ""}
        </div>
        <p style="color:#8a7560;font-size:12px;line-height:1.6;margin:18px 0 0">${L.note}</p>
      </div>
    </div>
  </body></html>`;
}

export async function sendOrderInvoice(p: InvoiceParams): Promise<void> {
  if (!RESEND_API_KEY) return;           // not configured — skip silently
  if (!p.to || !EMAIL_RE.test(p.to)) return;  // no/invalid customer email
  const short = p.orderId.slice(0, 8).toUpperCase();
  const subject = p.lang === "ka" ? `შენი შეკვეთა #${short} — Tissu` : `Your order #${short} — Tissu`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [p.to],
        ...(OWNER_COPY ? { bcc: [OWNER_COPY] } : {}),
        subject,
        html: buildInvoiceHtml(p),
      }),
    });
    if (!res.ok) {
      console.error(`[invoice] Resend failed (${res.status}):`, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[invoice] send error:", err);
  }
}
