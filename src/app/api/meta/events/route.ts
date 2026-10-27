import { NextResponse } from "next/server";
import { parseClientEvent } from "@/lib/meta/events";
import { sendMetaEvent } from "@/lib/meta/capi";
import { getMetaConfig, isCapiConfigured } from "@/lib/meta/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Browser → server mirror for pixel events (ViewContent, AddToCart,
 * InitiateCheckout, Contact, Lead). The browser sends the same event_id it
 * gave the pixel; we add IP, user agent, pixel cookies and, for signed-in
 * customers, a hashed email, then forward to the Conversions API.
 * Purchase is NOT accepted here: the checkout API sends it itself.
 */

const MAX_BODY_BYTES = 8 * 1024;

/** Email of the signed-in customer, when there is one. Best-effort. */
async function signedInEmail(): Promise<string | undefined> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  if (!isCapiConfigured(getMetaConfig())) return new NextResponse(null, { status: 204 });

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = parseClientEvent(body);
  if (!event) return NextResponse.json({ error: "Invalid event" }, { status: 400 });

  const email = await signedInEmail();
  void sendMetaEvent({
    eventName: event.event_name,
    eventId: event.event_id,
    eventSourceUrl: event.event_source_url,
    customData: event.custom_data,
    user: email ? { email } : undefined,
    request,
  });
  return NextResponse.json({ ok: true }, { status: 202 });
}
