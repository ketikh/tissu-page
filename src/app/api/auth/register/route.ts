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
      const msg = authError.message?.toLowerCase() || "";
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "ამ ემაილით უკვე დარეგისტრირდით. სცადეთ ავტორიზაცია." },
          { status: 400 }
        );
      }
      if (msg.includes("password")) {
        return NextResponse.json(
          { error: "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Upsert Prisma profile (create if not exists)
    await prisma.user.upsert({
      where: { id: authData.user.id },
      update: { firstName, lastName, email },
      create: {
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
