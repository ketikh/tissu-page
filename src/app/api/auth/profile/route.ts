import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// GET — fetch profile (used after login)
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { addresses: true, orders: { include: { items: true } } },
    });

    // Auto-create profile if it doesn't exist (e.g., OAuth login)
    if (!user) {
      const meta = authUser.user_metadata;
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          firstName: meta?.first_name || meta?.full_name?.split(" ")[0] || "User",
          lastName: meta?.last_name || meta?.full_name?.split(" ").slice(1).join(" ") || "",
        },
        include: { addresses: true, orders: { include: { items: true } } },
      });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — create profile after registration
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName } = await req.json();

    const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        firstName: firstName || "User",
        lastName: lastName || "",
      },
      include: { addresses: true, orders: { include: { items: true } } },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Profile Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH — update profile
export async function PATCH(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, phone, email } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: { firstName, lastName, phone, email },
      include: { addresses: true, orders: { include: { items: true } } },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
