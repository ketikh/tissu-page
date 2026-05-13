import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Locale } from "@/i18n/config";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-session";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

/**
 * Layout for the authed admin pages. Lives inside the (authed) route group
 * so it does NOT wrap /admin/login — that page renders without the gate.
 */
export default async function AdminAuthedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;

  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  const ok = await verifyAdminToken(token);
  if (!ok) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <AdminShell lang={locale} username={process.env.ADMIN_USERNAME || "admin"}>
      {children}
    </AdminShell>
  );
}
