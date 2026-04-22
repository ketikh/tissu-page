"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/product/ProductCard";
import { Filter, X, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { Locale } from "@/i18n/config";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface ShopContentProps {
  lang: Locale;
  dictionary: any;
}

export default function ShopClient({ lang, dictionary }: ShopContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States from URL
  const categoryParam = searchParams.get("category") || "all";
  const sortParam = searchParams.get("sort") || "featured";
  const colorParam = searchParams.get("color");

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push(`?sort=${sortParam}`, { scroll: false });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    if (categoryParam !== "all") {
      result = result.filter((p) => p.category === categoryParam);
    }

    if (colorParam) {
      result = result.filter((p) => 
        p.variants.some(v => v.color[lang].toLowerCase() === colorParam.toLowerCase() || v.color['en'].toLowerCase() === colorParam.toLowerCase())
      );
    }

    // Sorting
    if (sortParam === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortParam === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortParam === "new") {
      result.sort((a, b) => (a.badges.some(b => b.en === "NEW") ? -1 : 1));
    } else if (sortParam === "featured") {
      result.sort((a, b) => (b.featured ? 1 : -1));
    }

    return result;
  }, [categoryParam, colorParam, sortParam, lang]);

  const categories = [
    { label: dictionary.shop.title, val: "all" },
    { label: dictionary.footer.shop.sleeves, val: "laptop-sleeves" },
    { label: dictionary.footer.shop.accessories, val: "accessories" },
    { label: lang === "ka" ? "პატარა ჩანთები" : "Pouches", val: "pouches" }
  ];

  const availableColors = useMemo(() => {
    const colors = new Map();
    mockProducts.forEach(p => p.variants.forEach(v => {
      colors.set(v.color[lang], v.colorCode);
    }));
    return Array.from(colors.entries()).map(([name, code]) => ({ name, code }));
  }, [lang]);

  const activeFiltersCount = (categoryParam !== 'all' ? 1 : 0) + (colorParam ? 1 : 0);

  return (
    <div className="bg-[var(--tissu-cream)] min-h-screen">
      <div className="container px-6 py-12 md:py-24">
        
        {/* Header Section */}
        <div className="flex flex-col mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-serif text-[var(--tissu-ink)] tracking-tight mb-8">
                {categoryParam === 'all' ? dictionary.shop.title : categories.find(c => c.val === categoryParam)?.label}
              </h1>
              <p className="text-[var(--tissu-ink-soft)] text-xl font-medium leading-relaxed opacity-80">
                {dictionary.shop.subtitle}
              </p>
            </div>

            {/* Desktop Sort */}
            <div className="hidden md:flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-[var(--border)] shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--tissu-ink)] opacity-40">
                {dictionary.shop.filters.sortBy}
              </span>
              <div className="relative">
                <select 
                  className="bg-transparent border-none text-sm font-bold text-[var(--tissu-ink)] focus:ring-0 cursor-pointer appearance-none pr-8"
                  value={sortParam}
                  onChange={(e) => updateFilters("sort", e.target.value)}
                >
                  <option value="featured">{dictionary.shop.filters.sort.featured}</option>
                  <option value="new">{dictionary.shop.filters.sort.newest}</option>
                  <option value="price-low">{dictionary.shop.filters.sort.priceAsc}</option>
                  <option value="price-high">{dictionary.shop.filters.sort.priceDesc}</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--tissu-terracotta)]" />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              className="md:hidden w-full h-16 rounded-[20px] bg-white border border-[var(--border)] flex items-center justify-between px-6"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <span className="flex items-center gap-3 font-bold text-[var(--tissu-ink)]">
                <SlidersHorizontal className="w-5 h-5 text-[var(--tissu-terracotta)]" />
                {dictionary.shop.filters.mobile}
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-[var(--tissu-terracotta)] text-white text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-10">
              {categoryParam !== 'all' && (
                <FilterChip 
                  label={categories.find(c => c.val === categoryParam)?.label} 
                  onRemove={() => updateFilters('category', 'all')} 
                />
              )}
              {colorParam && (
                <FilterChip 
                  label={colorParam} 
                  onRemove={() => updateFilters('color', null)} 
                />
              )}
              <button 
                onClick={clearAllFilters}
                className="text-xs font-black text-[var(--tissu-terracotta)] hover:underline ml-2 uppercase tracking-widest"
              >
                {dictionary.shop.filters.clearAll}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3 space-y-12 sticky top-32 h-fit">
            
            {/* Categories */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">
                {dictionary.shop.filters.title}
              </h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.val}>
                    <button 
                      onClick={() => updateFilters('category', cat.val)}
                      className={`group flex items-center gap-4 text-[15px] font-bold transition-all ${
                        categoryParam === cat.val ? "text-[var(--tissu-terracotta)]" : "text-[var(--tissu-ink)] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all ${categoryParam === cat.val ? "bg-[var(--tissu-terracotta)] scale-125" : "bg-transparent scale-50 group-hover:bg-[var(--tissu-ink)]/20"}`} />
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px w-full border-t border-dashed border-[var(--border)]" />

            {/* Colors */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">
                {dictionary.shop.filters.colors}
              </h3>
              <div className="flex flex-wrap gap-5">
                {availableColors.map((color) => {
                  const isSelected = colorParam === color.name;
                  return (
                    <button 
                      key={color.name}
                      onClick={() => updateFilters('color', isSelected ? null : color.name)}
                      className={`group relative w-9 h-9 rounded-full border border-black/10 shadow-sm transition-all hover:scale-110 flex items-center justify-center ${isSelected ? 'ring-2 ring-[var(--tissu-terracotta)] ring-offset-4 ring-offset-[var(--tissu-cream)]' : ''}`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white mix-blend-difference" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[var(--tissu-ink)]/10 mb-8 border border-dashed border-[var(--border)]">
                  <Filter className="w-10 h-10" />
                </div>
                <p className="text-2xl font-serif text-[var(--tissu-ink)] mb-6">{dictionary.shop.empty}</p>
                <Button variant="outline" onClick={clearAllFilters} className="rounded-full h-14 px-10 border-[var(--tissu-ink)] text-[var(--tissu-ink)]">
                  {dictionary.shop.clearFilters}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-20">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} lang={lang} dictionary={dictionary} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-3xl font-serif text-[var(--tissu-ink)]">{dictionary.shop.filters.mobile}</h2>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-12 h-12 bg-white rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--tissu-ink)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-16">
                  {/* Category */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">{dictionary.shop.filters.title}</h3>
                    <div className="flex flex-col gap-4">
                      {categories.map((cat) => (
                        <button 
                          key={cat.val}
                          onClick={() => updateFilters('category', cat.val)}
                          className={`flex items-center justify-between p-6 rounded-[24px] border transition-all ${categoryParam === cat.val ? 'bg-white border-[var(--tissu-terracotta)] text-[var(--tissu-terracotta)] shadow-xl shadow-[var(--tissu-ink)]/5' : 'bg-white/50 border-[var(--border)] text-[var(--tissu-ink)]'}`}
                        >
                          <span className="font-bold text-lg">{cat.label}</span>
                          {categoryParam === cat.val && <Check className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">{dictionary.shop.filters.colors}</h3>
                    <div className="flex flex-wrap gap-5">
                      {availableColors.map((color) => {
                        const isSelected = colorParam === color.name;
                        return (
                          <button 
                            key={color.name}
                            onClick={() => updateFilters('color', isSelected ? null : color.name)}
                            className={`flex flex-col items-center gap-3`}
                          >
                            <div 
                              className={`w-14 h-14 rounded-full border border-black/5 flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-[var(--tissu-terracotta)] ring-offset-4 ring-offset-[var(--tissu-cream)]' : ''}`}
                              style={{ backgroundColor: color.code }}
                            >
                              {isSelected && <Check className="w-6 h-6 text-white mix-blend-difference" />}
                            </div>
                            <span className={`text-[10px] font-black transition-colors uppercase tracking-widest ${isSelected ? 'text-[var(--tissu-terracotta)]' : 'text-[var(--tissu-ink)] opacity-40'}`}>
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-dashed border-[var(--border)]">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full h-16 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] rounded-[20px] font-bold text-lg shadow-xl shadow-[var(--tissu-ink)]/10 active:scale-[0.98] transition-transform"
                >
                  {dictionary.common.confirm} ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string | undefined, onRemove: () => void }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-3 bg-[var(--tissu-terracotta)] text-white px-5 py-2 rounded-full text-[13px] font-bold shadow-lg shadow-[var(--tissu-terracotta)]/10">
      {label}
      <button onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
