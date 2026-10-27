// Browser-side helpers for the Meta Pixel. Safe to import anywhere: every
// function is a no-op when the pixel is not loaded (no META_PIXEL_ID) or when
// running on the server.

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

/** Same behaviour as Meta's base snippet: install a queueing stub, init the
 *  pixel, then load fbevents.js asynchronously. Idempotent. */
export function loadMetaPixel(pixelId: string): void {
  if (typeof window === "undefined" || !pixelId || window.fbq) return;
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

  fbq("init", pixelId);
}

export function isPixelActive(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export interface TrackOptions {
  /** Reuse a known id (Purchase uses the order id). */
  eventId?: string;
  /** Also send to the Conversions API via /api/meta/events. Defaults to true
   *  for mirrored events; pass false when the server already sends it. */
  mirror?: boolean;
}

/** Fire a pixel event. Returns the event id used, or null when inactive. */
export function trackMetaEvent(
  name: MetaEventName,
  data?: MetaCustomData,
  options: TrackOptions = {},
): string | null {
  if (!isPixelActive()) return null;
  const eventId = options.eventId ?? createEventId();
  try {
    window.fbq?.("track", name, data ?? {}, { eventID: eventId });
  } catch {
    // Tracking must never break the page.
  }
  if (options.mirror !== false && MIRRORED_EVENTS.has(name)) mirrorToServer(name, eventId, data);
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
