// Browser-side helpers for the Meta Pixel. Safe to import anywhere: every
// function is a no-op on the server, and events fired before the pixel has
// been installed are queued and flushed once it loads (child components run
// their effects before the layout's <MetaPixel/> does).

import { createEventId, MIRRORED_EVENTS, type MetaCustomData, type MetaEventName } from "./events";

type FbqArgs = unknown[];

interface FbqFunction {
  (...args: FbqArgs): void;
  callMethod?: (...args: FbqArgs) => void;
  queue?: FbqArgs[];
  push?: FbqFunction;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const MIRROR_ENDPOINT = "/api/meta/events";
const MAX_PENDING_EVENTS = 25;
const PURCHASE_STASH_KEY = "tissu:meta-purchase";
const PURCHASE_FIRED_PREFIX = "tissu:meta-purchase-fired:";

let pixelInitialized = false;
const pendingEvents: Array<() => void> = [];

function installFbqStub(): void {
  if (window.fbq) return;
  const queue: FbqArgs[] = [];
  const fbq: FbqFunction = (...args: FbqArgs) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else queue.push(args);
  };
  fbq.queue = queue;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = FBEVENTS_SRC;
  document.head.appendChild(script);
}

/** Same behaviour as Meta's base snippet: install a queueing stub, load
 *  fbevents.js asynchronously and init the pixel. Idempotent. Also flushes
 *  events that were fired before this ran. */
export function loadMetaPixel(pixelId: string): void {
  if (typeof window === "undefined" || !pixelId || pixelInitialized) return;
  installFbqStub();
  window.fbq?.("init", pixelId);
  pixelInitialized = true;
  while (pendingEvents.length > 0) pendingEvents.shift()?.();
}

export function isPixelActive(): boolean {
  return pixelInitialized && typeof window !== "undefined" && typeof window.fbq === "function";
}

export interface TrackOptions {
  /** Reuse a known id (Purchase uses the order id). */
  eventId?: string;
  /** Also send to the Conversions API via /api/meta/events. Defaults to true
   *  for mirrored events; pass false when the server already sends it. */
  mirror?: boolean;
}

/** Fire a pixel event (queued until the pixel is installed). Returns the
 *  event id, or null on the server. */
export function trackMetaEvent(
  name: MetaEventName,
  data?: MetaCustomData,
  options: TrackOptions = {},
): string | null {
  if (typeof window === "undefined") return null;
  const eventId = options.eventId ?? createEventId();
  const send = () => {
    try {
      window.fbq?.("track", name, data ?? {}, { eventID: eventId });
    } catch {
      // Tracking must never break the page.
    }
    if (options.mirror !== false && MIRRORED_EVENTS.has(name)) mirrorToServer(name, eventId, data);
  };
  if (isPixelActive()) send();
  else if (pendingEvents.length < MAX_PENDING_EVENTS) pendingEvents.push(send);
  return eventId;
}

function mirrorToServer(name: MetaEventName, eventId: string, data?: MetaCustomData): void {
  try {
    const body = JSON.stringify({
      event_name: name,
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: data ?? {},
    });
    void fetch(MIRROR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  } catch {
    // Ignore: the browser event already went out.
  }
}

export interface StashedPurchase {
  orderId: string;
  data: MetaCustomData;
}

/** Checkout calls this right after the order is created; the confirmation
 *  page then fires the browser Purchase exactly once. */
export function stashPurchase(purchase: StashedPurchase): void {
  try {
    sessionStorage.setItem(PURCHASE_STASH_KEY, JSON.stringify(purchase));
  } catch {
    // Storage unavailable (private mode): the server-side Purchase still goes out.
  }
}

/** Fire Purchase for this order once. Refreshing the confirmation page does
 *  not fire it again: the stash is consumed and the order id is remembered. */
export function trackStashedPurchase(orderId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const firedKey = PURCHASE_FIRED_PREFIX + orderId;
    if (localStorage.getItem(firedKey)) return false;
    const raw = sessionStorage.getItem(PURCHASE_STASH_KEY);
    sessionStorage.removeItem(PURCHASE_STASH_KEY);
    if (!raw) return false;
    const stashed = JSON.parse(raw) as StashedPurchase;
    if (stashed.orderId !== orderId) return false;
    localStorage.setItem(firedKey, "1");
    trackMetaEvent("Purchase", stashed.data, { eventId: orderId, mirror: false });
    return true;
  } catch {
    return false;
  }
}
