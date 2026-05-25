/**
 * Necklace builder — fetches fabric and charm options the admin manages.
 *
 * Public API endpoint (provided by tissu-agent):
 *   GET {ADMIN_API_URL}/api/storefront/necklace-options
 *   Header: X-API-Key: {STOREFRONT_API_KEY}
 *
 * Expected response shape (some fields are optional and the storefront
 * tolerates them missing while the agent rolls them out):
 *   {
 *     base_price?: number,                  // default 19 GEL
 *     fabrics: [{ id, name, image_url }],
 *     charms:  [{
 *       id, name, image_url,
 *       extra_price?: number,               // adds to base, shown as "+X ლ"
 *       variants?: [{ id, name, color? }],  // when one photo contains multiple sub-options
 *     }]
 *   }
 *
 * Pricing rules implemented on the storefront side:
 *   - Up to 3 charms total: base + Σ(charm.extra_price × qty)
 *   - Each charm slot beyond 3: extra +2 GEL surcharge on top of its extra_price
 */

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const STOREFRONT_API_KEY = process.env.STOREFRONT_API_KEY;

export const DEFAULT_BASE_PRICE = 19;
export const OVER_LIMIT_FEE = 2;
export const CHARM_LIMIT_BEFORE_FEE = 3;

export interface MaterialVariant {
  id: string;
  name: { ka: string; en: string };
  color?: string;
}

export interface Material {
  id: string;
  name: { ka: string; en: string };
  image: string;
  color?: string;
  extra_price?: number;          // GEL — added on top of the base price per piece
  variants?: MaterialVariant[];  // when populated, the user must pick one
}

const FALLBACK_FABRICS: Material[] = [
  { id: "rose",      name: { ka: "ვარდისფერი",  en: "Rose" },      image: "", color: "#c4849a" },
  { id: "mustard",   name: { ka: "მდოგვისფერი", en: "Mustard" },   image: "", color: "#f3b62b" },
  { id: "forest",    name: { ka: "მწვანე",      en: "Forest" },    image: "", color: "#3f6f56" },
  { id: "champagne", name: { ka: "შამპანი",     en: "Champagne" }, image: "", color: "#c9a86c" },
  { id: "indigo",    name: { ka: "ცისფერი",     en: "Indigo" },    image: "", color: "#6b9eb5" },
  { id: "lilac",     name: { ka: "იასამანი",    en: "Lilac" },     image: "", color: "#9e8abf" },
];

const FALLBACK_CHARMS: Material[] = [
  { id: "shell", name: { ka: "ნიჟარა",    en: "Shell" },     image: "" },
  { id: "pearl", name: { ka: "მარგალიტი", en: "Pearl" },     image: "" },
  { id: "wood",  name: { ka: "ხის მძივი", en: "Wood bead" }, image: "" },
  { id: "brass", name: { ka: "ბრინჯაო",   en: "Brass" },     image: "", extra_price: 2 },
];

interface ApiVariant {
  id?: string | number;
  name?: string;
  color?: string;
}

interface ApiItem {
  id: number | string;
  name?: string;
  image_url?: string;
  color?: string;
  extra_price?: number;
  variants?: ApiVariant[];
}

interface ApiResponse {
  base_price?: number;
  fabrics?: ApiItem[];
  charms?: ApiItem[];
}

function toMaterial(item: ApiItem): Material {
  const name = (item.name || "").trim();
  const variants: MaterialVariant[] | undefined = Array.isArray(item.variants) && item.variants.length > 0
    ? item.variants
        .map((v, i) => {
          const vName = (v.name || "").trim();
          if (!vName) return null;
          return {
            id: String(v.id ?? i),
            name: { ka: vName, en: vName },
            color: v.color,
          } as MaterialVariant;
        })
        .filter((v): v is MaterialVariant => v !== null)
    : undefined;

  return {
    id: String(item.id),
    name: { ka: name, en: name },
    image: (item.image_url || "").trim(),
    color: item.color,
    extra_price: typeof item.extra_price === "number" && item.extra_price > 0 ? item.extra_price : undefined,
    variants: variants && variants.length > 0 ? variants : undefined,
  };
}

export interface NecklaceMaterials {
  basePrice: number;
  fabrics: Material[];
  charms: Material[];
}

export async function fetchNecklaceMaterials(): Promise<NecklaceMaterials> {
  if (!ADMIN_API_URL || !STOREFRONT_API_KEY) {
    console.warn("[necklace-builder] ADMIN_API_URL or STOREFRONT_API_KEY missing — using fallback materials.");
    return { basePrice: DEFAULT_BASE_PRICE, fabrics: FALLBACK_FABRICS, charms: FALLBACK_CHARMS };
  }
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/storefront/necklace-options`, {
      headers: {
        "X-API-Key": STOREFRONT_API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      console.warn(`[necklace-builder] agent returned ${res.status}; using fallback materials.`);
      return { basePrice: DEFAULT_BASE_PRICE, fabrics: FALLBACK_FABRICS, charms: FALLBACK_CHARMS };
    }
    const data = (await res.json()) as ApiResponse;
    const basePrice = typeof data.base_price === "number" && data.base_price > 0 ? data.base_price : DEFAULT_BASE_PRICE;
    const fabrics = Array.isArray(data.fabrics) ? data.fabrics.map(toMaterial).filter(m => m.name.ka || m.image) : [];
    const charms  = Array.isArray(data.charms)  ? data.charms.map(toMaterial).filter(m => m.name.ka || m.image)  : [];
    return {
      basePrice,
      fabrics: fabrics.length > 0 ? fabrics : FALLBACK_FABRICS,
      charms:  charms.length  > 0 ? charms  : FALLBACK_CHARMS,
    };
  } catch (err) {
    console.error("[necklace-builder] fetch failed:", err);
    return { basePrice: DEFAULT_BASE_PRICE, fabrics: FALLBACK_FABRICS, charms: FALLBACK_CHARMS };
  }
}
