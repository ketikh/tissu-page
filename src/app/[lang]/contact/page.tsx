import { Locale } from "@/i18n/config";
import { fetchCMSSection } from "@/lib/admin-content";
import ContactClient from "./ContactClient";

const DEFAULTS = {
  email: "tissu@georgia@gmail.com",
  phone: "+995 598 22 94 38",
  instagramUrl: "https://instagram.com/thetissushop",
};

function pick(cms: Record<string, string> | null | undefined, key: string, fallback: string): string {
  const v = cms?.[key];
  return v && typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function instagramHandle(url: string): string {
  const m = url.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : "@thetissushop";
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const isKa = locale === "ka";

  const cms = await fetchCMSSection<Record<string, string>>("contact", "details", { revalidate: 600 });

  const phone = pick(cms, "phone", DEFAULTS.phone);
  const email = pick(cms, "email", DEFAULTS.email);
  const instagramUrl = pick(cms, "instagram_url", DEFAULTS.instagramUrl);
  const facebookUrl = pick(cms, "facebook_url", "");
  const tiktokUrl = pick(cms, "tiktok_url", "");
  const studio = pick(
    cms,
    `studio_address_${locale}`,
    isKa ? "თბილისი, საქართველო" : "Tbilisi, Georgia",
  );

  return (
    <ContactClient
      lang={locale}
      info={{
        email,
        phone,
        phoneHref: phone.replace(/\s+/g, ""),
        instagram: instagramHandle(instagramUrl),
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        studio,
      }}
    />
  );
}
