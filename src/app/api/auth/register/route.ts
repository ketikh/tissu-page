import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Create user with admin API — auto-confirms email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) {
      // Handle duplicate user
      if (authError.message?.includes("already been registered")) {
        return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create profile in our DB
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        firstName,
        lastName,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Server error during registration" }, { status: 500 });
  }
}
