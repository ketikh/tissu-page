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
