/**
 * Server-side helpers for talking to the tissu-agent admin endpoints.
 * These calls live behind /api/admin/* proxies so the upstream key never
 * touches the browser.
 *
 * Endpoints used:
 *   PUT  /api/inventory/{item_id}             — update stock / price / color / tags
 *   POST /api/orders/{order_id}/decrease-stock — bot-side flow (unused from web)
 *   GET  /api/storefront/products/{id}        — read current product
 */

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function headers() {
  return {
    "X-API-Key": ADMIN_API_KEY!,
    Accept: "application/json",
  };
}

export interface InventoryPatch {
  stock?: number;
  price?: number;
  model?: string;
  size?: string;
  color?: string;
  tags?: string;
  on_sale?: boolean;
  sale_price?: number;
}

/** PUT /api/inventory/{item_id} — params go in the query string per the spec. */
export async function updateInventory(itemId: string | number, patch: InventoryPatch): Promise<{ ok: boolean; status: number; body: string }> {
  if (!ADMIN_API_URL || !ADMIN_API_KEY) {
    return { ok: false, status: 500, body: "Admin API not configured" };
  }
  const id = encodeURIComponent(String(itemId));
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null) continue;
    qs.set(k, String(v));
  }
  const url = `${ADMIN_API_URL}/api/inventory/${id}?${qs.toString()}`;
  try {
    const res = await fetch(url, { method: "PUT", headers: headers() });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: err instanceof Error ? err.message : String(err) };
  }
}

/** Read a product (so we can do a read–modify–write for stock deltas). */
export async function getStorefrontProduct(itemId: string | number): Promise<{ stock?: number; price?: number; in_stock?: boolean; tags?: string[] } | null> {
  if (!ADMIN_API_URL || !ADMIN_API_KEY) return null;
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/storefront/products/${encodeURIComponent(String(itemId))}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Adjust a product's stock by `delta` (negative to decrement, positive to restore).
 *  Floors at 0 — we never write a negative stock value. */
export async function adjustStock(itemId: string | number, delta: number): Promise<{ ok: boolean; newStock: number | null }> {
  const current = await getStorefrontProduct(itemId);
  if (!current) return { ok: false, newStock: null };
  const oldStock = Number(current.stock ?? 0);
  const newStock = Math.max(0, oldStock + delta);
  const result = await updateInventory(itemId, { stock: newStock });
  return { ok: result.ok, newStock: result.ok ? newStock : null };
}
