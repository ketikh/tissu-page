import { NextResponse } from "next/server";

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

/**
 * Public id → tags map. Lets the cart and drawer recover the admin colour
 * tag for items that were added to the cart before the local adapter started
 * persisting tags. Read by clients on mount.
 */
export async function GET() {
  if (!ADMIN_API_URL || !ADMIN_API_KEY) {
    return NextResponse.json({ tags: {} }, { status: 200 });
  }

  try {
    const res = await fetch(`${ADMIN_API_URL}/api/storefront/products`, {
      headers: { "X-API-Key": ADMIN_API_KEY, Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return NextResponse.json({ tags: {} }, { status: 200 });

    const data = await res.json();
    const products: Array<{ id: string | number; tags?: string[] }> = data?.products ?? [];
    const tags: Record<string, string[]> = {};
    for (const p of products) {
      tags[String(p.id)] = Array.isArray(p.tags) ? p.tags : [];
    }
    return NextResponse.json({ tags }, { status: 200 });
  } catch {
    return NextResponse.json({ tags: {} }, { status: 200 });
  }
}
