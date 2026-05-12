import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/** Ensure a Prisma user row exists for this Supabase auth user.
 *  Without this the Address foreign key would fail for accounts that signed
 *  up through Google/Supabase before the profile-sync hooks were added. */
async function ensurePrismaUser(authUser: { id: string; email?: string | null; user_metadata?: any }) {
  const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;
  const meta = authUser.user_metadata || {};
  return prisma.user.create({
    data: {
      id: authUser.id,
      email: authUser.email || `${authUser.id}@tissu.local`,
      firstName: meta.first_name || meta.full_name?.split(" ")[0] || "User",
      lastName: meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
    },
  });
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensurePrismaUser(authUser);
    const userId = authUser.id;

    const addressData = await req.json();
    // Only persist the fields the schema knows about — extra fields like
    // postal codes from older form variants would make Prisma throw.
    const { firstName, lastName, city, streetAddress, phone, notes, isDefault } = addressData ?? {};

    if (!firstName || !lastName || !city || !streetAddress || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        firstName,
        lastName,
        city,
        streetAddress,
        phone,
        notes: notes ?? null,
        isDefault: Boolean(isDefault),
        userId,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Add Address Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = authUser.id;

    const { id, isDefault } = await req.json();

    if (isDefault) {
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
  } catch (error) {
    console.error("Update Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = authUser.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.address.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
