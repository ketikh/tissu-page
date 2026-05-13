import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/", url));
}

export async function POST(req: Request) {
  return GET(req);
}
