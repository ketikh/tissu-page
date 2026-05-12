import { NextResponse } from "next/server";

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

interface AdminPromoCode {
  id: number;
  code: string;
  description: string;
  discount_percent: number;
  active: boolean;
}

export async function GET() {
  if (!ADMIN_API_URL || !ADMIN_API_KEY) {
    return NextResponse.json({ promo_codes: [] }, { status: 200 });
  }

  try {
    const res = await fetch(`${ADMIN_API_URL}/api/promo-codes`, {
      headers: {
        "X-API-Key": ADMIN_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn(`[promo-codes proxy] admin → ${res.status}`);
      return NextResponse.json({ promo_codes: [] }, { status: 200 });
    }

    const data = await res.json();
    const codes: AdminPromoCode[] = data?.promo_codes ?? [];
    // Only expose what the storefront needs — and only active codes
    const safe = codes
      .filter(c => c.active)
      .map(c => ({ code: c.code, discount: c.discount_percent }));
    return NextResponse.json({ promo_codes: safe }, { status: 200 });
  } catch (err) {
    console.warn("[promo-codes proxy] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ promo_codes: [] }, { status: 200 });
  }
}
