import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: "Missing Google credential" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: "Invalid Google credential" },
        { status: 400 }
      );
    }

    const email = payload.email;
    const firstName = payload.given_name || "Google";
    const lastName = payload.family_name || "User";

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true,
        orders: true,
      }
    });

    // If user does not exist, we register them seamlessly as a Google User
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: null, // Google users don't have a hashed password
        },
        include: {
          addresses: true,
          orders: true,
        }
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = await signJwt({ id: user.id, email: user.email });

    return NextResponse.json(
      { user: userWithoutPassword, token },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { error: "Server error during Google Authentication" },
      { status: 500 }
    );
  }
}
