import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { AUTH_CONFIG } from "@/lib/config/auth.config";
import { cookies } from "next/headers";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = (await verifyJwt(token)) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { firstName, lastName, phone, email } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id as string },
      data: {
        firstName,
        lastName,
        phone,
        email,
      },
      include: {
        addresses: true,
        orders: true,
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
