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

// Georgian IBAN: "GE" + 2 check digits + 2-letter bank code + 16 digits.
const IBAN_RE = /\bGE\d{2}[A-Z]{2}\d{16}\b/g;

const BANK_LABEL: Record<string, string> = {
  TB: "TBC",
  BG: "BOG",
  LB: "Liberty",
  BS: "Basis",
  CR: "Credo",
};

/** Account numbers found in the bank text, in order, without duplicates. */
export function extractAccountNumbers(text: string): string[] {
  return [...new Set(text.match(IBAN_RE) || [])];
}

/** Short bank name for a Georgian IBAN (GE58TB… → "TBC"). */
export function bankLabelFor(iban: string): string {
  return BANK_LABEL[iban.slice(4, 6)] || "ბანკი";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Render plain text as Telegram HTML with every `copyable` value wrapped in
 *  <code>, which Telegram shows in monospace and copies to the clipboard on
 *  tap. The whole text is escaped first so customer-typed names or notes
 *  can't break the markup. A single regex pass (longest value first) means a
 *  value that is a substring of another never ends up nested. */
export function telegramHtml(text: string, copyable: string[]): string {
  const escaped = escapeHtml(text);
  const values = [...new Set(copyable.map(v => escapeHtml(v.trim())).filter(Boolean))]
    .sort((a, b) => b.length - a.length);
  if (values.length === 0) return escaped;
  const pattern = new RegExp(values.map(escapeRegExp).join("|"), "g");
  return escaped.replace(pattern, m => `<code>${m}</code>`);
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

export function buildMessage(o: OrderNotification): string {
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
  parseMode?: "HTML",
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (parseMode) body.parse_mode = parseMode;
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
export function buildCustomerReply(o: OrderNotification): string {
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
export function buildActionButtons(
  o: OrderNotification,
  accounts: string[] = extractAccountNumbers(BANK_INFO),
): Array<Array<{ text: string; url: string }>> {
  const phone = digitsOnly(o.customer.phone);
  if (!phone) return [];
  const reply = buildCustomerReply(o);
  const encoded = encodeURIComponent(reply);

  const rows = [[
    { text: "WhatsApp", url: `https://wa.me/${phone}?text=${encoded}` },
  ]];
  // One button per bank account: it pre-fills a WhatsApp message holding
  // just the account number, so after the full reply the admin sends the
  // number on its own and the customer copies it with one long-press
  // instead of fishing it out of the long message.
  const accountButtons = accounts.map(iban => ({
    text: `${bankLabelFor(iban)} ანგარიში → WhatsApp`,
    url: `https://wa.me/${phone}?text=${encodeURIComponent(iban)}`,
  }));
  if (accountButtons.length > 0) rows.push(accountButtons);
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


/** One combined message — order details, then the customer-reply template,
 *  then the phone line. The action buttons are attached underneath so the
 *  admin scrolls through and finds them at the very bottom (the user said
 *  top buttons felt wrong). */
export function buildCombinedText(order: OrderNotification): string {
  const phone = digitsOnly(order.customer.phone);
  const viberLine = phone ? `Viber / ზარი: +${phone}` : "";
  return [
    buildMessage(order),
    "",
    "---------",
    "მესიჯი მომხმარებლისთვის (გადააკოპირე ან გამოიყენე WhatsApp ღილაკი ქვევით):",
    "",
    buildCustomerReply(order),
    viberLine && "",
    viberLine,
  ].filter(Boolean).join("\n");
}

export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[notify] Telegram not configured — bot token or chat id missing.");
    return;
  }
  console.log(`[notify] sending order ${order.orderId} to Telegram chat ${TELEGRAM_CHAT_ID}`);
  const accounts  = extractAccountNumbers(BANK_INFO);
  const keyboard  = buildActionButtons(order, accounts);
  const targets   = [TELEGRAM_CHAT_ID, ...TELEGRAM_EXTRA_CHAT_IDS];

  // Photos go first so the buyer's items are visible at the top of the thread.
  const photos = order.items
    .filter(i => i.image && /^https?:\/\//i.test(i.image))
    .map(i => ({
      url: i.image!,
      caption: `[${i.code || ""}] ${i.name} × ${i.quantity}`.trim(),
    }));

  // Account numbers go out as tap-to-copy <code> spans (Telegram HTML). The
  // phone line stays plain so Telegram keeps auto-linking it for calls.
  // Without any account number we stay in plain text — nothing to mark up.
  const combined = buildCombinedText(order);
  const text      = accounts.length > 0 ? telegramHtml(combined, accounts) : combined;
  const parseMode = accounts.length > 0 ? "HTML" as const : undefined;

  for (const chatId of targets) {
    try {
      if (photos.length > 0) {
        await sendPhotos(chatId, photos);
        console.log(`[notify] sent ${photos.length} photo(s) to ${chatId}`);
      }
      await sendToTelegram(chatId, text, keyboard, parseMode);
      console.log(`[notify] sent combined text to ${chatId}`);
    } catch (err) {
      console.error(`[notify] send to ${chatId} failed:`, err);
    }
  }
}
