// Server-side sender for the Meta Conversions API. Never throws and never
// blocks the caller's response: failures are logged with context and the
// function resolves to false.

import { getMetaConfig, isCapiConfigured, type MetaConfig } from "./config";
import { hashUserData, type PlainUserData } from "./hash";
import type { MetaCustomData, MetaEventName } from "./events";

const REQUEST_TIMEOUT_MS = 5000;

export interface ServerEventInput {
  eventName: MetaEventName;
  /** Must equal the browser event's eventID so Meta deduplicates the pair. */
  eventId: string;
  eventSourceUrl?: string;
  /** Unix time in seconds; defaults to now. */
  eventTime?: number;
  customData?: MetaCustomData;
  /** Plain customer details. Hashed here; never sent raw. */
  user?: PlainUserData;
  /** Incoming request: source of IP, user agent and the _fbp/_fbc cookies. */
  request?: Request;
}

export interface ServerEvent {
  event_name: MetaEventName;
  event_time: number;
  event_id: string;
  action_source: "website";
  event_source_url: string;
  user_data: Record<string, string>;
  custom_data?: MetaCustomData;
}

function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) cookies[name] = value;
  }
  return cookies;
}

function clientIp(headers: Headers): string | undefined {
  const cloudflare = headers.get("cf-connecting-ip");
  if (cloudflare) return cloudflare.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return undefined;
}

/** Build an fbc value from a `fbclid` query parameter when the _fbc cookie is
 *  missing (the pixel only writes the cookie once it has loaded). */
export function fbcFromUrl(url: string | undefined, now: number = Date.now()): string | undefined {
  if (!url) return undefined;
  try {
    const fbclid = new URL(url).searchParams.get("fbclid");
    return fbclid ? `fb.1.${now}.${fbclid}` : undefined;
  } catch {
    return undefined;
  }
}

export function userDataFromRequest(request: Request, eventSourceUrl?: string): Record<string, string> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const candidates: Record<string, string | undefined> = {
    client_ip_address: clientIp(request.headers),
    client_user_agent: request.headers.get("user-agent") ?? undefined,
    fbp: cookies._fbp,
    fbc: cookies._fbc || fbcFromUrl(eventSourceUrl),
  };
  return compact(candidates);
}

function compact(values: object): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" && value) result[key] = value;
  }
  return result;
}

export function buildServerEvent(input: ServerEventInput, config: MetaConfig = getMetaConfig()): ServerEvent {
  const eventSourceUrl = input.eventSourceUrl || config.siteUrl;
  const requestData = input.request ? userDataFromRequest(input.request, eventSourceUrl) : {};
  const userData = { ...compact(hashUserData(input.user ?? {})), ...requestData };
  return {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: userData,
    ...(input.customData ? { custom_data: input.customData } : {}),
  };
}

/** Send one event. Resolves true on success, false otherwise; never throws. */
export async function sendMetaEvent(input: ServerEventInput): Promise<boolean> {
  const config = getMetaConfig();
  if (!isCapiConfigured(config)) return false;
  const label = `${input.eventName} ${input.eventId}`;
  try {
    const body = {
      data: [buildServerEvent(input, config)],
      access_token: config.accessToken,
      ...(config.testEventCode ? { test_event_code: config.testEventCode } : {}),
    };
    const response = await fetch(
      `https://graph.facebook.com/${config.graphApiVersion}/${config.pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.warn(`[meta-capi] ${label} rejected (${response.status}): ${text.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[meta-capi] ${label} failed:`, error instanceof Error ? error.message : error);
    return false;
  }
}
