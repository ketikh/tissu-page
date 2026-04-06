import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, subtotal, shipping, discount, total, shippingAddress, paymentMethod, isGuest } = body;

    let userId: string | undefined = undefined;

    if (!isGuest) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

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
  } catch (error) {
    console.error("Checkout Create Error:", error);
    return NextResponse.json(
      { error: "Failed to complete checkout" },
      { status: 500 }
    );
  }
}
