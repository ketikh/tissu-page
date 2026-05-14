/**
 * Defines what fields each CMS section accepts. The admin Content page reads
 * this to render the right form widget for each field.
 *
 *   page    → { sections: [{ section, label, fields: [...] }] }
 *   field   → { key, label, type, placeholder? }
 *
 * Bilingual fields keep their `_ka` / `_en` suffixes so the agent stores them
 * as flat key/value pairs (no nested JSON-in-JSON).
 */

export type FieldType = "text" | "textarea" | "url" | "image";

export interface CMSField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface CMSSectionSchema {
  section: string;
  label: string;
  description?: string;
  fields: CMSField[];
}

export interface CMSPageSchema {
  page: string;
  label: string;
  sections: CMSSectionSchema[];
}

function bilingual(base: string, label: string, type: FieldType = "text", placeholder?: string): CMSField[] {
  return [
    { key: `${base}_ka`, label: `${label} (ქართ.)`, type, placeholder },
    { key: `${base}_en`, label: `${label} (Eng.)`,  type, placeholder },
  ];
}

export const CMS_PAGES: CMSPageSchema[] = [
  {
    page: "home",
    label: "მთავარი გვერდი",
    sections: [
      {
        section: "hero",
        label: "ჰერო ბანერი",
        description: "მთავარი გვერდის ზედა სექცია — სათაური, შესავალი ტექსტი, ღილაკი, ფონური ფოტო.",
        fields: [
          ...bilingual("eyebrow", "Eyebrow (პატარა ტექსტი ზევით)"),
          ...bilingual("title",   "სათაური"),
          ...bilingual("italic",  "სათაურის ნაწილი (italic)"),
          ...bilingual("lead",    "შესავალი ტექსტი", "textarea"),
          ...bilingual("cta_text", "CTA ღილაკის ტექსტი"),
          { key: "cta_link",       label: "CTA ღილაკის ბმული", type: "url", placeholder: "/ka/shop" },
          { key: "hero_image_url", label: "ფონური ფოტო (URL)",  type: "image", placeholder: "https://..." },
        ],
      },
    ],
  },
  {
    page: "about",
    label: "ჩვენი ამბავი",
    sections: [
      {
        section: "intro",
        label: "შესავალი",
        fields: [
          ...bilingual("eyebrow", "Eyebrow"),
          ...bilingual("title",   "სათაური"),
          ...bilingual("body",    "ტექსტი", "textarea"),
          { key: "intro_image_url", label: "ფოტო (URL)", type: "image" },
        ],
      },
    ],
  },
  {
    page: "contact",
    label: "კონტაქტი",
    sections: [
      {
        section: "details",
        label: "კონტაქტის დეტალები",
        fields: [
          { key: "phone",         label: "ტელეფონი",         type: "text" },
          { key: "email",         label: "ელფოსტა",          type: "text" },
          { key: "instagram_url", label: "Instagram URL",   type: "url" },
          { key: "facebook_url",  label: "Facebook URL",    type: "url" },
          { key: "tiktok_url",    label: "TikTok URL",      type: "url" },
          ...bilingual("studio_address", "სტუდიის მისამართი", "textarea"),
        ],
      },
    ],
  },
  {
    page: "footer",
    label: "ფუტერი",
    sections: [
      {
        section: "main",
        label: "ფუტერის ტექსტი",
        fields: [
          ...bilingual("tagline", "ტეგლაინი", "textarea"),
        ],
      },
      {
        section: "announcement",
        label: "Announcement bar (საიტის თავზე)",
        description: "ცარიელი თუ დატოვებ — ბანერი არ ჩანს.",
        fields: [
          ...bilingual("message", "შეტყობინება"),
          { key: "active", label: "ჩართულია? (true/false)", type: "text", placeholder: "true" },
        ],
      },
    ],
  },
];

export function findPageSchema(page: string): CMSPageSchema | undefined {
  return CMS_PAGES.find(p => p.page === page);
}

export function findSectionSchema(page: string, section: string): CMSSectionSchema | undefined {
  return findPageSchema(page)?.sections.find(s => s.section === section);
}
