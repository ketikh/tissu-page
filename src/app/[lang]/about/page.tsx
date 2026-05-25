import { redirect } from "next/navigation";

// About page is intentionally disabled — anyone navigating to /[lang]/about
// gets redirected straight to the home page. Delete this file when the
// About page is brought back.
export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}`);
}
