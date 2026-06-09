"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, ShoppingBag, Minus, Plus, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Material, MaterialVariant } from "@/lib/necklace-builder";
import { OVER_LIMIT_FEE, CHARM_LIMIT_BEFORE_FEE } from "@/lib/necklace-builder";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  bg: "#1e4d43",
  cream: "#fef0d6",
  champagne: "#c9a86c",
  champagneDeep: "#a0804a",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  rose: "#c4849a",
  ink: "#2a1d14",
};

type Step = 1 | 2 | 3;

interface Props {
  lang: Locale;
  fabrics: Material[];
  charms: Material[];
  basePrice: number;
}

// One pick the customer has made. A charm without variants ⇒ no `variantId`.
// Each row carries its own quantity so the customer can pick e.g. 2× red
// hearts and 1× black heart from the same charm photo.
interface CharmRow {
  rowId: string;
  charmId: string;
  variantId?: string;
  qty: number;
}

function makeRowId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function NecklaceBuilderClient({ lang, fabrics, charms, basePrice }: Props) {
  const isKa = lang === "ka";
  const [step, setStep] = useState<Step>(1);

  // Single-select fabric, list-of-rows for charms.
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [charmRows, setCharmRows] = useState<CharmRow[]>([]);
  // Which variant-charm has its picker panel expanded (null = none open).
  const [expandedCharmId, setExpandedCharmId] = useState<string | null>(null);

  const fabric = fabrics.find(f => f.id === fabricId) || null;
  const totalQty = charmRows.reduce((s, r) => s + r.qty, 0);

  const canStep2 = Boolean(fabric);
  const canStep3 = Boolean(fabric && totalQty > 0);

  // Live total: base + Σ(charm.extra_price × qty) + 2 GEL × every charm slot beyond 3.
  const charmsExtra = charmRows.reduce((sum, r) => {
    const c = charms.find(x => x.id === r.charmId);
    return sum + ((c?.extra_price ?? 0) * r.qty);
  }, 0);
  const overLimitCount = Math.max(0, totalQty - CHARM_LIMIT_BEFORE_FEE);
  const overLimitSurcharge = overLimitCount * OVER_LIMIT_FEE;
  const totalPrice = basePrice + charmsExtra + overLimitSurcharge;

  const addItem  = useCartStore(s => s.addItem);
  const openCart = useUIStore(s => s.openCart);

  function toggleFabric(id: string) {
    setFabricId(prev => (prev === id ? null : id));
  }

  function isCharmSelected(charmId: string): boolean {
    return charmRows.some(r => r.charmId === charmId);
  }

  function onCharmClick(charm: Material) {
    // If this charm has variants, open the inline picker; second click on the
    // same charm collapses it (acts as a cancel).
    if (charm.variants && charm.variants.length > 0) {
      setExpandedCharmId(prev => prev === charm.id ? null : charm.id);
      return;
    }
    // No variants — toggle a row with this charm.
    const existing = charmRows.find(r => r.charmId === charm.id && !r.variantId);
    if (existing) {
      setCharmRows(rows => rows.filter(r => r.rowId !== existing.rowId));
    } else {
      setCharmRows(rows => [...rows, { rowId: makeRowId(), charmId: charm.id, qty: 1 }]);
    }
  }

  function addRowFromPanel(charm: Material, variantId: string, qty: number) {
    // If a row with the same charm+variant already exists, bump its qty.
    setCharmRows(rows => {
      const existing = rows.find(r => r.charmId === charm.id && r.variantId === variantId);
      if (existing) {
        return rows.map(r => r.rowId === existing.rowId ? { ...r, qty: r.qty + qty } : r);
      }
      return [...rows, { rowId: makeRowId(), charmId: charm.id, variantId, qty }];
    });
    setExpandedCharmId(null);
  }

  function bumpRowQty(rowId: string, delta: number) {
    setCharmRows(rows =>
      rows
        .map(r => r.rowId === rowId ? { ...r, qty: r.qty + delta } : r)
        .filter(r => r.qty > 0)
    );
  }

  function removeRow(rowId: string) {
    setCharmRows(rows => rows.filter(r => r.rowId !== rowId));
  }

  function describeRow(row: CharmRow): { ka: string; en: string; image: string } {
    const c = charms.find(x => x.id === row.charmId);
    if (!c) return { ka: "", en: "", image: "" };
    const v = row.variantId ? c.variants?.find(v => v.id === row.variantId) : undefined;
    const namePart = v ? `${c.name.ka} — ${v.name.ka}` : c.name.ka;
    const namePartEn = v ? `${c.name.en} — ${v.name.en}` : c.name.en;
    return { ka: namePart, en: namePartEn, image: c.image };
  }

  function onAddToCart() {
    if (!fabric || charmRows.length === 0) return;

    const partsKa = charmRows.map(r => {
      const { ka } = describeRow(r);
      return `${ka} × ${r.qty}`;
    });
    const partsEn = charmRows.map(r => {
      const { en } = describeRow(r);
      return `${en} × ${r.qty}`;
    });
    const charmLabelKa = partsKa.join(", ");
    const charmLabelEn = partsEn.join(", ");

    // Charm thumbnails carried onto the cart item so the customer sees the
    // exact charms they picked (with photos), not just a text list.
    const customCharms = charmRows.map(r => {
      const d = describeRow(r);
      return { image: d.image, name: { ka: d.ka, en: d.en }, qty: r.qty };
    }).filter(ch => ch.image);

    // Stable variant id from current selection so identical builds merge in the cart.
    const variantKey = charmRows
      .map(r => `${r.charmId}:${r.variantId ?? ""}:${r.qty}`)
      .sort()
      .join("|");
    const variantId = `custom-${fabric.id}-${variantKey}`;
    const productId = "custom-necklace";

    addItem(
      {
        id: productId,
        slug: productId,
        name: {
          ka: "ააწყვე შენი ყელსაბამი",
          en: "Build your necklace",
        },
        subtitle: {
          ka: `ქსოვილი: ${fabric.name.ka}\nჩარმი: ${charmLabelKa}`,
          en: `Fabric: ${fabric.name.en}\nCharm: ${charmLabelEn}`,
        },
        description: { ka: "", en: "" },
        materials: [],
        careInstructions: [],
        reviews: [],
        price: totalPrice,
        images: [fabric.image || charms.find(c => c.id === charmRows[0].charmId)?.image || ""].filter(Boolean),
        category: "accessories",
        variants: [],
        badges: [],
        tags: [],
        featured: false,
        customCharms,
      } as any,
      {
        id: variantId,
        size: "one",
        color: {
          ka: `ქსოვილი: ${fabric.name.ka}\nჩარმი: ${charmLabelKa}`,
          en: `Fabric: ${fabric.name.en}\nCharm: ${charmLabelEn}`,
        },
        colorCode: C.mustard,
        inStock: true,
        price: totalPrice,
      } as any,
      1,
    );
    openCart();
  }

  return (
    <div style={{ background: C.bg, color: C.cream, minHeight: "100vh", position: "relative" }}>
      <div className="container max-w-3xl" style={{ position: "relative", paddingTop: 56, paddingBottom: 80, paddingLeft: 16, paddingRight: 16 }}>
        <Star top={40}  left="5%"  size={18} />
        <Star top={80}  right="6%" size={14} color={C.rose} />
        <Star top={260} left="3%"  size={12} color={C.mustard} />
        <Star top={310} right="4%" size={16} />

        {/* Title block */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{
            fontFamily: FRAUNCES, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: C.champagne,
          }}>
            {isKa ? "ააწყვე შენი გემოვნებით" : "Build it your way"}
          </span>
          <h1 style={{
            fontFamily: isKa ? ALK_LIFE : PACIFICO,
            fontWeight: isKa ? 700 : 400,
            fontSize: "clamp(34px, 5.5vw, 64px)",
            color: C.cream,
            marginTop: 12,
            lineHeight: 1.05,
          }}>
            {isKa ? "შენი შექმნილი ყელსაბამი" : "Your own necklace"}
          </h1>
          <p style={{
            fontFamily: FRAUNCES, fontStyle: "italic",
            fontSize: 15, color: C.champagne,
            maxWidth: 520, margin: "14px auto 0", lineHeight: 1.55,
          }}>
            {isKa
              ? "სამი ნაბიჯი: აირჩიე ერთი ქსოვილი, შემდეგ ერთი ან რამდენიმე ჩარმი, შემდეგ დაამატე კალათში."
              : "Three steps: pick one fabric, then one or more charms, then add to your cart."}
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 30 }}>
          {([1, 2, 3] as Step[]).map((n) => {
            const active = step === n;
            const done = step > n;
            const clickable = n === 1 || (n === 2 && canStep2) || (n === 3 && canStep3);
            return (
              <div
                key={n}
                onClick={() => clickable && setStep(n)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: active ? C.mustard : done ? "rgba(254,240,214,0.18)" : "rgba(254,240,214,0.08)",
                  color: active ? C.ink : C.cream,
                  border: `1.5px solid ${active ? C.mustardDeep : "rgba(201,168,108,0.4)"}`,
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
                  cursor: clickable ? "pointer" : "default",
                  transition: "background 0.2s",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: active ? C.ink : done ? C.mustard : "transparent",
                  color: active ? C.mustard : done ? C.ink : C.champagne,
                  border: done || active ? "none" : `1.5px solid ${C.champagne}`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800,
                }}>
                  {done ? <Check size={12} /> : n}
                </span>
                <span>
                  {n === 1 ? (isKa ? "ქსოვილი" : "Fabric")
                  : n === 2 ? (isKa ? "ჩარმები" : "Charms")
                  :           (isKa ? "შეჯამება" : "Review")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div style={{ marginTop: 40, position: "relative", zIndex: 1 }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" {...fade}>
                <MaterialGrid
                  items={fabrics}
                  isSelected={(id) => fabricId === id}
                  onToggle={toggleFabric}
                  isKa={isKa}
                  emptyText={isKa ? "ქსოვილების ვარიანტები ჯერ არ არის დამატებული." : "No fabric options yet."}
                />
                <NavRow onNext={() => canStep2 && setStep(2)} canNext={canStep2} isKa={isKa} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...fade}>
                <Hint isKa={isKa}>
                  {isKa
                    ? "აირჩიე 3 ცალი ჩარმი. სადაც ფოტოში რამდენიმე ფერია, აარჩიე კონკრეტული. გინდა — დაამატე მე-4 და მეტი ცალი, ფასი თვითონ დაანგარიშდება."
                    : "Pick 3 charms. When a photo has multiple colours, choose one. If you'd like a 4th or more, add them — the price updates automatically."}
                </Hint>

                <CharmGrid
                  charms={charms}
                  rows={charmRows}
                  expandedCharmId={expandedCharmId}
                  isKa={isKa}
                  onClick={onCharmClick}
                  onAddRow={addRowFromPanel}
                  onCancelExpand={() => setExpandedCharmId(null)}
                  emptyText={isKa ? "ჩარმების ვარიანტები ჯერ არ არის დამატებული." : "No charm options yet."}
                />

                {charmRows.length > 0 && (
                  <SelectionList
                    charms={charms}
                    rows={charmRows}
                    isKa={isKa}
                    onBump={bumpRowQty}
                    onRemove={removeRow}
                  />
                )}

                <NavRow
                  onBack={() => setStep(1)}
                  onNext={() => canStep3 && setStep(3)}
                  canNext={canStep3}
                  isKa={isKa}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...fade}>
                <FabricSummary fabric={fabric} isKa={isKa} />

                <SelectionList
                  charms={charms}
                  rows={charmRows}
                  isKa={isKa}
                  onBump={bumpRowQty}
                  onRemove={removeRow}
                />

                {/* Live price breakdown */}
                <div style={{
                  marginTop: 24, padding: 20,
                  background: "rgba(254,240,214,0.06)",
                  border: `1px solid ${C.champagne}`,
                  borderRadius: 18,
                  fontFamily: FRAUNCES, color: C.cream,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <PriceRow
                    label={isKa ? "საბაზო ფასი" : "Base price"}
                    value={`${basePrice} ლ`}
                  />
                  {charmRows.filter(r => {
                    const c = charms.find(x => x.id === r.charmId);
                    return c?.extra_price;
                  }).map(r => {
                    const c = charms.find(x => x.id === r.charmId)!;
                    return (
                      <PriceRow
                        key={r.rowId}
                        label={`+ ${isKa ? c.name.ka : c.name.en} × ${r.qty}`}
                        value={`+${(c.extra_price ?? 0) * r.qty} ლ`}
                        muted
                      />
                    );
                  })}
                  {overLimitCount > 0 && (
                    <PriceRow
                      label={isKa
                        ? `+ დამატებითი ჩარმი × ${overLimitCount} (3-ის ზევით)`
                        : `+ Extra charm × ${overLimitCount} (over 3)`}
                      value={`+${overLimitSurcharge} ლ`}
                      muted
                    />
                  )}
                  <div style={{ height: 1, background: "rgba(201,168,108,0.3)", margin: "6px 0" }} />
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                    fontWeight: 800, fontSize: 18,
                  }}>
                    <span>{isKa ? "ჯამი" : "Total"}</span>
                    <span style={{ color: C.mustard }}>{totalPrice} ლ</span>
                  </div>
                </div>

                <div
                  style={{
                    position: "sticky",
                    bottom: 16,
                    zIndex: 5,
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    padding: "12px 14px",
                    borderRadius: 999,
                    background: "rgba(20, 54, 47, 0.92)",
                    WebkitBackdropFilter: "blur(8px)",
                    backdropFilter: "blur(8px)",
                    border: `1.5px solid rgba(201,168,108,0.35)`,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                  }}
                >
                  <button type="button" onClick={() => setStep(2)} style={navButtonStyle("ghost")}>
                    <ArrowLeft size={14} />
                    {isKa ? "უკან" : "Back"}
                  </button>

                  <button type="button" onClick={onAddToCart} style={navButtonStyle("primary")}>
                    <ShoppingBag size={14} />
                    {isKa ? "კალათში დამატება" : "Add to cart"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom stripe — sits between the section and the footer */}
      <div
        style={{ height: 8, background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.215, 0.61, 0.355, 1] as const },
};

function Hint({ children, isKa: _isKa }: { children: React.ReactNode; isKa: boolean }) {
  return (
    <p style={{
      fontFamily: FRAUNCES, fontStyle: "italic",
      textAlign: "center", color: C.champagne,
      fontSize: 13, marginBottom: 18,
    }}>
      {children}
    </p>
  );
}

function MaterialGrid({
  items,
  isSelected,
  onToggle,
  isKa,
  emptyText,
}: {
  items: Material[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  isKa: boolean;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p style={{
        fontFamily: FRAUNCES, fontStyle: "italic",
        textAlign: "center", color: C.champagne,
        padding: "40px 20px",
      }}>
        {emptyText}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((m) => {
        const active = isSelected(m.id);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onToggle(m.id)}
            style={{
              position: "relative",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <div style={{
              aspectRatio: "1 / 1",
              borderRadius: 22,
              overflow: "hidden",
              background: m.color || "rgba(254,240,214,0.10)",
              border: `3px solid ${active ? C.mustard : "rgba(201,168,108,0.35)"}`,
              boxShadow: active ? `0 10px 0 ${C.mustardDeep}` : "0 6px 0 rgba(0,0,0,0.25)",
              transform: active ? "translateY(-4px)" : "translateY(0)",
              transition: "all 0.25s ease",
              position: "relative",
            }}>
              {m.image && /^https?:\/\//i.test(m.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.image}
                  alt={isKa ? m.name.ka : m.name.en}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%" }} aria-hidden="true" />
              )}

              {active && (
                <span style={{
                  position: "absolute", top: 10, left: 10,
                  width: 28, height: 28, borderRadius: "50%",
                  background: C.mustard, color: C.ink,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 3px 0 ${C.mustardDeep}`,
                  zIndex: 2,
                }}>
                  <Check size={14} />
                </span>
              )}

              {/* Extra-price badge — only shown if this material costs more. */}
              {m.extra_price && m.extra_price > 0 && (
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  background: C.mustard, color: C.ink,
                  fontFamily: FRAUNCES, fontWeight: 800, fontSize: 12,
                  padding: "4px 10px", borderRadius: 999,
                  boxShadow: `0 3px 0 ${C.mustardDeep}`,
                  zIndex: 2,
                }}>
                  +{m.extra_price} ლ
                </span>
              )}
            </div>
            <div style={{
              fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14,
              color: C.cream, marginTop: 10,
            }}>
              {isKa ? m.name.ka : m.name.en}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function NavRow({
  onBack,
  onNext,
  canNext,
  isKa,
}: {
  onBack?: () => void;
  onNext: () => void;
  canNext: boolean;
  isKa: boolean;
}) {
  return (
    // Sticky so the Next/Back buttons follow the scroll on long lists. The
    // backdrop blur + tinted background blend cleanly with the deep-teal page
    // colour so it doesn't look like a separate floating bar.
    <div
      style={{
        position: "sticky",
        bottom: 16,
        marginTop: 30,
        zIndex: 5,
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        padding: "12px 14px",
        borderRadius: 999,
        background: "rgba(20, 54, 47, 0.92)",
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
        border: `1.5px solid rgba(201,168,108,0.35)`,
        boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
      }}
    >
      {onBack ? (
        <button type="button" onClick={onBack} style={navButtonStyle("ghost")}>
          <ArrowLeft size={14} /> {isKa ? "უკან" : "Back"}
        </button>
      ) : <span />}

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        style={{
          ...navButtonStyle("primary"),
          opacity: canNext ? 1 : 0.5,
          cursor: canNext ? "pointer" : "not-allowed",
        }}
      >
        {isKa ? "შემდეგი" : "Next"} <ArrowRight size={14} />
      </button>
    </div>
  );
}

function FabricSummary({ fabric, isKa }: { fabric: Material | null; isKa: boolean }) {
  return (
    <div style={{
      background: "rgba(254,240,214,0.08)",
      border: `1.5px solid ${C.champagne}`,
      borderRadius: 22,
      padding: 22,
      textAlign: "center",
    }}>
      <SwatchTile material={fabric} label={isKa ? "ქსოვილი" : "Fabric"} isKa={isKa} />
    </div>
  );
}

/** Editable list of the customer's current picks — used in step 2 (under the
 *  grid) and step 3 (as the main summary). Each row has +/- qty and a × delete. */
function SelectionList({
  charms,
  rows,
  isKa,
  onBump,
  onRemove,
}: {
  charms: Material[];
  rows: { rowId: string; charmId: string; variantId?: string; qty: number }[];
  isKa: boolean;
  onBump: (rowId: string, delta: number) => void;
  onRemove: (rowId: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div style={{
      marginTop: 22,
      background: "rgba(254,240,214,0.06)",
      border: `1px solid ${C.champagne}`,
      borderRadius: 18,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{
        fontFamily: FRAUNCES, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase", color: C.champagne,
        marginBottom: 4, paddingLeft: 6,
      }}>
        {isKa ? "შენი არჩევანი" : "Your selection"}
      </div>
      {rows.map(r => {
        const c = charms.find(x => x.id === r.charmId);
        if (!c) return null;
        const variant: MaterialVariant | undefined = r.variantId ? c.variants?.find(v => v.id === r.variantId) : undefined;
        return (
          <div key={r.rowId} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "8px 10px",
            background: "rgba(254,240,214,0.06)",
            borderRadius: 12,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, overflow: "hidden",
              background: variant?.color || c.color || "rgba(254,240,214,0.10)",
              border: `1px solid ${C.champagne}`,
              flexShrink: 0,
            }}>
              {c.image && /^https?:\/\//i.test(c.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.cream }}>
                {isKa ? c.name.ka : c.name.en}
              </div>
              {variant && (
                <div style={{
                  fontFamily: FRAUNCES, fontSize: 12, color: C.champagne,
                  display: "inline-flex", alignItems: "center", gap: 6, marginTop: 2,
                }}>
                  {variant.color && (
                    <span aria-hidden="true" style={{
                      width: 10, height: 10, borderRadius: "50%", background: variant.color,
                      border: "1px solid rgba(254,240,214,0.4)",
                    }} />
                  )}
                  {isKa ? variant.name.ka : variant.name.en}
                </div>
              )}
            </div>

            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(254,240,214,0.10)",
              borderRadius: 999,
              padding: 2,
            }}>
              <IconBtn aria-label="−" onClick={() => onBump(r.rowId, -1)}>
                <Minus size={14} />
              </IconBtn>
              <span style={{
                minWidth: 22, textAlign: "center",
                fontFamily: FRAUNCES, fontWeight: 800, fontSize: 13, color: C.cream,
              }}>
                {r.qty}
              </span>
              <IconBtn aria-label="+" onClick={() => onBump(r.rowId, +1)}>
                <Plus size={14} />
              </IconBtn>
            </div>

            <IconBtn aria-label="remove" onClick={() => onRemove(r.rowId)}>
              <X size={14} />
            </IconBtn>
          </div>
        );
      })}
    </div>
  );
}

function IconBtn({ children, onClick, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "transparent", color: C.cream,
        border: "none", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

/** The new charm picker grid: same look as MaterialGrid, but knows about
 *  variants and quantity. Tapping a charm with `variants` opens a panel below
 *  the grid with a radio + qty stepper; tapping a plain charm toggles a row. */
function CharmGrid({
  charms,
  rows,
  expandedCharmId,
  isKa,
  onClick,
  onAddRow,
  onCancelExpand,
  emptyText,
}: {
  charms: Material[];
  rows: { charmId: string; variantId?: string; qty: number }[];
  expandedCharmId: string | null;
  isKa: boolean;
  onClick: (charm: Material) => void;
  onAddRow: (charm: Material, variantId: string, qty: number) => void;
  onCancelExpand: () => void;
  emptyText: string;
}) {
  if (charms.length === 0) {
    return (
      <p style={{
        fontFamily: FRAUNCES, fontStyle: "italic",
        textAlign: "center", color: C.champagne,
        padding: "40px 20px",
      }}>
        {emptyText}
      </p>
    );
  }

  const expandedCharm = expandedCharmId ? charms.find(c => c.id === expandedCharmId) : null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {charms.map((c) => {
          const isSelected = rows.some(r => r.charmId === c.id);
          const isExpanded = expandedCharmId === c.id;
          const hasVariants = Boolean(c.variants && c.variants.length > 0);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onClick(c)}
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{
                aspectRatio: "1 / 1",
                borderRadius: 22,
                overflow: "hidden",
                background: c.color || "rgba(254,240,214,0.10)",
                border: `3px solid ${isSelected || isExpanded ? C.mustard : "rgba(201,168,108,0.35)"}`,
                boxShadow: isSelected || isExpanded ? `0 10px 0 ${C.mustardDeep}` : "0 6px 0 rgba(0,0,0,0.25)",
                transform: isSelected || isExpanded ? "translateY(-4px)" : "translateY(0)",
                transition: "all 0.25s ease",
                position: "relative",
              }}>
                {c.image && /^https?:\/\//i.test(c.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={isKa ? c.name.ka : c.name.en}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%" }} aria-hidden="true" />
                )}

                {isSelected && (
                  <span style={{
                    position: "absolute", top: 10, left: 10,
                    width: 28, height: 28, borderRadius: "50%",
                    background: C.mustard, color: C.ink,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 3px 0 ${C.mustardDeep}`,
                    zIndex: 2,
                  }}>
                    <Check size={14} />
                  </span>
                )}

                {c.extra_price && c.extra_price > 0 && (
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: C.mustard, color: C.ink,
                    fontFamily: FRAUNCES, fontWeight: 800, fontSize: 12,
                    padding: "4px 10px", borderRadius: 999,
                    boxShadow: `0 3px 0 ${C.mustardDeep}`,
                    zIndex: 2,
                  }}>
                    +{c.extra_price} ლ
                  </span>
                )}
              </div>
              <div style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14,
                color: C.cream, marginTop: 10,
              }}>
                {isKa ? c.name.ka : c.name.en}
                {hasVariants && (
                  <div style={{
                    fontFamily: FRAUNCES, fontSize: 11, fontWeight: 500,
                    color: C.champagne, marginTop: 2, opacity: 0.85,
                  }}>
                    {isKa ? "აირჩიე ვარიანტი" : "Pick a variant"}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Variant picker now slides in from the right — easier to see, no
       *  re-layout of the grid. Rendered as a portal-like fixed overlay. */}
      <AnimatePresence>
        {expandedCharm && expandedCharm.variants && expandedCharm.variants.length > 0 && (
          <>
            {/* Backdrop */}
            <motion.div
              key="variant-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCancelExpand}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 49,
              }}
            />
            {/* Drawer */}
            <motion.div
              key="variant-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.215, 0.61, 0.355, 1] }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(420px, 100%)",
                background: C.bg,
                borderLeft: `1.5px solid ${C.champagne}`,
                boxShadow: "-18px 0 40px rgba(0,0,0,0.35)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              <VariantPanel
                charm={expandedCharm}
                isKa={isKa}
                onAdd={(variantId, qty) => onAddRow(expandedCharm, variantId, qty)}
                onCancel={onCancelExpand}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function VariantPanel({
  charm,
  isKa,
  onAdd,
  onCancel,
}: {
  charm: Material;
  isKa: boolean;
  onAdd: (variantId: string, qty: number) => void;
  onCancel: () => void;
}) {
  const variants = charm.variants ?? [];
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Drawer header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 20px",
        borderBottom: `1px solid rgba(201,168,108,0.3)`,
      }}>
        <div style={{
          fontFamily: FRAUNCES, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: C.champagne,
        }}>
          {isKa ? "აირჩიე ვარიანტი" : "Pick a variant"}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="close"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(254,240,214,0.10)", color: C.cream,
            border: `1px solid rgba(201,168,108,0.4)`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {/* Charm preview */}
        <div style={{
          aspectRatio: "4 / 3",
          borderRadius: 18,
          overflow: "hidden",
          background: charm.color || "rgba(254,240,214,0.10)",
          border: `1.5px solid ${C.champagne}`,
          marginBottom: 16,
        }}>
          {charm.image && /^https?:\/\//i.test(charm.image) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={charm.image} alt={isKa ? charm.name.ka : charm.name.en}
                 style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : null}
        </div>

        <div style={{
          fontFamily: PACIFICO, fontSize: 26, color: C.cream,
          marginBottom: 4,
        }}>
          {isKa ? charm.name.ka : charm.name.en}
        </div>
        {charm.extra_price && charm.extra_price > 0 && (
          <div style={{
            fontFamily: FRAUNCES, fontSize: 13, color: C.mustard,
            marginBottom: 14, fontWeight: 700,
          }}>
            +{charm.extra_price} ლ
          </div>
        )}

        <div style={{
          fontFamily: FRAUNCES, fontSize: 12,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.champagne, margin: "12px 0 10px",
        }}>
          {isKa ? "ფერი / სტილი" : "Colour / style"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          {variants.map(v => {
            const active = variantId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 14px",
                  background: active ? C.mustard : "transparent",
                  color: active ? C.ink : C.cream,
                  border: `1.5px solid ${active ? C.mustardDeep : "rgba(201,168,108,0.45)"}`,
                  borderRadius: 999,
                  fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
                  cursor: "pointer",
                  transition: "background 0.18s",
                }}
              >
                {v.color && (
                  <span aria-hidden="true" style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: v.color,
                    border: active ? `1.5px solid ${C.ink}` : "1.5px solid rgba(254,240,214,0.5)",
                  }} />
                )}
                {isKa ? v.name.ka : v.name.en}
              </button>
            );
          })}
        </div>

        <div style={{
          fontFamily: FRAUNCES, fontSize: 12,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.champagne, marginBottom: 10,
        }}>
          {isKa ? "რაოდენობა" : "Quantity"}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center",
          background: "rgba(254,240,214,0.10)",
          borderRadius: 999, padding: 4,
        }}>
          <IconBtn aria-label="−" onClick={() => setQty(q => Math.max(1, q - 1))}>
            <Minus size={14} />
          </IconBtn>
          <span style={{
            minWidth: 32, textAlign: "center",
            fontFamily: FRAUNCES, fontWeight: 800, fontSize: 15, color: C.cream,
          }}>
            {qty}
          </span>
          <IconBtn aria-label="+" onClick={() => setQty(q => q + 1)}>
            <Plus size={14} />
          </IconBtn>
        </div>
      </div>

      {/* Drawer footer — sticky CTAs */}
      <div style={{
        padding: "14px 20px",
        borderTop: `1px solid rgba(201,168,108,0.3)`,
        display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between",
        background: "rgba(20, 54, 47, 0.96)",
      }}>
        <button type="button" onClick={onCancel} style={navButtonStyle("ghost")}>
          {isKa ? "გაუქმება" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={() => variantId && onAdd(variantId, qty)}
          disabled={!variantId}
          style={{
            ...navButtonStyle("primary"),
            opacity: variantId ? 1 : 0.6,
            cursor: variantId ? "pointer" : "not-allowed",
          }}
        >
          <Plus size={14} />
          {isKa ? "დაამატე" : "Add"}
        </button>
      </div>
    </div>
  );
}

