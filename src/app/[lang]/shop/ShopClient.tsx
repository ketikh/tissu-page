"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct, StorefrontCategory } from "@/lib/admin-api";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import { getLandingCopy } from "@/app/[lang]/landingCopy";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  burntDeep: "#a84e1a",
  champagne: "#c9a86c",
  rose: "#c4849a",
  green: "#3f6f56",
};

/* ─── Types ──────────────────────────────────────────────────────────────────── */
interface ShopClientProps {
  lang: Locale;
  dictionary: any;
  products: StorefrontProduct[];
}

type CategoryValue = "all" | StorefrontCategory;
type SortValue = "featured" | "new" | "price-low" | "price-high";

// Maps ?category= URL values to the admin's StorefrontCategory values.
// Footer links use long, URL-friendly slugs; this is where we normalize them.
const CATEGORY_ALIASES: Record<string, CategoryValue> = {
  all: "all",
  pouches: "pouch",
  pouch: "pouch",
  "laptop-sleeves": "laptop",
  laptop: "laptop",
  totes: "tote",
  tote: "tote",
  "kids-backpacks": "kidsbackpack",
  kidsbackpack: "kidsbackpack",
  aprons: "apron",
  apron: "apron",
  necklaces: "necklace",
  necklace: "necklace",
};

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function ShopClient({ lang, dictionary, products }: ShopClientProps) {
  const copy = getLandingCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const rawCategoryParam = searchParams.get("category") ?? "all";
  const categoryParam: CategoryValue = CATEGORY_ALIASES[rawCategoryParam] ?? "all";
  const sortParam = (searchParams.get("sort") as SortValue) ?? "featured";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push(`?sort=${sortParam}`, { scroll: false });
  };

  const visibleProducts = useMemo(() => {
    let result = [...products];
    if (categoryParam !== "all") {
      result = result.filter((p) => p.category === categoryParam);
    }
    if (sortParam === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortParam === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortParam === "new")
      result.sort(
        (a, b) => (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0)
      );
    // "featured": server order (admin curated)
    return result;
  }, [products, categoryParam, sortParam]);

  const categories: Array<{ label: string; val: CategoryValue }> = [
    { label: copy.shop.filters.all, val: "all" },
    { label: copy.shop.filters.pouch, val: "pouch" },
    { label: copy.shop.filters.laptop, val: "laptop" },
    { label: copy.shop.filters.bag, val: "tote" },
    { label: copy.shop.filters.kidsbackpack, val: "kidsbackpack" },
    { label: copy.shop.filters.apron, val: "apron" },
    { label: copy.shop.filters.necklace, val: "necklace" },
  ];

  const activeFiltersCount = categoryParam !== "all" ? 1 : 0;

  const cardLabels = {
    addToBasket: copy.shop.card.addToBasket,
    favourite: copy.shop.card.favourite,
    outOfStock: lang === "ka" ? "ამოიწურა" : "Sold out",
    flipSides: lang === "ka" ? "გადმოაბრუნე" : "Flip sides",
    badges: copy.shop.badges,
  };

  const headingLabel =
    categoryParam === "all"
      ? lang === "ka"
        ? "მაღაზია"
        : "Shop"
      : categories.find((c) => c.val === categoryParam)?.label ??
        (lang === "ka" ? "მაღაზია" : "Shop");

  const subLabel =
    lang === "ka"
      ? "ყველა ნემსი ცოცხალი ადამიანის ხელით, თბილისის სტუდიაში."
      : "Every stitch tied by a real human, in our Tbilisi studio.";

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <header
        style={{
          background: C.burnt,
          borderBottom: `3px solid transparent`,
          borderImage: `repeating-linear-gradient(90deg, ${C.rose} 0 18px, ${C.cream} 18px 36px) 1`,
        }}
      >
        <div className="container py-16 md:py-24 flex flex-col items-start gap-3">
          <p
            className="uppercase"
            style={{
              fontFamily: FRAUNCES,
              fontSize: "11px",
              letterSpacing: "0.3em",
              color: C.champagne,
            }}
          >
            {lang === "ka" ? "ყველა პროდუქტი" : "All products"}
          </p>
          <h1
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "clamp(44px, 7vw, 88px)",
              lineHeight: 1,
              color: C.cream,
            }}
          >
            {headingLabel}
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: C.champagne,
              maxWidth: "480px",
              lineHeight: 1.55,
            }}
          >
            {subLabel}
          </p>
        </div>
      </header>

      {/* ── Category pill tabs ──────────────────────────────────────────────── */}
      <nav
        style={{ background: C.cream }}
        className="py-5 px-4 flex flex-wrap gap-2.5 justify-center"
      >
        {categories.map((cat) => {
          const isActive = categoryParam === cat.val;
          return (
            <button
              key={cat.val}
              onClick={() => updateFilter("category", cat.val)}
              className="px-5 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all"
              style={
                isActive
                  ? {
                      background: C.ink,
                      color: C.cream,
                      boxShadow: "0 4px 0 rgba(42,29,20,0.3)",
                      fontFamily: FRAUNCES,
                    }
                  : {
                      background: "transparent",
                      color: C.ink,
                      border: `1.5px solid ${C.ink}`,
                      fontFamily: FRAUNCES,
                    }
              }
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* ── Sort row + active filter chips ─────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 pb-4 px-4"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Active filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {activeFiltersCount > 0 && (
            <>
              {categoryParam !== "all" && (
                <FilterChip
                  label={categories.find((c) => c.val === categoryParam)?.label}
                  onRemove={() => updateFilter("category", "all")}
                />
              )}
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-black hover:underline uppercase tracking-[0.15em]"
                style={{ color: C.burnt, fontFamily: FRAUNCES }}
              >
                {lang === "ka" ? "ფილტრის გასუფთავება" : "Clear filters"}
              </button>
            </>
          )}
        </div>

        {/* Sort + mobile filter trigger */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Desktop sort */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="uppercase"
              style={{
                fontFamily: FRAUNCES,
                fontSize: "10px",
                letterSpacing: "0.25em",
                color: C.champagne,
              }}
            >
              {lang === "ka" ? "დალაგება" : "Sort by"}
            </span>
            <div className="relative flex items-center">
              <select
                className="appearance-none pr-6 outline-none cursor-pointer font-bold"
                style={{
                  background: "transparent",
                  borderBottom: `2px solid ${C.ink}`,
                  fontSize: "13px",
                  color: C.ink,
                  fontFamily: FRAUNCES,
                }}
                value={sortParam}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="featured">{lang === "ka" ? "ფავორიტები" : "Featured"}</option>
                <option value="new">{lang === "ka" ? "სიახლეები" : "Newest"}</option>
                <option value="price-low">
                  {lang === "ka" ? "ფასი ↑" : "Price low → high"}
                </option>
                <option value="price-high">
                  {lang === "ka" ? "ფასი ↓" : "Price high → low"}
                </option>
              </select>
              <ChevronDown
                className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: C.burnt }}
              />
            </div>
          </div>

          {/* Mobile filter trigger */}
          <button
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px]"
            style={{
              background: C.cream,
              border: `1.5px solid ${C.ink}`,
              color: C.ink,
              fontFamily: FRAUNCES,
            }}
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" style={{ color: C.burnt }} />
            {lang === "ka" ? "ფილტრი" : "Filter"}
            {activeFiltersCount > 0 && (
              <span
                className="w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-black"
                style={{ background: C.burnt, color: C.cream }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Product grid ────────────────────────────────────────────────────── */}
      <main className="container py-8 md:py-12">
        {visibleProducts.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center gap-6">
            <span style={{ fontSize: "48px", color: C.champagne }}>✦</span>
            <p
              style={{
                fontFamily: FRAUNCES,
                fontStyle: "italic",
                fontSize: "24px",
                color: C.ink,
              }}
            >
              {lang === "ka"
                ? "ამ ფილტრით ჩანთები ვერ მოიძებნა."
                : "Nothing matches those filters yet."}
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-6 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              style={{
                fontFamily: FRAUNCES,
                background: C.mustard,
                color: C.ink,
                boxShadow: `0 5px 0 ${C.mustardDeep}`,
                fontWeight: 800,
              }}
            >
              {lang === "ka" ? "გასუფთავება" : "Clear filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {visibleProducts.map((p, i) => {
              const localized = copy.products[i] ?? null;
              return (
                <AdminProductCard
                  key={p.id}
                  product={p}
                  lang={lang}
                  localized={localized}
                  labels={cardLabels}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* ── Mobile filter drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 backdrop-blur-md z-100"
              style={{ background: "rgba(42,29,20,0.4)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-[90%] max-w-md z-101 shadow-2xl flex flex-col"
              style={{ background: C.cream }}
            >
              <div className="p-7 flex-1 overflow-y-auto">
                {/* Drawer header */}
                <div className="flex justify-between items-center mb-10">
                  <h2
                    style={{
                      fontFamily: FRAUNCES,
                      fontStyle: "italic",
                      fontSize: "28px",
                      color: C.ink,
                    }}
                  >
                    {lang === "ka" ? "ფილტრი" : "Filter"}
                  </h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: C.cream,
                      border: `1.5px solid ${C.ink}`,
                      color: C.ink,
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Category list */}
                  <div className="space-y-4">
                    <h3
                      className="uppercase"
                      style={{
                        fontFamily: FRAUNCES,
                        fontSize: "10px",
                        letterSpacing: "0.3em",
                        color: C.champagne,
                      }}
                    >
                      {lang === "ka" ? "კატეგორია" : "Category"}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {categories.map((cat) => {
                        const isActive = categoryParam === cat.val;
                        return (
                          <button
                            key={cat.val}
                            onClick={() => updateFilter("category", cat.val)}
                            className="flex items-center justify-between px-5 py-4 rounded-[20px] transition-all font-bold"
                            style={{
                              fontFamily: FRAUNCES,
                              background: isActive ? C.ink : "rgba(42,29,20,0.05)",
                              color: isActive ? C.cream : C.ink,
                              border: isActive
                                ? `1.5px solid ${C.ink}`
                                : `1.5px solid rgba(42,29,20,0.15)`,
                            }}
                          >
                            <span>{cat.label}</span>
                            {isActive && <Check className="w-5 h-5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-4">
                    <h3
                      className="uppercase"
                      style={{
                        fontFamily: FRAUNCES,
                        fontSize: "10px",
                        letterSpacing: "0.3em",
                        color: C.champagne,
                      }}
                    >
                      {lang === "ka" ? "დალაგება" : "Sort"}
                    </h3>
                    <select
                      className="w-full px-5 py-4 rounded-[20px] font-bold outline-none"
                      style={{
                        fontFamily: FRAUNCES,
                        background: "rgba(42,29,20,0.05)",
                        border: `1.5px solid rgba(42,29,20,0.2)`,
                        color: C.ink,
                      }}
                      value={sortParam}
                      onChange={(e) => updateFilter("sort", e.target.value)}
                    >
                      <option value="featured">{lang === "ka" ? "ფავორიტები" : "Featured"}</option>
                      <option value="new">{lang === "ka" ? "სიახლეები" : "Newest"}</option>
                      <option value="price-low">
                        {lang === "ka" ? "ფასი ↑" : "Price low → high"}
                      </option>
                      <option value="price-high">
                        {lang === "ka" ? "ფასი ↓" : "Price high → low"}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div
                className="p-6 border-t border-dashed"
                style={{ borderColor: "rgba(42,29,20,0.2)" }}
              >
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full h-14 rounded-full font-extrabold text-[13px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                  style={{
                    fontFamily: FRAUNCES,
                    background: C.ink,
                    color: C.cream,
                    boxShadow: "0 5px 0 rgba(42,29,20,0.4)",
                    fontWeight: 800,
                  }}
                >
                  {lang === "ka" ? "დახურვა" : "Apply"} ({visibleProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Filter chip ────────────────────────────────────────────────────────────── */
function FilterChip({ label, onRemove }: { label: string | undefined; onRemove: () => void }) {
  if (!label) return null;
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[13px] font-bold"
      style={{
        background: "#d56826",
        color: "#fef0d6",
        fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif",
      }}
    >
      {label}
      <button onClick={onRemove} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
