import { Locale } from "@/i18n/config";
import { CMS_PAGES, type CMSPageSchema } from "@/lib/cms-schema";
import { fetchCMSPage } from "@/lib/admin-content";
import ContentClient from "./ContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const locale = lang as Locale;

  const initialPage = sp.page && CMS_PAGES.some((p: CMSPageSchema) => p.page === sp.page) ? sp.page : "home";
  const cmsData = await fetchCMSPage(initialPage, { revalidate: 0 });

  // Flatten into { sectionName: payload }
  const initialPayloads: Record<string, Record<string, unknown>> = {};
  for (const s of cmsData?.sections ?? []) {
    initialPayloads[s.section] = s.payload || {};
  }

  return (
    <ContentClient
      lang={locale}
      initialPage={initialPage}
      initialPayloads={initialPayloads}
    />
  );
}
