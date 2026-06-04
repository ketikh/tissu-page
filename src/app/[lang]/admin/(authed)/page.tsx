import { redirect } from "next/navigation";

// Dashboard removed from nav. Land users on Orders so /admin always opens
// to something useful instead of a stale stats page.
export default async function AdminIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/admin/photos`);
}
