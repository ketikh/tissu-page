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

// Bank info reused inside the pre-filled WhatsApp / Viber message the admin
// sends to the customer. Configurable via env so it doesn't live in code.
const BANK_INFO = process.env.TISSU_BANK_INFO ||
  "ბანკი: BoG · ანგარიში: GE00XX0000000000000000 · მიმღები: Tissu";

function digitsOnly(s: string): string {
  return s.replace(/[^\d]/g, "");
}

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
  items: { name: string; code?: string; image?: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
}

function buildMessage(o: OrderNotification): string {
  // Plain text — no MarkdownV2 escaping headaches. Telegram renders emoji and
  // line breaks fine, which is all we need.
  const lines: string[] = [];
  lines.push(`🛍️ ახალი შეკვეთა — Tissu`);
  lines.push("");
  lines.push(`#${o.orderId.slice(0, 8).toUpperCase()}`);
  lines.push(`სტატუსი: pending_confirmation`);
  lines.push("");
  lines.push(`👤 ${o.customer.firstName} ${o.customer.lastName}`);
  lines.push(`📱 ${o.customer.phone}`);
  if (o.customer.email) lines.push(`✉️ ${o.customer.email}`);
  lines.push(`💬 ${CONTACT_LABEL[o.contactMethod] || o.contactMethod}`);
  lines.push("");
  lines.push(`📦 მისამართი`);
  lines.push(`${o.address.street}, ${o.address.city}`);
  if (o.deliveryZone) {
    lines.push(`🚚 ${o.deliveryZone.label.ka} — ${o.deliveryZone.fee} ₾`);
  }
  lines.push("");
  lines.push(`🛒 ნივთები`);
  for (const item of o.items) {
    const codePart = item.code ? `[${item.code}] ` : "";
    lines.push(`• ${codePart}${item.name} × ${item.quantity} — ${item.price * item.quantity} ₾`);
  }
  lines.push("");
  lines.push(`Subtotal: ${o.subtotal} ₾`);
  lines.push(`Delivery: ${o.shipping} ₾`);
  lines.push(`Total: ${o.total} ₾`);
  if (o.notes) {
    lines.push("");
    lines.push(`📝 ${o.notes}`);
  }
  return lines.join("\n");
}

