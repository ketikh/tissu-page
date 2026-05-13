/**
 * Admin notifications. When a customer submits an order request, we ping a
 * Telegram bot so Tissu sees the new order instantly on phone.
 *
 * Setup:
 *   1. Create a bot via @BotFather on Telegram, copy the token.
 *   2. Message your bot once, then visit
 *      https://api.telegram.org/bot<TOKEN>/getUpdates
 *      to find your chat id.
 *   3. Put both in .env:
 *        TELEGRAM_BOT_TOKEN=123456:ABC...
 *        TELEGRAM_CHAT_ID=987654321
 *
 * If either variable is missing, this module silently no-ops — orders still
 * save, the customer still gets a confirmation, you just don't get a ping.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
// Optional comma-separated extra chat ids (e.g. group chat or co-founder).
const TELEGRAM_EXTRA_CHAT_IDS = (process.env.TELEGRAM_EXTRA_CHAT_IDS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const CONTACT_LABEL: Record<string, string> = {
  phone: "📞 Phone call",
  whatsapp: "💬 WhatsApp",
  viber: "💬 Viber",
};

interface OrderNotification {
  orderId: string;
  customer: { firstName: string; lastName: string; phone: string; email?: string };
  contactMethod: string;
  deliveryZone?: { id: string; label: { ka: string; en: string }; fee: number };
  address: { city: string; street: string };
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
}

function escapeMd(s: string): string {
  // MarkdownV2 reserved chars per Telegram docs
  return s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

function buildMessage(o: OrderNotification): string {
  const lines: string[] = [];
  lines.push(`🛍️ *ახალი შეკვეთა — Tissu*`);
  lines.push("");
  lines.push(`*#${escapeMd(o.orderId.slice(0, 8).toUpperCase())}*`);
  lines.push(`სტატუსი: \`pending_confirmation\``);
  lines.push("");
  lines.push(`👤 ${escapeMd(`${o.customer.firstName} ${o.customer.lastName}`)}`);
  lines.push(`📱 ${escapeMd(o.customer.phone)}`);
  if (o.customer.email) lines.push(`✉️ ${escapeMd(o.customer.email)}`);
  lines.push(`კონტაქტი: ${escapeMd(CONTACT_LABEL[o.contactMethod] || o.contactMethod)}`);
  lines.push("");
  lines.push(`📦 *მისამართი*`);
  lines.push(escapeMd(`${o.address.street}, ${o.address.city}`));
  if (o.deliveryZone) {
    lines.push(escapeMd(`ზონა: ${o.deliveryZone.label.ka} — ${o.deliveryZone.fee} ₾`));
  }
  lines.push("");
  lines.push(`🛒 *ნივთები*`);
  for (const item of o.items) {
    lines.push(escapeMd(`• ${item.name} × ${item.quantity} — ${item.price * item.quantity} ₾`));
  }
  lines.push("");
  lines.push(escapeMd(`Subtotal: ${o.subtotal} ₾`));
  lines.push(escapeMd(`Delivery: ${o.shipping} ₾`));
  lines.push(`*${escapeMd(`Total: ${o.total} ₾`)}*`);
  if (o.notes) {
    lines.push("");
    lines.push(`📝 ${escapeMd(o.notes)}`);
  }
  return lines.join("\n");
}

async function sendToTelegram(chatId: string, text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Telegram ${res.status}: ${detail.slice(0, 200)}`);
  }
}

export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[notify] Telegram not configured — skipping admin ping.");
    return;
  }
  const text = buildMessage(order);
  const targets = [TELEGRAM_CHAT_ID, ...TELEGRAM_EXTRA_CHAT_IDS];
  await Promise.all(
    targets.map(chatId =>
      sendToTelegram(chatId, text).catch(err => {
        console.error(`[notify] send to ${chatId} failed:`, err);
      }),
    ),
  );
}
