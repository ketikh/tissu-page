"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct, StorefrontCategory } from "@/lib/admin-api";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import { getLandingCopy } from "@/app/[lang]/landingCopy";
import { motion, AnimatePresence } from "framer-motion";

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
      result.sort((a, b) =>
        (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0)
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
      ? lang === "ka" ? "მაღაზია" : "Shop"
      : categories.find((c) => c.val === categoryParam)?.label ??
        (lang === "ka" ? "მაღაზია" : "Shop");

  const subLabel =
    lang === "ka"
      ? "ყველა ნემსი ცოცხალი ადამიანის ხელით, თბილისის სტუდიაში."
      : "Every stitch tied by a real human, in our Tbilisi studio.";

  return (
    <div className="bg-[var(--tissu-cream)] min-h-screen">
      <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-col mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <h1 className="ka-display-lg font-serif text-[44px] md:text-[64px] lg:text-[80px] leading-[1.02] tracking-[-0.02em] text-[var(--tissu-ink)] mb-5">
                {headingLabel}
              </h1>
              <p className="text-[var(--tissu-ink-soft)] text-[17px] leading-[1.55] max-w-[480px]">
                {subLabel}
              </p>
            </div>

            {/* Desktop sort */}
            <div className="hidden md:flex items-center gap-3 bg-[var(--tissu-white)] px-5 py-3 rounded-full border border-[var(--border)]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--tissu-ink-soft)]">
                {lang === "ka" ? "დალაგება" : "Sort"}
              </span>
              <div className="relative">
                <select
                  className="bg-transparent border-none text-sm font-bold text-[var(--tissu-ink)] focus:ring-0 cursor-pointer appearance-none pr-7"
                  value={sortParam}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                >
                  <option value="featured">{lang === "ka" ? "ფავორიტები" : "Featured"}</option>
                  <option value="new">{lang === "ka" ? "სიახლეები" : "Newest"}</option>
                  <option value="price-low">{lang === "ka" ? "ფასი ↑" : "Price low → high"}</option>
                  <option value="price-high">{lang === "ka" ? "ფასი ↓" : "Price high → low"}</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--tissu-terracotta)]" />
              </div>
            </div>

            {/* Mobile filter trigger */}
            <button
              className="md:hidden w-full h-14 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] flex items-center justify-between px-5"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <span className="flex items-center gap-3 font-bold text-[var(--tissu-ink)] text-[15px]">
                <SlidersHorizontal className="w-5 h-5 text-[var(--tissu-terracotta)]" />
                {lang === "ka" ? "ფილტრი" : "Filter"}
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-[var(--tissu-terracotta)] text-white text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-8">
              {categoryParam !== "all" && (
                <FilterChip
                  label={categories.find((c) => c.val === categoryParam)?.label}
                  onRemove={() => updateFilter("category", "all")}
                />
              )}
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-black text-[var(--tissu-terracotta)] hover:underline ml-1 uppercase tracking-[0.15em]"
              >
                {lang === "ka" ? "ფილტრის გასუფთავება" : "Clear filters"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-14">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-10 sticky top-32 h-fit">
            <div className="space-y-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink-soft)]">
                {lang === "ka" ? "კატეგორიები" : "Categories"}
              </h3>
              <ul className="space-y-3.5">
                {categories.map((cat) => (
                  <li key={cat.val}>
                    <button
                      onClick={() => updateFilter("category", cat.val)}
                      className={`group flex items-center gap-3 text-[15px] font-bold transition-colors ${
                        categoryParam === cat.val
                          ? "text-[var(--tissu-terracotta)]"
                          : "text-[var(--tissu-ink)]/70 hover:text-[var(--tissu-ink)]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-transform ${
                          categoryParam === cat.val
                            ? "bg-[var(--tissu-terracotta)] scale-125"
                            : "bg-transparent group-hover:bg-[var(--tissu-ink)]/30"
                        }`}
                      />
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-9">
            {visibleProducts.length === 0 ? (
              <div className="py-24 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[var(--tissu-white)] rounded-full flex items-center justify-center text-[var(--tissu-ink)]/30 mb-6 border border-dashed border-[var(--border)]">
                  <Filter className="w-8 h-8" />
                </div>
                <p className="text-2xl font-serif text-[var(--tissu-ink)] mb-6">
                  {lang === "ka" ? "ამ ფილტრით ჩანთები ვერ მოიძებნა." : "Nothing matches those filters yet."}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-7 py-3.5 rounded-full border-[1.5px] border-[var(--tissu-ink)] font-bold text-[15px] text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
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
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-[var(--tissu-ink)]/40 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-[90%] max-w-md bg-[var(--tissu-cream)] z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-7 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="ka-display-md font-serif text-3xl text-[var(--tissu-ink)]">
                    {lang === "ka" ? "ფილტრი" : "Filter"}
                  </h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-11 h-11 bg-[var(--tissu-white)] rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--tissu-ink)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-10">
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink-soft)]">
                      {lang === "ka" ? "კატეგორია" : "Category"}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.val}
                          onClick={() => updateFilter("category", cat.val)}
                          className={`flex items-center justify-between px-5 py-4 rounded-[20px] border transition-colors ${
                            categoryParam === cat.val
                              ? "bg-[var(--tissu-white)] border-[var(--tissu-terracotta)] text-[var(--tissu-terracotta)]"
                              : "bg-[var(--tissu-white)]/60 border-[var(--border)] text-[var(--tissu-ink)]"
                          }`}
                        >
                          <span className="font-bold">{cat.label}</span>
                          {categoryParam === cat.val && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink-soft)]">
                      {lang === "ka" ? "დალაგება" : "Sort"}
                    </h3>
                    <select
                      className="w-full px-5 py-4 rounded-[20px] bg-[var(--tissu-white)] border border-[var(--border)] font-bold text-[var(--tissu-ink)]"
                      value={sortParam}
                      onChange={(e) => updateFilter("sort", e.target.value)}
                    >
                      <option value="featured">{lang === "ka" ? "ფავორიტები" : "Featured"}</option>
                      <option value="new">{lang === "ka" ? "სიახლეები" : "Newest"}</option>
                      <option value="price-low">{lang === "ka" ? "ფასი ↑" : "Price low → high"}</option>
                      <option value="price-high">{lang === "ka" ? "ფასი ↓" : "Price high → low"}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--tissu-white)] border-t border-dashed border-[var(--border)]">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full h-14 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] rounded-full font-bold text-[15px]"
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

function FilterChip({ label, onRemove }: { label: string | undefined; onRemove: () => void }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-2.5 bg-[var(--tissu-terracotta)] text-white px-4 py-1.5 rounded-full text-[13px] font-bold">
      {label}
      <button onClick={onRemove} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