async function sendToTelegram(
  chatId: string,
  text: string,
  inlineKeyboard?: Array<Array<{ text: string; url: string }>>,
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (inlineKeyboard && inlineKeyboard.length > 0) {
    body.reply_markup = { inline_keyboard: inlineKeyboard };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Telegram ${res.status}: ${detail.slice(0, 200)}`);
  }
}

/** Build the pre-filled message admin will send to customer through whichever
 *  channel they pick (WhatsApp / Viber / SMS / etc.). The admin can edit it
 *  before hitting "send". */
function buildCustomerReply(o: OrderNotification): string {
  const lines: string[] = [];
  lines.push(`გამარჯობა${o.customer.firstName ? `, ${o.customer.firstName}` : ""}! 👋`);
  lines.push("");
  lines.push(`თქვენი შეკვეთა #${o.orderId.slice(0, 8).toUpperCase()} მივიღეთ ✅`);
  lines.push("");
  if (o.items.length > 0) {
    lines.push("შეკვეთილი ნივთები:");
    for (const i of o.items) {
      const codePart = i.code ? `[${i.code}] ` : "";
      lines.push(`• ${codePart}${i.name} × ${i.quantity}`);
    }
    lines.push("");
  }
  lines.push(`სულ გადასახდელი: ${o.total} ₾ (კურიერი ${o.shipping} ₾ ჩათვლით)`);
  lines.push("");
  lines.push("გადახდის რეკვიზიტები:");
  lines.push(BANK_INFO);
  lines.push("");
  lines.push("გადარიცხვის შემდეგ მოგვწერეთ დასადასტურებლად, რომ შეკვეთა გავგზავნოთ. გმადლობთ! 🧡");
  return lines.join("\n");
}

/** Telegram bot links + WhatsApp / Viber deep-links use the customer phone.
 *  The customer typed it in checkout — we just strip everything but digits. */
function buildActionButtons(o: OrderNotification): Array<Array<{ text: string; url: string }>> {
  const phone = digitsOnly(o.customer.phone);
  if (!phone) return [];
  const reply = buildCustomerReply(o);
  const encoded = encodeURIComponent(reply);
  const rows: Array<Array<{ text: string; url: string }>> = [];

  // Row 1 — primary message channels (WhatsApp / Viber)
  rows.push([
    { text: "💬 WhatsApp",         url: `https://wa.me/${phone}?text=${encoded}` },
    { text: "💜 Viber",            url: `viber://chat?number=%2B${phone}` },
  ]);

  // Row 2 — phone call + copy-payable text (Telegram lets you tap-and-copy)
  rows.push([
    { text: "📞 ზარი",             url: `tel:+${phone}` },
  ]);

  return rows;
}

/** Telegram's sendMediaGroup accepts 2–10 photos. For a single photo we have
 *  to use sendPhoto instead. */
async function sendPhotos(chatId: string, photos: { url: string; caption?: string }[]): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || photos.length === 0) return;
  const cleaned = photos.filter(p => /^https?:\/\//i.test(p.url));
  if (cleaned.length === 0) return;

  if (cleaned.length === 1) {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: cleaned[0].url,
        caption: cleaned[0].caption || undefined,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Telegram sendPhoto ${res.status}: ${detail.slice(0, 200)}`);
    }
    return;
  }

  // sendMediaGroup — up to 10 per call
  const chunks: typeof cleaned[] = [];
  for (let i = 0; i < cleaned.length; i += 10) chunks.push(cleaned.slice(i, i + 10));
  for (const chunk of chunks) {
    const media = chunk.map((p, i) => ({
      type: "photo",
      media: p.url,
      ...(i === 0 && p.caption ? { caption: p.caption } : {}),
    }));
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, media }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Telegram sendMediaGroup ${res.status}: ${detail.slice(0, 200)}`);
    }
  }
}

export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[notify] Telegram not configured — bot token or chat id missing.");
    return;
  }
  console.log(`[notify] sending order ${order.orderId} to Telegram chat ${TELEGRAM_CHAT_ID}`);
  const text = buildMessage(order);
  const keyboard = buildActionButtons(order);
  const targets = [TELEGRAM_CHAT_ID, ...TELEGRAM_EXTRA_CHAT_IDS];

  // Collect product photos that have a URL — Telegram needs publicly fetchable URLs.
  const photos = order.items
    .filter(i => i.image && /^https?:\/\//i.test(i.image))
    .map(i => ({
      url: i.image!,
      caption: `[${i.code || ""}] ${i.name} × ${i.quantity}`.trim(),
    }));

  // Pre-filled customer reply — sent as a separate message so admin can long-
  // press to copy it before hitting WhatsApp / Viber.
  const customerReplyPreview = `📋 *მესიჯი მომხმარებლისთვის* (გადააკოპირე ან გამოიყენე ღილაკები ზევით):\n\n${buildCustomerReply(order)}`;

  for (const chatId of targets) {
    try {
      await sendToTelegram(chatId, text, keyboard);
      console.log(`[notify] sent text to ${chatId}`);
      if (photos.length > 0) {
        await sendPhotos(chatId, photos);
        console.log(`[notify] sent ${photos.length} photo(s) to ${chatId}`);
      }
      // Also send the editable plain-text preview so the admin has the copy
      // ready to paste anywhere (Messenger, Instagram, email, etc.).
      await sendToTelegram(chatId, customerReplyPreview);
      console.log(`[notify] sent customer-reply preview to ${chatId}`);
    } catch (err) {
      console.error(`[notify] send to ${chatId} failed:`, err);
    }
  }
}
