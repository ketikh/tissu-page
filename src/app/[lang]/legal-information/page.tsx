import { i18n, Locale } from "@/i18n/config";
import type { Metadata } from "next";

// Legal identity of the business behind the TISSU brand. These values are
// read by automated business-verification systems (e.g. Meta Business
// Verification), so they are rendered as plain text and must stay exact.
const LEGAL_BUSINESS_NAME = "Individual Entrepreneur Ketevan Khukhia";
const COUNTRY_OF_REGISTRATION = "Georgia";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const path = "/legal-information";
  return {
    title: { absolute: "Legal Information | TISSU" },
    description: "Legal information about the TISSU brand and the business that operates it.",
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `/${l}${path}`])),
    },
  };
}

export default async function LegalInformationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isKa = (lang as Locale) === "ka";

  return (
    <div style={{ background: "#fffcf5", backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)", backgroundSize: "26px 26px" }}>
      <div className="container py-16 md:py-24 max-w-[780px]">
        <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
          <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
          {isKa ? "ლეგალური" : "Legal"}
        </span>
        <h1 className="ka-display-xl font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mt-6 mb-12 text-[var(--tissu-ink)]">
          {isKa ? (
            <>
              იურიდიული{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">ინფორმაცია</em>
            </>
          ) : (
            <>
              Legal <em className="not-italic italic text-[var(--tissu-terracotta)]">information</em>
            </>
          )}
        </h1>

        <div className="prose-tissu space-y-6 text-[16px] leading-[1.7] text-[var(--tissu-ink)]">
          {isKa ? <KaBody /> : <EnBody />}
        </div>

        <style>{`
          .prose-tissu p { color: var(--tissu-ink-soft); }
          .prose-tissu strong { color: var(--tissu-ink); }
        `}</style>
      </div>
    </div>
  );
}

function EnBody() {
  return (
    <>
      <p>TISSU is a Georgian brand operated by {LEGAL_BUSINESS_NAME}.</p>
      <p>
        <strong>Legal Business Name:</strong> {LEGAL_BUSINESS_NAME}
      </p>
      <p>
        <strong>Country of Registration:</strong> {COUNTRY_OF_REGISTRATION}
      </p>
    </>
  );
}

function KaBody() {
  return (
    <>
      <p>
        TISSU ქართული ბრენდია, რომელსაც მართავს <span lang="en">{LEGAL_BUSINESS_NAME}</span>.
      </p>
      <p>
        <strong>იურიდიული სახელწოდება:</strong> <span lang="en">{LEGAL_BUSINESS_NAME}</span>
      </p>
      <p>
        <strong>რეგისტრაციის ქვეყანა:</strong> საქართველო (<span lang="en">{COUNTRY_OF_REGISTRATION}</span>)
      </p>
    </>
  );
}
