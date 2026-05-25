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
  phone: "Phone call",
  whatsapp: "WhatsApp",
  viber: "Viber",
};

interface OrderNotification {
  orderId: string;
  customer: { firstName: string; lastName: string; phone: string; email?: string };
  contactMethod: string;
  deliveryZone?: { id: string; label: { ka: string; en: string }; fee: number };
  address: { city: string; street: string };
  items: { name: string; variant?: string; code?: string; image?: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
}

function buildMessage(o: OrderNotification): string {
  // Plain text — no emoji, no Markdown. Some clients show emoji as replacement
  // characters; admin asked for clean text.
  const lines: string[] = [];
  lines.push(`ახალი შეკვეთა — Tissu`);
  lines.push("");
  lines.push(`#${o.orderId.slice(0, 8).toUpperCase()}`);
  lines.push(`სტატუსი: pending_confirmation`);
  lines.push("");
  lines.push(`სახელი: ${o.customer.firstName} ${o.customer.lastName}`);
  lines.push(`ტელეფონი: ${o.customer.phone}`);
  if (o.customer.email) lines.push(`ელფოსტა: ${o.customer.email}`);
  lines.push(`კავშირი: ${CONTACT_LABEL[o.contactMethod] || o.contactMethod}`);
  lines.push("");
  lines.push(`მისამართი:`);
  lines.push(`${o.address.street}, ${o.address.city}`);
  if (o.deliveryZone) {
    lines.push(`მიწოდება: ${o.deliveryZone.label.ka} — ${o.deliveryZone.fee} ლ`);
  }
  lines.push("");
  lines.push(`ნივთები:`);
  for (const item of o.items) {
    const codePart = item.code ? `[${item.code}] ` : "";
    lines.push(`- ${codePart}${item.name} x ${item.quantity} — ${item.price * item.quantity} ლ`);
    if (item.variant && item.variant.trim()) {
      // For custom-built items (necklace builder) the fabric/charm picks live
      // in the variant label — splat them onto their own indented line.
      lines.push(`    ${item.variant.trim()}`);
    }
  }
  lines.push("");
  lines.push(`ჯამი: ${o.subtotal} ლ`);
  lines.push(`მიწოდება: ${o.shipping} ლ`);
  lines.push(`სულ: ${o.total} ლ`);
  if (o.notes) {
    lines.push("");
    lines.push(`კომენტარი: ${o.notes}`);
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
  lines.push(`გამარჯობა${o.customer.firstName ? `, ${o.customer.firstName}` : ""}!`);
  lines.push("");
  lines.push(`თქვენი შეკვეთა #${o.orderId.slice(0, 8).toUpperCase()} მივიღეთ.`);
  lines.push("");
  if (o.items.length > 0) {
    lines.push("შეკვეთილი ნივთები:");
    for (const i of o.items) {
      const codePart = i.code ? `[${i.code}] ` : "";
      lines.push(`- ${codePart}${i.name} x ${i.quantity}`);
      if (i.variant && i.variant.trim()) {
        lines.push(`    ${i.variant.trim()}`);
      }
    }
    lines.push("");
  }
  lines.push(`სულ გადასახდელი: ${o.total} ლ (კურიერი ${o.shipping} ლ ჩათვლით)`);
  lines.push("");
  lines.push("გადახდის რეკვიზიტები:");
  lines.push(BANK_INFO);
  lines.push("");
  lines.push("გადარიცხვის შემდეგ მოგვწერეთ დასადასტურებლად, რომ შეკვეთა გავგზავნოთ. გმადლობთ!");
  return lines.join("\n");
}

/** Build the WhatsApp button for Telegram's inline keyboard. Telegram only
 *  allows http/https/tg URLs in keyboard buttons — `viber://` and `tel:` get
 *  rejected with a 400 ("Unsupported URL protocol") and the whole message
 *  fails to send. So we keep WhatsApp as the one tap-to-message button and
 *  put the phone number prominently in the message body — Telegram makes it
 *  tappable for calls automatically. */
function buildActionButtons(o: OrderNotification): Array<Array<{ text: string; url: string }>> {
  const phone = digitsOnly(o.customer.phone);
  if (!phone) return [];
  const reply = buildCustomerReply(o);
  const encoded = encodeURIComponent(reply);

  return [[
    { text: "WhatsApp", url: `https://wa.me/${phone}?text=${encoded}` },
  ]];
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
  const orderText = buildMessage(order);
  const keyboard  = buildActionButtons(order);
  const targets   = [TELEGRAM_CHAT_ID, ...TELEGRAM_EXTRA_CHAT_IDS];

  // Photos go first so the buyer's items are visible at the top of the thread.
  const photos = order.items
    .filter(i => i.image && /^https?:\/\//i.test(i.image))
    .map(i => ({
      url: i.image!,
      caption: `[${i.code || ""}] ${i.name} × ${i.quantity}`.trim(),
    }));

  // One combined message at the bottom — order details, then the customer-
  // reply template, then WhatsApp / Viber buttons attached underneath. This
  // way the admin scrolls through and the action buttons end up at the very
  // bottom (the user said top buttons felt wrong).
  const phone = digitsOnly(order.customer.phone);
  const viberLine = phone ? `Viber / ზარი: +${phone}` : "";
  const combined = [
    orderText,
    "",
    "---------",
    "მესიჯი მომხმარებლისთვის (გადააკოპირე ან გამოიყენე WhatsApp ღილაკი ქვევით):",
    "",
    buildCustomerReply(order),
    viberLine && "",
    viberLine,
  ].filter(Boolean).join("\n");

  for (const chatId of targets) {
    try {
      if (photos.length > 0) {
        await sendPhotos(chatId, photos);
        console.log(`[notify] sent ${photos.length} photo(s) to ${chatId}`);
      }
      await sendToTelegram(chatId, combined, keyboard);
      console.log(`[notify] sent combined text to ${chatId}`);
    } catch (err) {
      console.error(`[notify] send to ${chatId} failed:`, err);
    }
  }
}
