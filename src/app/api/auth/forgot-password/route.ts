import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 anyway to prevent user enumeration
      return NextResponse.json({ message: "If an account exists, an email was sent." }, { status: 200 });
    }

    // Generate a 6 digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB, expiring in 1 hour
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetCode,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    // Send the email
    try {
      await sendPasswordResetEmail(email, resetCode);
    } catch (emailError: any) {
      console.error("Failed to send reset email:", emailError);
      // Let it fall through, but ideally we'd want to handle this gracefully
      // For development, if SMTP isn't configured, we print the code
      console.log(`[DEV MODE] Password reset code for ${email} is: ${resetCode}`);
    }

    return NextResponse.json({ message: "If an account exists, an email was sent." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
