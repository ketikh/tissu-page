import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import { uploadToCloudinary, cloudinaryConfigured } from "@/lib/cloudinary-upload";

async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB ceiling per upload.

/** POST multipart/form-data — field `file` (image) and optional `folder`. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary არ არის კონფიგურირებული — დაამატე CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env-ში." },
      { status: 503 },
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "tissu/reviews");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "ფაილი ფოტო უნდა იყოს" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `ფოტოს ზომა < ${Math.round(MAX_BYTES / 1024 / 1024)}MB უნდა იყოს` }, { status: 400 });
    }

    const out = await uploadToCloudinary(file, folder);
    if (!out) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    return NextResponse.json({ url: out.url }, { status: 200 });
  } catch (err) {
    console.error("[admin/uploads/image] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
