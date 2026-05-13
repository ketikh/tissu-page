/**
 * Courier delivery price list. The customer picks a zone on checkout and the
 * displayed shipping fee is taken from here. Final price is still confirmed
 * by Tissu after the order request lands.
 *
 * Tariff structure (per the brief):
 *  Tbilisi (central districts) ............... 6 GEL
 *  Tbilisi outskirts (Lilo, Zahesi, ...) ..... 7 GEL
 *  Rustavi ................................... 8 GEL
 *  Tbilisi villages (Tskneti, Shindisi, ...) . 10 GEL
 *  Regional cities (Kutaisi, Batumi, ...) .... 8 GEL
 *  Other Georgian towns (daba) ............... 10 GEL
 *  Other Georgian villages ................... 12 GEL
 */

export type DeliveryRegion =
  | "tbilisi"
  | "rustavi"
  | "imereti"
  | "samegrelo"
  | "guria"
  | "shida-kartli"
  | "samtskhe-javakheti"
  | "kakheti"
  | "adjara-kvemo"
  | "other";

export interface DeliveryZone {
  id: string;
  region: DeliveryRegion;
  regionLabel: { ka: string; en: string };
  label: { ka: string; en: string };
  fee: number;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  // ── Tbilisi tiers ──
  {
    id: "tbilisi-center",
    region: "tbilisi",
    regionLabel: { ka: "თბილისი", en: "Tbilisi" },
    label: { ka: "თბილისი (ცენტრალური უბნები)", en: "Tbilisi (central districts)" },
    fee: 6,
  },
  {
    id: "tbilisi-outskirts",
    region: "tbilisi",
    regionLabel: { ka: "თბილისი", en: "Tbilisi" },
    label: {
      ka: "ლილო · ზაჰესი · ორხევი · ფონიჭალა · აეროპორტი · ქოშიგორა",
      en: "Lilo · Zahesi · Orkhevi · Ponichala · Airport · Khoshigora",
    },
    fee: 7,
  },
  {
    id: "tbilisi-villages",
    region: "tbilisi",
    regionLabel: { ka: "თბილისი", en: "Tbilisi" },
    label: {
      ka: "წყნეთი · შინდისი · ტაბახმელა · წავკისი · ოქროყანა",
      en: "Tskneti · Shindisi · Tabakhmela · Tsavkisi · Okroyana",
    },
    fee: 10,
  },

  // ── Rustavi ──
  {
    id: "rustavi",
    region: "rustavi",
    regionLabel: { ka: "რუსთავი", en: "Rustavi" },
    label: { ka: "რუსთავი", en: "Rustavi" },
    fee: 8,
  },

