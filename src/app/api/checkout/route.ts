import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/lib/config/auth.config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, subtotal, shipping, discount, total, shippingAddress, paymentMethod, isGuest } = body;

    // Optional user validation based on active cookie
    let userId: string | undefined = undefined;
    
    if (!isGuest) {
      const cookieStore = await cookies();
      const token = cookieStore.get(AUTH_CONFIG.TOKEN_COOKIE)?.value;
      if (token) {
        const payload = await verifyJwt(token);
        if (payload?.id) {
          userId = payload.id as string;
        }
      }
    }

    // Persist Order into Database
    const order = await prisma.order.create({
      data: {
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod,
        shippingAddress: JSON.stringify(shippingAddress),
        userId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: JSON.stringify(item.productName),
            variantName: JSON.stringify(item.variantName),
            image: item.image,
          }))
        }
      },
      include: {
        items: true,
      }
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout Create Error:", error);
    return NextResponse.json(
      { error: "Failed to complete checkout" },
      { status: 500 }
    );
  }
}
