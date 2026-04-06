import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { AUTH_CONFIG } from "@/lib/config/auth.config";
import { cookies } from "next/headers";

// Helper to get user ID from token
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.TOKEN_COOKIE)?.value;
  if (!token) return null;
  const decoded = (await verifyJwt(token)) as any;
  return decoded?.id || null;
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const addressData = await req.json();

    // If new address is default, unset existing default
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        ...addressData,
        userId,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    console.error("Add Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, isDefault } = await req.json();

    if (isDefault) {
      // Unset previous default
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id, userId },
      data: { isDefault },
    });

    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (error: any) {
    console.error("Update Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.address.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
