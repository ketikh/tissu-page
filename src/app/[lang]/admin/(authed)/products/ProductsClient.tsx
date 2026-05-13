"use client";

import { useMemo, useState } from "react";
import { Locale } from "@/i18n/config";
import type { StorefrontProduct, StorefrontCategory } from "@/lib/admin-api";
import { Loader2, Search, Save, ExternalLink } from "lucide-react";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  ink: "#2a1d14",
  softCream: "#f9f4eb",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

const CATEGORIES: { id: StorefrontCategory | "all"; ka: string; en: string }[] = [
  { id: "all",          ka: "ყველა",          en: "All" },
  { id: "pouch",        ka: "ჩანთები",        en: "Pouches" },
  { id: "laptop",       ka: "ლეპტოპის ქერქი", en: "Laptop sleeves" },
  { id: "tote",         ka: "თოუთი",          en: "Totes" },
  { id: "kidsbackpack", ka: "ბავშვის ჩანთა",  en: "Kids' backpacks" },
  { id: "apron",        ka: "ფარტუხები",      en: "Aprons" },
  { id: "necklace",     ka: "ყელსაბამები",    en: "Necklaces" },
];

export default function ProductsClient({
  lang,
  initialProducts,
}: {
  lang: Locale;
  initialProducts: StorefrontProduct[];
}) {
  const isKa = lang === "ka";
  const [products, setProducts] = useState<StorefrontProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StorefrontCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });
  }, [products, search, category]);

  function colorFromTags(tags: string[]): string {
    for (const raw of tags || []) {
      const t = raw.trim();
      if (/^#[0-9a-f]{3,8}$/i.test(t)) return t;
    }
    return "";
  }

  async function patchProduct(id: string, patch: Record<string, unknown>) {
    setSavingId(id);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || d?.detail || "Save failed");
      }
      const data = await res.json();
      // Optimistic merge — replace local row with whatever the upstream returned.
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data, ...patch } : p));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleStock(p: StorefrontProduct) {
    await patchProduct(p.id, { in_stock: !p.in_stock });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>
          Products
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "6px 0 0" }}>
          ცვლილებები ბაზაში დაუყოვნებლივ ინახება. ფერი იცვლება admin tag-ის გავლით (`#hex`).
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.ink, opacity: 0.45 }} />
          <input
            type="text"
            placeholder={isKa ? "ძიება სახელით, კოდით ან ფერით" : "Search by name, code or color"}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              fontFamily: SANS, fontSize: 14, color: C.ink,
              width: "100%", height: 40, padding: "0 14px 0 34px",
              background: "white",
              border: `1.5px solid rgba(42,29,20,0.14)`,
              borderRadius: 12,
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                  padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                  background: active ? C.burnt : "white",
                  color: active ? "white" : C.ink,
                  border: `1.5px solid ${active ? C.burnt : "rgba(42,29,20,0.12)"}`,
                  transition: "background 0.18s ease, color 0.18s ease",
                }}
              >
                {isKa ? cat.ka : cat.en}
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.rose, background: `${C.rose}14`, border: `1px solid ${C.rose}33`, padding: "10px 12px", borderRadius: 10, margin: 0 }}>
          {errorMessage}
        </p>
      )}

      {/* Product table */}
      {filtered.length === 0 ? (
        <div style={{ background: "white", border: `1px solid rgba(42,29,20,0.10)`, borderRadius: 18, padding: 36, textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.55, margin: 0 }}>
            ამ ფილტრით პროდუქტი არ მოიძებნა.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(p => {
            const isOpen = openId === p.id;
            const tagColor = colorFromTags(p.tags || []);
            return (
              <div key={p.id} style={{
                background: "white",
                border: `1px solid rgba(42,29,20,0.10)`,
                borderRadius: 14,
                overflow: "hidden",
              }}>
                <button
                  onClick={() => setOpenId(isOpen ? null : p.id)}
                  style={{
                    width: "100%", background: "transparent", border: "none", cursor: "pointer",
                    padding: "12px 16px",
                    textAlign: "left",
                  }}
                  className="hover:bg-[rgba(42,29,20,0.02)]"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {p.image_front && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_front} alt={p.name} style={{ width: 48, height: 56, objectFit: "cover", borderRadius: 10, background: C.softCream, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink, lineHeight: 1.2 }}>
                        {p.name || p.code}
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55, marginTop: 2 }}>
                        {p.code} · {p.category} · {p.price} ₾ · {p.stock} {isKa ? "ცალი" : "in stock"}
                      </div>
                    </div>
                    {tagColor && (
                      <span title={tagColor} style={{ width: 22, height: 22, borderRadius: 6, background: tagColor, border: "1.5px solid rgba(42,29,20,0.18)" }} />
                    )}
                    <span style={{
                      fontFamily: SANS, fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: p.in_stock ? C.green : C.rose,
                      background: p.in_stock ? `${C.green}14` : `${C.rose}14`,
                      padding: "4px 10px", borderRadius: 999,
                    }}>
                      {p.in_stock ? (isKa ? "ხელმისაწვდომი" : "Available") : (isKa ? "ამოწურულია" : "Out of stock")}
                    </span>
                  </div>
                </button>

                {isOpen && <ProductEditor product={p} isKa={isKa} lang={lang} saving={savingId === p.id} onSave={(patch) => patchProduct(p.id, patch)} onToggleStock={() => toggleStock(p)} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductEditor({
  product,
  isKa,
  lang,
  saving,
  onSave,
  onToggleStock,
}: {
  product: StorefrontProduct;
  isKa: boolean;
  lang: Locale;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onToggleStock: () => void;
}) {
  const initialTagColor = (() => {
    for (const t of product.tags || []) if (/^#[0-9a-f]{3,8}$/i.test(t.trim())) return t.trim();
    return "";
  })();

  const [color, setColor] = useState(initialTagColor);
  const [stock, setStock] = useState<string>(String(product.stock));
  const [price, setPrice] = useState<string>(String(product.price));

  const hasColor = !!color;
  const dirty = (
    color !== initialTagColor ||
    Number(stock) !== product.stock ||
    Number(price) !== product.price
  );

  const handleSave = () => {
    const patch: Record<string, unknown> = {};
    if (Number(stock) !== product.stock)        patch.stock = Number(stock);
    if (Number(price) !== product.price)        patch.price = Number(price);
    if (color !== initialTagColor) {
      // Replace the colour-like tag (#hex) and leave the rest intact.
      const newTags = (product.tags || []).filter(t => !/^#[0-9a-f]{3,8}$/i.test(t.trim()));
      if (color) newTags.push(color);
      patch.tags = newTags;
    }
    onSave(patch);
  };

  return (
    <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14, borderTop: "1px dashed rgba(42,29,20,0.14)" }}>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3" style={{ marginTop: 14 }}>
        <Field label={isKa ? "მარაგი (ცალი)" : "Stock"}>
          <input type="number" min={0} value={stock} onChange={e => setStock(e.target.value)} style={inputStyle} />
        </Field>
        <Field label={isKa ? "ფასი (₾)" : "Price (GEL)"}>
          <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
        </Field>
        <Field label={isKa ? "ფერი (hex)" : "Color tag (hex)"}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="text"
              placeholder="#b80404"
              value={color}
              onChange={e => setColor(e.target.value.trim())}
              style={{ ...inputStyle, flex: 1, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
            />
            <input
              type="color"
              value={hasColor && /^#[0-9a-f]{6,8}$/i.test(color) ? color.slice(0, 7) : "#d56826"}
              onChange={e => setColor(e.target.value)}
              style={{ width: 40, height: 40, padding: 0, border: "none", borderRadius: 10, cursor: "pointer", background: "transparent" }}
            />
          </div>
        </Field>
        <Field label={isKa ? "სტატუსი" : "Status"}>
          <button
            type="button"
            onClick={onToggleStock}
            disabled={saving}
            style={{
              height: 40, padding: "0 14px",
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
              borderRadius: 12, cursor: "pointer",
              background: product.in_stock ? `${C.rose}14` : `${C.green}14`,
              color: product.in_stock ? C.rose : C.green,
              border: `1.5px solid ${product.in_stock ? C.rose : C.green}`,
              transition: "background 0.18s ease",
            }}
          >
            {product.in_stock ? (isKa ? "ამოწურულად მონიშვნა" : "Mark out of stock") : (isKa ? "ხელახლა გამოაჩინე" : "Mark available")}
          </button>
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
        <a
          href={`/${lang}/product/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
            color: C.ink, opacity: 0.7,
            display: "inline-flex", alignItems: "center", gap: 4,
            textDecoration: "none",
          }}
          className="hover:opacity-100"
        >
          {isKa ? "გვერდი" : "Live page"} <ExternalLink size={14} />
        </a>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          style={{
            fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
            color: dirty ? "white" : C.ink,
            background: dirty ? C.burnt : "rgba(42,29,20,0.06)",
            opacity: !dirty || saving ? 0.7 : 1,
            padding: "10px 18px", borderRadius: 12, border: "none",
            cursor: !dirty || saving ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "background 0.18s ease",
          }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isKa ? "შენახვა" : "Save"}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14, color: C.ink,
  width: "100%", height: 40, padding: "0 14px",
  background: "white",
  border: `1.5px solid rgba(42,29,20,0.14)`,
  borderRadius: 12,
  outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink, opacity: 0.55 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
