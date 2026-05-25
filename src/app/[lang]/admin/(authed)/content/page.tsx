import { Locale } from "@/i18n/config";
import { CMS_PAGES, type CMSPageSchema } from "@/lib/cms-schema";
import { fetchCMSPage } from "@/lib/admin-content";
import { getLandingCopy } from "@/app/[lang]/landingCopy";
import ContentClient from "./ContentClient";

export const dynamic = "force-dynamic";

/**
 * Default values shown in the admin Content editor when the CMS hasn't yet
 * received a value. They mirror the hard-coded copy on the live site so the
 * admin can see what's currently shown and only edit the bits they want to
 * change. Saving a field writes it into the CMS and from then on the live
 * site reads the CMS value instead of the default below.
 */
function buildDefaultPayloads(): Record<string, Record<string, Record<string, string>>> {
  const en = getLandingCopy("en");
  const ka = getLandingCopy("ka");

  return {
    home: {
      hero: {
        eyebrow_ka: ka.hero.eyebrow,
        eyebrow_en: en.hero.eyebrow,
        // Title is split across two lines on the hero — "line 1" and "line 2".
        title_ka:   ka.hero.titlePart1,
        title_en:   en.hero.titlePart1,
        italic_ka:  ka.hero.titleItalic,
        italic_en:  en.hero.titleItalic,
        title_line2_ka: ka.hero.titlePart2,
        title_line2_en: en.hero.titlePart2,
        lead_ka:    ka.hero.lead,
        lead_en:    en.hero.lead,
        cta_text_ka: ka.hero.ctaPrimary,
        cta_text_en: en.hero.ctaPrimary,
        cta_link:    "/ka/shop",
        hero_image_url: "/background.png",
      },
    },
    about: {
      intro: {
        eyebrow_ka: "ჩვენი ამბავი",
        eyebrow_en: "Our story",
        title_ka:   "ხელით ნაკერი ჩანთები — სიყვარულით თბილისიდან",
        title_en:   "Handmade bags — with love from Tbilisi",
        body_ka:    "Tissu არის პატარა სტუდია, რომელშიც ყოველი ჩანთა ხელით იკერება ფერად ქსოვილებში გახვეული, თბილისიდან. ჩვენი მიზანი მარტივია — ხელნაკეთი დეტალი ყოველდღიურობაში.",
        body_en:    "Tissu is a small studio in Tbilisi where every bag is sewn by hand and wrapped in colourful fabrics. Our goal is simple — a handmade detail in your everyday life.",
        intro_image_url: "",
      },
    },
    contact: {
      details: {
        phone:         "+995 555 12 34 56",
        email:         "hello@tissu.ge",
        instagram_url: "https://instagram.com/thetissushop",
        facebook_url:  "https://facebook.com/thetissushop",
        tiktok_url:    "https://tiktok.com/@thetissushop",
        studio_address_ka: "თბილისი, საქართველო\n(მხოლოდ წინასწარი ჩაწერით)",
        studio_address_en: "Tbilisi, Georgia\n(visits by appointment only)",
      },
    },
    footer: {
      main: {
        tagline_ka: "ხელნაკეთი ნივთები — სიყვარულით საქართველოდან.",
        tagline_en: "Handmade bags — made with love in Tbilisi.",
      },
      announcement: {
        message_ka: "",
        message_en: "",
        active:     "false",
      },
    },
  };
}

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

  const defaults = buildDefaultPayloads();
  const pageDefaults = defaults[initialPage] || {};

  // Merge CMS payload over defaults for each section so the admin sees the
  // current text already filled in. Saved CMS values always win.
  const initialPayloads: Record<string, Record<string, string>> = {};
  for (const schema of (CMS_PAGES.find(p => p.page === initialPage)?.sections ?? [])) {
    const sectionDefaults = pageDefaults[schema.section] || {};
    const savedSection = cmsData?.sections?.find(s => s.section === schema.section)?.payload || {};
    const merged: Record<string, string> = { ...sectionDefaults };
    for (const [k, v] of Object.entries(savedSection)) {
      if (typeof v === "string" && v.trim()) merged[k] = v;
    }
    initialPayloads[schema.section] = merged;
  }

  return (
    <ContentClient
      lang={locale}
      initialPage={initialPage}
      initialPayloads={initialPayloads}
      defaultsByPage={defaults}
    />
  );
}
