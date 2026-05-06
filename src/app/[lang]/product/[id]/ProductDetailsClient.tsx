"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Heart, ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useStoreHydration } from "@/store/useHydration";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";

const C = {
  cream:       "#fef0d6",
  beige:       "#f5e3c2",
  ink:         "#2a1d14",
  mustard:     "#f3b62b",
  mustardDeep: "#d99820",
  burnt:       "#d56826",
  champagne:   "#c9a86c",
  rose:        "#c4849a",
  green:       "#3f6f56",
  blue:        "#5a9fd4",
  blueDark:    "#3a7faa",
};

interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

/* ── 4-petal cloud/flower path (SSR-safe: only Math.*) ──────────────── */
function cloudPath(cx: number, cy: number, d: number, r: number): string {
  const n = 4;
  const angles = Array.from({ length: n }, (_, i) => (i * Math.PI) / 2 - Math.PI / 2);
  const ctrs = angles.map((a) => [cx + d * Math.cos(a), cy + d * Math.sin(a)] as const);

  function waist(c1: readonly [number, number], c2: readonly [number, number]) {
    const [x1, y1] = c1, [x2, y2] = c2;
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const h = Math.sqrt(Math.max(0, r * r - (dist / 2) ** 2));
    const p1 = [mx + h * dy / dist, my - h * dx / dist];
    const p2 = [mx - h * dy / dist, my + h * dx / dist];
    return Math.hypot(p1[0] - cx, p1[1] - cy) > Math.hypot(p2[0] - cx, p2[1] - cy) ? p1 : p2;
  }

  const ws = ctrs.map((c, i) => waist(c, ctrs[(i + 1) % n]));
  const f = (v: number) => +v.toFixed(4);
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const [sx, sy] = ws[(i - 1 + n) % n];
    const [ex, ey] = ws[i];
    if (i === 0) parts.push(`M ${f(sx)} ${f(sy)}`);
    parts.push(`A ${f(r)} ${f(r)} 0 1 1 ${f(ex)} ${f(ey)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

// Pre-computed path for the 500×500 viewBox used in the SVG outline
const CLOUD_500 = cloudPath(250, 250, 110, 100);
// Normalised path (0-1 space) for clipPathUnits="objectBoundingBox"
const CLOUD_NORM = cloudPath(0.5, 0.5, 0.22, 0.20);

/* ── Related product card ───────────────────────────────────────────── */
const ACCENT_CYCLE = [C.mustard, C.rose, C.blue, C.green];

function RelatedCard({
  product,
  lang,
  accent,
}: {
  product: StorefrontProduct;
  lang: Locale;
  accent: string;
}) {
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const name = product.name || product.code;
  const curr = product.currency === "GEL" ? "₾" : ` ${product.currency}`;

  const handleAdd = () => {
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name: { en: name, ka: name }, subtitle: { en: "", ka: "" },
          description: { en: "", ka: "" }, price: product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{ id: `${product.id}-default`, size: "one", colorName: { en: "default", ka: "default" }, colorCode: "#c9a86c", inStock: true }],
          category: product.category as any, featured: true, badges: [],
        } as any,
        { id: `${product.id}-default`, size: "one", colorName: { en: "default", ka: "default" }, colorCode: "#c9a86c", inStock: true } as any,
        1
      );
      openCart();
    } catch { openCart(); }
  };

  return (
    <Link href={`/${lang}/product/${product.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ y: -4 }}
        style={{
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          border: `1.5px solid rgba(201,168,108,0.22)`,
          boxShadow: "0 2px 16px rgba(42,29,20,0.07)",
        }}
      >
        <div style={{ position: "relative", aspectRatio: "4/3", background: C.beige, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />
          <Image
            src={product.image_front}
            alt={name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div style={{ padding: "12px 14px 10px" }}>
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 15, color: C.ink, fontWeight: 600, marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 13, color: C.champagne, marginBottom: 10 }}>{product.size}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: FRAUNCES, fontSize: 16, fontWeight: 700, color: C.burnt }}>{product.price}{curr}</span>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(); }}
              style={{
                background: C.ink, color: C.cream, border: "none", borderRadius: 20,
                padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}
            >
              + Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);

  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity,   setQuantity]   = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const hasBack   = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back ? product.image_back : product.image_front;
  const inStock   = product.in_stock && product.stock > 0;
  const isOnSale  = Boolean(product.original_price && product.original_price > product.price);
  const name      = product.name || product.code;
  const sub       = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa      = lang === "ka";
  const curr      = product.currency === "GEL" ? "₾" : ` ${product.currency}`;
  const categoryLabel = copy.shop.filters[product.category === "tote" ? "bag" : product.category];

  const onAddToCart = () => {
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id, slug: product.id,
          name:        { en: name, ka: name },
          subtitle:    { en: sub,  ka: sub  },
          description: { en: "",   ka: ""   },
          price:       product.price,
          images:      [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [{
            id: `${product.id}-default`, size: "one",
            colorName: { en: product.color || "default", ka: product.color || "default" },
            colorCode: "#264ba0", inStock: true,
          }],
          category: product.category as any, featured: true, badges: [],
        } as any,
        {
          id: `${product.id}-default`, size: "one",
          colorName: { en: product.color || "default", ka: product.color || "default" },
          colorCode: "#264ba0", inStock: true,
        } as any,
        quantity
      );
      openCart();
    } catch { openCart(); }
  };

  /* ══════════════ RENDER ══════════════ */
  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>

      {/* ══ BLUE HERO SECTION ════════════════════════════════════════════ */}
      <div style={{ background: C.blue }}>

        {/* Small cloud-framed thumbnail — centered in blue */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 32, paddingBottom: 16, position: "relative" }}>
          <div style={{ position: "relative", width: 160, height: 160 }}>
            {/* Clip definition */}
            <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
              <defs>
                <clipPath id="cloud-thumb" clipPathUnits="objectBoundingBox">
                  <path d={CLOUD_NORM} />
                </clipPath>
              </defs>
            </svg>
            {/* Clipped photo */}
            <div style={{ clipPath: "url(#cloud-thumb)", width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
              <Image
                src={product.image_front}
                alt={name}
                fill
                sizes="160px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            {/* Rose outline SVG overlay */}
            <svg
              viewBox="0 0 500 500"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              aria-hidden
            >
              <path d={CLOUD_500} stroke={C.rose} strokeWidth={10} fill="none" />
            </svg>
          </div>
        </div>

        {/* Arch transition: blue above, cream arch rising from bottom */}
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: 100 }}
          aria-hidden
        >
          <path d="M0,100 Q720,-10 1440,100 Z" fill={C.cream} />
        </svg>
      </div>

      {/* ══ PRODUCT CONTENT ══════════════════════════════════════════════ */}
      <div style={{ background: C.cream }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 pb-16">

          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 mb-8 overflow-x-auto whitespace-nowrap"
            style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12, color: C.champagne, letterSpacing: "0.04em" }}
          >
            <Link href={`/${lang}`} className="hover:text-[#d56826] transition-colors shrink-0">{isKa ? "მთავარი" : "home"}</Link>
            <span className="shrink-0" style={{ opacity: 0.5 }}>✦</span>
            <Link href={`/${lang}/shop`} className="hover:text-[#d56826] transition-colors shrink-0">{isKa ? "მაღაზია" : "shop"}</Link>
            <span className="shrink-0" style={{ opacity: 0.5 }}>✦</span>
            <span style={{ color: C.ink, fontStyle: "normal", fontWeight: 700 }}>{name}</span>
          </nav>

          {/* Two-column layout */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ gap: 52, alignItems: "start" }}
          >

            {/* ─── LEFT: Flower-framed product photo ─── */}
            <div>
              <div style={{ position: "relative" }}>
                {/* Clip definition for main photo */}
                <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
                  <defs>
                    <clipPath id="cloud-main" clipPathUnits="objectBoundingBox">
                      <path d={CLOUD_NORM} />
                    </clipPath>
                  </defs>
                </svg>

                {/* Container: square aspect ratio */}
                <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                  {/* Clipped image */}
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      clipPath: "url(#cloud-main)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={activeImg}
                      alt={name}
                      fill
                      sizes="(max-width:768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </div>

                  {/* Rose outline on top (not clipped) */}
                  <svg
                    viewBox="0 0 500 500"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                    aria-hidden
                  >
                    <path d={CLOUD_500} stroke={C.rose} strokeWidth={7} fill="none" />
                  </svg>

                  {/* Wishlist button */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setWishlisted((w) => !w)}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    style={{
                      position: "absolute", top: "15%", right: "5%",
                      background: "white", border: "none", borderRadius: "50%",
                      width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", zIndex: 2,
                    }}
                  >
                    <Heart
                      size={18}
                      fill={wishlisted ? C.rose : "none"}
                      stroke={wishlisted ? C.rose : C.champagne}
                      strokeWidth={2}
                    />
                  </motion.button>

                  {/* Stock badge */}
                  {inStock && (
                    <div
                      style={{
                        position: "absolute", bottom: "13%", left: "10%",
                        background: "white", borderRadius: 20, padding: "4px 12px",
                        fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 12,
                        color: C.green, boxShadow: "0 2px 10px rgba(0,0,0,0.10)", zIndex: 2,
                      }}
                    >
                      ✦ {isKa ? "მარაგშია" : "in stock"}
                    </div>
                  )}
                </div>

                {/* Front / Back thumb switcher */}
                {hasBack && (
                  <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
                    {(["front", "back"] as const).map((side) => {
                      const src = side === "front" ? product.image_front : product.image_back!;
                      const active = activeSide === side;
                      return (
                        <button
                          key={side}
                          onClick={() => setActiveSide(side)}
                          style={{
                            width: 60, height: 60, borderRadius: 12, overflow: "hidden",
                            border: active ? `2.5px solid ${C.rose}` : `2px solid rgba(201,168,108,0.30)`,
                            padding: 0, cursor: "pointer", position: "relative", background: C.beige,
                            transition: "border-color 0.18s",
                          }}
                          aria-label={side}
                        >
                          <Image src={src} alt={side} fill style={{ objectFit: "cover" }} sizes="60px" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ─── RIGHT: Product info ─── */}
            <div style={{ paddingTop: 8 }}>

              {/* Category badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    background: C.green, color: "white", borderRadius: 20,
                    padding: "4px 14px", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}
                >
                  {categoryLabel || product.category}
                </span>
                <span style={{ fontSize: 13, color: C.champagne, fontFamily: FRAUNCES, fontStyle: "italic" }}>
                  · {product.stock} {isKa ? "მარაგში" : "in stock"}
                </span>
              </div>

              {/* Product name */}
              <h1
                style={{
                  fontFamily: FRAUNCES,
                  fontStyle: "italic",
                  fontSize: "clamp(36px, 5vw, 58px)",
                  fontWeight: 900,
                  color: C.burnt,
                  lineHeight: 1.08,
                  margin: "0 0 12px",
                }}
              >
                {name}
              </h1>

              {/* Size / subtitle */}
              {sub && (
                <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 14, color: C.champagne, marginBottom: 16 }}>
                  {sub}
                </p>
              )}

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: FRAUNCES, fontSize: 34, fontWeight: 800, color: C.ink }}>
                  {product.price}{curr}
                </span>
                {isOnSale && product.original_price && (
                  <span style={{ fontSize: 18, color: C.champagne, textDecoration: "line-through" }}>
                    {product.original_price}{curr}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p style={{
                  fontFamily: FRAUNCES, fontStyle: "italic",
                  fontSize: 15, lineHeight: 1.7, color: C.ink,
                  opacity: 0.8, marginBottom: 20,
                }}>
                  {product.description}
                </p>
              )}

              {/* Feature pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {[
                  { icon: "✦", label: isKa ? "ხელნაკეთი" : "Handmade" },
                  { icon: "💧", label: isKa ? "წყალგამძლე" : "Water-resistant" },
                  { icon: "↺",  label: isKa ? "ორმხრივი" : "Reversible" },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    style={{
                      border: `1.5px solid rgba(201,168,108,0.45)`,
                      borderRadius: 20,
                      padding: "5px 14px",
                      fontSize: 13,
                      color: C.ink,
                      background: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {icon} {label}
                  </span>
                ))}
              </div>

              {/* Quantity selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.champagne, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {isKa ? "რაოდ." : "QTY"}
                </span>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 0,
                    border: `1.5px solid rgba(201,168,108,0.40)`,
                    borderRadius: 24, overflow: "hidden", background: "white",
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}
                    aria-label="decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: 36, textAlign: "center", fontWeight: 700, fontSize: 15, color: C.ink }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}
                    aria-label="increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onAddToCart}
                  disabled={!inStock}
                  style={{
                    flex: 1, minWidth: 160,
                    background: inStock ? C.mustard : C.champagne,
                    color: C.ink,
                    border: "none", borderRadius: 28,
                    padding: "14px 28px",
                    fontFamily: FRAUNCES, fontStyle: "italic",
                    fontSize: 16, fontWeight: 700,
                    cursor: inStock ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: inStock ? `0 4px 20px rgba(243,182,43,0.35)` : "none",
                  }}
                >
                  <ShoppingBag size={18} />
                  {isKa ? "კალათში დამატება" : "Add to bag"} →
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => window.location.href = `/${lang}/shop`}
                  style={{
                    flex: "0 0 auto",
                    background: C.ink, color: C.cream,
                    border: "none", borderRadius: 28,
                    padding: "14px 24px",
                    fontFamily: FRAUNCES, fontStyle: "italic",
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {isKa ? "ყველა ნივთი" : "See all bags"}
                </motion.button>
              </div>

              {/* Delivery note */}
              <p style={{ fontSize: 13, color: C.champagne, fontFamily: FRAUNCES, fontStyle: "italic" }}>
                ✦ {isKa ? "ხელნაკეთი თბილისში · სწრაფი მიტანა საქართველოში" : "Handmade in Tbilisi · Fast delivery across Georgia"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FEATURES STRIP ═══════════════════════════════════════════════ */}
      <div style={{ background: C.beige, borderTop: `1px dashed rgba(201,168,108,0.35)`, borderBottom: `1px dashed rgba(201,168,108,0.35)` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ padding: "28px 0", gap: 20 }}
          >
            {[
              { icon: "🚗", title: isKa ? "უფასო მიტანა"  : "Free shipping",   sub: isKa ? "1-2 სამ. დღე"    : "1–2 business days" },
              { icon: "✦",  title: isKa ? "ხელნაკეთი"     : "Handmade",        sub: isKa ? "ჩვენს სახელოსნოში" : "In our Tbilisi studio" },
              { icon: "↺",  title: isKa ? "ორმხრივი"      : "Reversible",      sub: isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag" },
              { icon: "💧", title: isKa ? "წყალგამძლე"    : "Water-resistant", sub: isKa ? "სანვარე ტილო"    : "Canvas that handles rain" },
            ].map(({ icon, title, sub: fsub }) => (
              <div key={title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 14, color: C.burnt, fontWeight: 700, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: C.champagne }}>{fsub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RELATED PRODUCTS ════════════════════════════════════════════ */}
      {related.length > 0 && (
        <div style={{ background: C.cream, padding: "60px 0 80px" }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <h2 style={{
              fontFamily: FRAUNCES, fontStyle: "italic",
              fontSize: 30, color: C.ink,
              textAlign: "center", marginBottom: 36,
            }}>
              {isKa ? "შეიძლება მოგეწონოს" : "You might also love"}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {related.slice(0, 4).map((rp, idx) => (
                <RelatedCard
                  key={rp.id}
                  product={rp}
                  lang={lang}
                  accent={ACCENT_CYCLE[idx % ACCENT_CYCLE.length]}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
