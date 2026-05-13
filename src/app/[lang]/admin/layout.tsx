import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Locale } from "@/i18n/config";
import AdminShell from "./AdminShell";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;

  // Server-side double-check (middleware also enforces this).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account/login?callbackUrl=/${locale}/admin`);
  }

  const email = (user.email || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email);
  if (!isAdmin) {
    redirect(`/${locale}`);
  }

  return (
    <AdminShell lang={locale} email={user.email || ""}>
      {children}
    </AdminShell>
  );
}
