// Shared Meta (Facebook) event definitions. Used by the browser pixel helper,
// the server-side Conversions API sender and the /api/meta/events mirror
// route. Keep this file free of Node- or browser-only imports: it is
// imported on both sides and directly by the unit tests.

export const META_CURRENCY = "GEL";

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Contact"
  | "Lead";

/** Browser events that are also mirrored to the Conversions API through
 *  POST /api/meta/events with the same event_id, so Meta deduplicates them.
 *  PageView stays browser-only; Purchase is sent by the checkout API itself. */
export const MIRRORED_EVENTS: ReadonlySet<string> = new Set([
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Contact",
  "Lead",
]);

export interface MetaContent {
  id: string;
  quantity: number;
  item_price: number;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: "product";
  content_name?: string;
  contents?: MetaContent[];
  num_items?: number;
}

export interface ClientEventPayload {
  event_name: MetaEventName;
  event_id: string;
  event_source_url?: string;
  custom_data?: MetaCustomData;
}

const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{1,64}$/;
const MAX_LIST_LENGTH = 50;
const MAX_ID_LENGTH = 100;
const MAX_NAME_LENGTH = 200;
const MAX_URL_LENGTH = 2048;

/** Round a currency amount to 2 decimals. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Unique id shared by the browser and server copy of one event. Not a
 *  security token, so the non-crypto fallback is acceptable. */
export function createEventId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.randomUUID === "function") return webCrypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function parseContents(raw: unknown): MetaContent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const contents: MetaContent[] = [];
  for (const entry of raw.slice(0, MAX_LIST_LENGTH)) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    if (typeof o.id !== "string" || !o.id) continue;
    if (!isNonNegativeNumber(o.quantity) || !isNonNegativeNumber(o.item_price)) continue;
    contents.push({ id: o.id.slice(0, MAX_ID_LENGTH), quantity: o.quantity, item_price: o.item_price });
  }
  return contents.length > 0 ? contents : undefined;
}

/** Keep only well-formed standard parameters; drop everything else. */
export function parseCustomData(raw: unknown): MetaCustomData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const data: MetaCustomData = {};
  if (isNonNegativeNumber(o.value)) data.value = roundMoney(o.value);
  if (typeof o.currency === "string" && /^[A-Z]{3}$/.test(o.currency)) data.currency = o.currency;
  if (Array.isArray(o.content_ids)) {
    const ids = o.content_ids
      .filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= MAX_ID_LENGTH)
      .slice(0, MAX_LIST_LENGTH);
    if (ids.length > 0) data.content_ids = ids;
  }
  if (o.content_type === "product") data.content_type = "product";
  if (typeof o.content_name === "string" && o.content_name.trim()) {
    data.content_name = o.content_name.trim().slice(0, MAX_NAME_LENGTH);
  }
  const contents = parseContents(o.contents);
  if (contents) data.contents = contents;
  if (isNonNegativeNumber(o.num_items)) data.num_items = Math.floor(o.num_items);
  return Object.keys(data).length > 0 ? data : undefined;
}

/** Validate a browser → server mirror payload. Returns null when invalid. */
export function parseClientEvent(input: unknown): ClientEventPayload | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  if (typeof o.event_name !== "string" || !MIRRORED_EVENTS.has(o.event_name)) return null;
  if (typeof o.event_id !== "string" || !EVENT_ID_PATTERN.test(o.event_id)) return null;
  const url =
    typeof o.event_source_url === "string" && /^https?:\/\//i.test(o.event_source_url)
      ? o.event_source_url.slice(0, MAX_URL_LENGTH)
      : undefined;
  return {
    event_name: o.event_name as MetaEventName,
    event_id: o.event_id,
    event_source_url: url,
    custom_data: parseCustomData(o.custom_data),
  };
}

const CONTACT_HREF_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^mailto:/i, "email"],
  [/^tel:/i, "phone"],
  [/^viber:/i, "viber"],
  [/(^|\/\/)(www\.)?wa\.me\//i, "whatsapp"],
  [/api\.whatsapp\.com/i, "whatsapp"],
  [/(^|\/\/)(www\.)?m\.me\//i, "messenger"],
  [/messenger\.com/i, "messenger"],
  [/instagram\.com/i, "instagram"],
  [/facebook\.com/i, "facebook"],
  [/(^|\/\/)t\.me\//i, "telegram"],
];

/** Channel name for a link that opens a conversation (used for the Contact
 *  event), or null when the link is an ordinary page link. */
export function contactChannelForHref(href: string): string | null {
  for (const [pattern, channel] of CONTACT_HREF_PATTERNS) {
    if (pattern.test(href)) return channel;
  }
  return null;
}
