/**
 * The email that carries a winner's one-time code. Sent through Resend, with
 * the same account and sender address as the order emails:
 *   RESEND_API_KEY     — without it nothing can be sent.
 *   INVOICE_FROM_EMAIL — sender, e.g. "Tissu <orders@tissu.ge>".
 */
import type { GameCodeEmail } from "./claim";
import { GAME_CODE_DISCOUNT_PERCENT, formatTbilisiDate } from "./promo-codes";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;
const DEFAULT_SITE_URL = "https://tissu.ge";
const DEFAULT_SENDER = "Tissu <onboarding@resend.dev>";
const PERCENT = GAME_CODE_DISCOUNT_PERCENT;

interface EmailTexts {
  readonly subject: string;
  readonly title: string;
  readonly intro: string;
  readonly terms: (lastDay: string) => string;
  readonly howTitle: string;
  readonly onSite: string;
  readonly inChat: string;
  readonly shop: string;
  readonly why: string;
}

const TEXTS: Readonly<Record<"ka" | "en", EmailTexts>> = {
  ka: {
    subject: `შენი ${PERCENT}%-იანი კოდი TISSU-სგან 🧵`,
    title: "გილოცავ, სამივე ჩანთა ააწყვე!",
    intro: `აი შენი ${PERCENT}%-იანი ფასდაკლების კოდი:`,
    terms: (lastDay) => `კოდი ერთჯერადია და მოქმედებს ${lastDay}-ის ჩათვლით.`,
    howTitle: "როგორ გამოიყენო",
    onSite: "საიტზე: ჩაწერე კოდი კალათაში, ველში „პრომო კოდი“.",
    inChat: "ჩატში: მოგვწერე და გვითხარი შენი კოდი.",
    shop: "მაღაზიაში →",
    why: "ეს წერილი მიიღე, რადგან tissu.ge-ზე ითამაშე თამაში „ააწყვე ჩანთა“.",
  },
  en: {
    subject: `Your ${PERCENT}% code from TISSU 🧵`,
    title: "Well done, you built all three bags!",
    intro: `Here is your ${PERCENT}% discount code:`,
    terms: (lastDay) => `The code works once and is valid through ${lastDay}.`,
    howTitle: "How to use it",
    onSite: "On the site: type the code into the “Promo code” box in your cart.",
    inChat: "In chat: message us and tell us your code.",
    shop: "To the shop →",
    why: "You received this email because you played the “Build the bag” game on tissu.ge.",
  },
};

function escapeHtml(text: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  return text.replace(/[&<>"]/g, (character) => entities[character]);
}

function buildHtml(texts: EmailTexts, code: string, lastDay: string, shopUrl: string, logoUrl: string): string {
  const muted = "color:#6b5947;font-size:14px;line-height:1.6";
  return `<!doctype html><html><body style="margin:0;background:#fffcf5;padding:24px;font-family:-apple-system,Segoe UI,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee2cc;border-radius:16px;overflow:hidden">
      <div style="background:#fef0d6;padding:20px 28px;border-bottom:3px solid #d56826;text-align:center">
        <img src="${escapeHtml(logoUrl)}" alt="Tissu" width="132" height="42" style="display:inline-block;border:0;height:42px;width:auto" />
      </div>
      <div style="padding:28px;text-align:center">
        <h1 style="font-family:Georgia,serif;font-size:22px;color:#205348;margin:0 0 10px">${escapeHtml(texts.title)}</h1>
        <p style="${muted};margin:0 0 16px">${escapeHtml(texts.intro)}</p>
        <div style="border:2px dashed #f50065;border-radius:16px;background:#ffd5e5;padding:18px 12px;margin:0 0 14px">
          <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:3px;color:#f50065">${escapeHtml(code)}</div>
        </div>
        <p style="${muted};margin:0 0 20px">${escapeHtml(texts.terms(lastDay))}</p>
        <div style="background:#fef7e9;border-radius:12px;padding:14px 16px;text-align:left;font-size:13px;color:#2a1d14;line-height:1.7">
          <strong>${escapeHtml(texts.howTitle)}</strong><br>
          ${escapeHtml(texts.onSite)}<br>
          ${escapeHtml(texts.inChat)}
        </div>
        <a href="${escapeHtml(shopUrl)}" style="display:inline-block;margin:22px 0 0;background:#205348;color:#fff0d5;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:999px">${escapeHtml(texts.shop)}</a>
        <p style="color:#8a7560;font-size:12px;line-height:1.6;margin:22px 0 0">${escapeHtml(texts.why)}</p>
      </div>
    </div>
  </body></html>`;
}

function buildText(texts: EmailTexts, code: string, lastDay: string, shopUrl: string): string {
  return [
    texts.title,
    "",
    texts.intro,
    code,
    "",
    texts.terms(lastDay),
    "",
    texts.howTitle,
    `- ${texts.onSite}`,
    `- ${texts.inChat}`,
    "",
    shopUrl,
    "",
    texts.why,
  ].join("\n");
}

export interface BuiltEmail {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

export function buildGameCodeEmail(email: GameCodeEmail, siteUrl: string = DEFAULT_SITE_URL): BuiltEmail {
  const texts = TEXTS[email.lang];
  const base = siteUrl.replace(/\/$/, "");
  const lastDay = formatTbilisiDate(email.expiresAt);
  const shopUrl = `${base}/${email.lang}/shop`;
  return {
    subject: texts.subject,
    html: buildHtml(texts, email.code, lastDay, shopUrl, `${base}/static/logo.png`),
    text: buildText(texts, email.code, lastDay, shopUrl),
  };
}

export function isGameEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Why Resend refused, without the message body (which can repeat the recipient's address). */
async function readRefusalReason(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const name = body && typeof body === "object" ? (body as { name?: unknown }).name : null;
    return typeof name === "string" ? name : "unknown";
  } catch {
    // Not JSON: the status code alone will have to do.
    return "unknown";
  }
}

/** Hands the email to Resend. Resolves to false, with a log line, when that fails. */
export async function sendGameCodeEmail(email: GameCodeEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[game-email] RESEND_API_KEY is not configured");
    return false;
  }
  const built = buildGameCodeEmail(email, process.env.SITE_URL || DEFAULT_SITE_URL);
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.INVOICE_FROM_EMAIL || DEFAULT_SENDER,
        to: [email.to],
        subject: built.subject,
        html: built.html,
        text: built.text,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (response.ok) return true;
    console.error(`[game-email] Resend refused the email (${response.status}, ${await readRefusalReason(response)})`);
    return false;
  } catch (error) {
    console.error("[game-email] could not reach Resend:", error instanceof Error ? error.name : "unknown error");
    return false;
  }
}