function SwatchTile({ material, label, isKa }: { material: Material | null; label: string; isKa: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: FRAUNCES, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.champagne, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        aspectRatio: "1 / 1",
        borderRadius: 18,
        overflow: "hidden",
        background: material?.color || "rgba(254,240,214,0.10)",
        border: `2px solid ${C.champagne}`,
        margin: "0 auto",
        maxWidth: 180,
      }}>
        {material?.image && /^https?:\/\//i.test(material.image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={material.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : null}
      </div>
      <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.cream, marginTop: 10 }}>
        {material ? (isKa ? material.name.ka : material.name.en) : "—"}
      </div>
    </div>
  );
}

function PriceRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      fontSize: 14,
      color: muted ? C.champagne : C.cream,
      fontFamily: FRAUNCES,
    }}>
      <span>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Star({ size, color = C.mustard, top, left, right }: { size: number; color?: string; top: number; left?: string; right?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ position: "absolute", top, left, right, opacity: 0.7, pointerEvents: "none" }}
    >
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill={color} />
    </svg>
  );
}

function navButtonStyle(kind: "primary" | "ghost"): React.CSSProperties {
  if (kind === "primary") {
    return {
      fontFamily: FRAUNCES, fontWeight: 800, fontSize: 13,
      letterSpacing: "0.18em", textTransform: "uppercase",
      background: C.mustard, color: C.ink,
      padding: "12px 22px", borderRadius: 999,
      border: "none",
      display: "inline-flex", alignItems: "center", gap: 8,
      cursor: "pointer",
      boxShadow: `0 4px 0 ${C.mustardDeep}`,
    };
  }
  return {
    fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
    letterSpacing: "0.18em", textTransform: "uppercase",
    background: "transparent", color: C.cream,
    padding: "12px 22px", borderRadius: 999,
    border: `1.5px solid ${C.champagne}`,
    display: "inline-flex", alignItems: "center", gap: 8,
    cursor: "pointer",
  };
}