  // ── Imereti ──
  ...["ქუთაისი:Kutaisi", "ზესტაფონი:Zestaponi", "ბაღდათი:Baghdati", "თერჯოლა:Terjola",
      "საჩხერე:Sachkhere", "ჭიათურა:Chiatura", "სამტრედია:Samtredia", "ხონი:Khoni",
      "წყალტუბო:Tskaltubo"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `imereti-${en.toLowerCase()}`,
      region: "imereti",
      regionLabel: { ka: "იმერეთი", en: "Imereti" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Samegrelo ──
  ...["ზუგდიდი:Zugdidi", "ფოთი:Poti", "სენაკი:Senaki", "აბაშა:Abasha", "ხობი:Khobi",
      "მარტვილი:Martvili", "წალენჯიხა:Tsalenjikha", "ჩხოროწყუ:Chkhorotsku"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `samegrelo-${en.toLowerCase()}`,
      region: "samegrelo",
      regionLabel: { ka: "სამეგრელო", en: "Samegrelo" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Guria ──
  ...["ოზურგეთი:Ozurgeti", "ჩოხატაური:Chokhatauri", "ლანჩხუთი:Lanchkhuti",
      "ქობულეთი:Kobuleti"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `guria-${en.toLowerCase()}`,
      region: "guria",
      regionLabel: { ka: "გურია", en: "Guria" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Shida Kartli ──
  ...["გორი:Gori", "მცხეთა:Mtskheta", "კასპი:Kaspi", "ქარელი:Kareli",
      "ხაშური:Khashuri", "სურამი:Surami"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `shida-kartli-${en.toLowerCase()}`,
      region: "shida-kartli",
      regionLabel: { ka: "შიდა ქართლი", en: "Shida Kartli" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Samtskhe-Javakheti ──
  ...["ბორჯომი:Borjomi", "ახალციხე:Akhaltsikhe", "ბაკურიანი:Bakuriani",
      "ადიგენი:Adigeni", "აბასთუმანი:Abastumani", "ვალე:Vale"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `samtskhe-${en.toLowerCase()}`,
      region: "samtskhe-javakheti",
      regionLabel: { ka: "სამცხე-ჯავახეთი", en: "Samtskhe-Javakheti" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Kakheti ──
  ...["თელავი:Telavi", "გურჯაანი:Gurjaani", "სიღნაღი:Sighnaghi", "ყვარელი:Kvareli",
      "ლაგოდეხი:Lagodekhi", "საგარეჯო:Sagarejo", "ახმეტა:Akhmeta"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `kakheti-${en.toLowerCase()}`,
      region: "kakheti",
      regionLabel: { ka: "კახეთი", en: "Kakheti" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Adjara + Kvemo Kartli ──
  ...["ბათუმი:Batumi", "ხელვაჩაური:Khelvachauri", "მარნეული:Marneuli",
      "ბოლნისი:Bolnisi", "გარდაბანი:Gardabani", "თეთრიწყარო:Tetritskaro"].map<DeliveryZone>(pair => {
    const [ka, en] = pair.split(":");
    return {
      id: `adjara-kvemo-${en.toLowerCase()}`,
      region: "adjara-kvemo",
      regionLabel: { ka: "აჭარა · ქვემო ქართლი", en: "Adjara · Kvemo Kartli" },
      label: { ka, en },
      fee: 8,
    };
  }),

  // ── Catch-all ──
  {
    id: "other-town",
    region: "other",
    regionLabel: { ka: "სხვა", en: "Elsewhere in Georgia" },
    label: { ka: "სხვა დაბა (საქართველო)", en: "Other Georgian town" },
    fee: 10,
  },
  {
    id: "other-village",
    region: "other",
    regionLabel: { ka: "სხვა", en: "Elsewhere in Georgia" },
    label: { ka: "სხვა სოფელი (საქართველო)", en: "Other Georgian village" },
    fee: 12,
  },
];

export function findDeliveryZone(id: string | undefined | null): DeliveryZone | undefined {
  if (!id) return undefined;
  return DELIVERY_ZONES.find(z => z.id === id);
}

/** Stable order of region groups (for the optgroups in the dropdown). */
export const REGION_ORDER: DeliveryRegion[] = [
  "tbilisi",
  "rustavi",
  "shida-kartli",
  "kakheti",
  "imereti",
  "samegrelo",
  "guria",
  "samtskhe-javakheti",
  "adjara-kvemo",
  "other",
];

/** Sensible default — most orders are Tbilisi central. */
export const DEFAULT_ZONE_ID = "tbilisi-center";
export const DEFAULT_DELIVERY_FEE = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Stepped delivery selector — the user picks a top-level area, then either a
// sub-zone (Tbilisi) or a region + free-text place name + type (city/town/
// village). The fee is derived from those answers.

export type TopArea = "tbilisi" | "rustavi" | "region";
export type TbilisiSub = "center" | "outskirts" | "villages";
export type PlaceType = "city" | "town" | "village";

export const TBILISI_SUB_FEE: Record<TbilisiSub, number> = {
  center: 6,
  outskirts: 7,
  villages: 10,
};

export const PLACE_TYPE_FEE: Record<PlaceType, number> = {
  city: 8,
  town: 10,
  village: 12,
};

export const TBILISI_SUB_LABELS: Record<TbilisiSub, { ka: string; en: string; hint?: { ka: string; en: string } }> = {
  center: {
    ka: "თბილისი (ცენტრალური უბნები)",
    en: "Tbilisi (central districts)",
  },
  outskirts: {
    ka: "თბილისის გარეუბანი",
    en: "Tbilisi outskirts",
    hint: {
      ka: "ლილო · ზაჰესი · ორხევი · ფონიჭალა · აეროპორტი · ქოშიგორა",
      en: "Lilo · Zahesi · Orkhevi · Ponichala · Airport · Khoshigora",
    },
  },
  villages: {
    ka: "თბილისის სოფლები",
    en: "Tbilisi villages",
    hint: {
      ka: "წყნეთი · შინდისი · ტაბახმელა · წავკისი · ოქროყანა",
      en: "Tskneti · Shindisi · Tabakhmela · Tsavkisi · Okroyana",
    },
  },
};

export const REGION_OPTIONS: { id: Exclude<DeliveryRegion, "tbilisi" | "rustavi" | "other">; label: { ka: string; en: string }; hint: { ka: string; en: string } }[] = [
  { id: "shida-kartli",      label: { ka: "შიდა ქართლი",        en: "Shida Kartli" },        hint: { ka: "მცხეთა · გორი · კასპი · ქარელი · ხაშური · სურამი",                                              en: "Mtskheta · Gori · Kaspi · Kareli · Khashuri · Surami" } },
  { id: "kakheti",           label: { ka: "კახეთი",             en: "Kakheti" },             hint: { ka: "თელავი · გურჯაანი · სიღნაღი · ყვარელი · ლაგოდეხი · საგარეჯო · ახმეტა",                              en: "Telavi · Gurjaani · Sighnaghi · Kvareli · Lagodekhi · Sagarejo · Akhmeta" } },
  { id: "imereti",           label: { ka: "იმერეთი",            en: "Imereti" },             hint: { ka: "ქუთაისი · ზესტაფონი · ბაღდათი · თერჯოლა · საჩხერე · ჭიათურა · სამტრედია · ხონი · წყალტუბო",       en: "Kutaisi · Zestaponi · Baghdati · Terjola · Sachkhere · Chiatura · Samtredia · Khoni · Tskaltubo" } },
  { id: "samegrelo",         label: { ka: "სამეგრელო",          en: "Samegrelo" },           hint: { ka: "ზუგდიდი · ფოთი · სენაკი · აბაშა · ხობი · მარტვილი · წალენჯიხა · ჩხოროწყუ",                       en: "Zugdidi · Poti · Senaki · Abasha · Khobi · Martvili · Tsalenjikha · Chkhorotsku" } },
  { id: "guria",             label: { ka: "გურია",              en: "Guria" },               hint: { ka: "ოზურგეთი · ჩოხატაური · ლანჩხუთი · ქობულეთი",                                                      en: "Ozurgeti · Chokhatauri · Lanchkhuti · Kobuleti" } },
  { id: "samtskhe-javakheti",label: { ka: "სამცხე-ჯავახეთი",    en: "Samtskhe-Javakheti" },  hint: { ka: "ბორჯომი · ახალციხე · ბაკურიანი · ადიგენი · აბასთუმანი · ვალე",                                  en: "Borjomi · Akhaltsikhe · Bakuriani · Adigeni · Abastumani · Vale" } },
  { id: "adjara-kvemo",      label: { ka: "აჭარა · ქვემო ქართლი", en: "Adjara · Kvemo Kartli" }, hint: { ka: "ბათუმი · ხელვაჩაური · მარნეული · ბოლნისი · გარდაბანი · თეთრიწყარო",                              en: "Batumi · Khelvachauri · Marneuli · Bolnisi · Gardabani · Tetritskaro" } },
];

export interface ComputedDeliverySelection {
  fee: number;
  label: { ka: string; en: string };
}

export function computeDelivery(input: {
  area: TopArea;
  tbilisiSub?: TbilisiSub;
  regionId?: DeliveryRegion;
  placeName?: string;
  placeType?: PlaceType;
}): ComputedDeliverySelection {
  if (input.area === "tbilisi") {
    const sub = input.tbilisiSub || "center";
    const labels = TBILISI_SUB_LABELS[sub];
    return { fee: TBILISI_SUB_FEE[sub], label: { ka: labels.ka, en: labels.en } };
  }
  if (input.area === "rustavi") {
    return { fee: 8, label: { ka: "რუსთავი", en: "Rustavi" } };
  }
  // Region — fee comes from place type (city/town/village)
  const type = input.placeType || "city";
  const region = REGION_OPTIONS.find(r => r.id === input.regionId);
  const regionLabel = region?.label || { ka: "სხვა რეგიონი", en: "Other region" };
  const placeName = (input.placeName || "").trim();
  const typeLabelKa = type === "city" ? "ქალაქი" : type === "town" ? "დაბა" : "სოფელი";
  const typeLabelEn = type === "city" ? "city"   : type === "town" ? "town" : "village";
  return {
    fee: PLACE_TYPE_FEE[type],
    label: {
      ka: `${regionLabel.ka}${placeName ? ` — ${placeName}` : ""} (${typeLabelKa})`,
      en: `${regionLabel.en}${placeName ? ` — ${placeName}` : ""} (${typeLabelEn})`,
    },
  };
}
