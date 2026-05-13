import { Locale } from "@/i18n/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import AdminLoginClient from "./AdminLoginClient";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const locale = lang as Locale;

  // If already signed in, send straight to the dashboard.
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (await verifyAdminToken(token)) {
    redirect(sp.next || `/${locale}/admin`);
  }

  return <AdminLoginClient lang={locale} next={sp.next} />;
}
