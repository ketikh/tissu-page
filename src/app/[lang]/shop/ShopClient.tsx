"use client";

import { useState, useMemo, useEffect } from "react";
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
  const sizeParam = searchParams.get("size");

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

    if (sizeParam) {
      result = result.filter((p) => 
        p.variants.some(v => v.size.toLowerCase() === sizeParam.toLowerCase())
      );
    }

    // Sorting
    if (sortParam === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortParam === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortParam === "new") {
      result.sort((a, b) => (a.badges.some(b => b.en === "New Collection") ? -1 : 1));
    } else if (sortParam === "featured") {
      result.sort((a, b) => (b.featured ? 1 : -1));
    }

    return result;
  }, [categoryParam, colorParam, sizeParam, sortParam, lang]);

  // Derived Filter Options
  const categories = [
    { label: dictionary.shop.title, val: "all" },
    { label: dictionary.footer.shop.sleeves, val: "laptop-sleeves" },
    { label: dictionary.footer.shop.accessories, val: "accessories" }
  ];

  const availableColors = useMemo(() => {
    const colors = new Map();
    mockProducts.forEach(p => p.variants.forEach(v => {
      colors.set(v.color[lang], v.colorCode);
    }));
    return Array.from(colors.entries()).map(([name, code]) => ({ name, code }));
  }, [lang]);

  const availableSizes = ["13-inch", "14-inch", "16-inch", "One Size", "Mini", "L"];

  const activeFiltersCount = (categoryParam !== 'all' ? 1 : 0) + (colorParam ? 1 : 0) + (sizeParam ? 1 : 0);

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      <div className="container px-4 py-8 md:py-16 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-5xl md:text-7xl font-serif text-brand-dark tracking-tight mb-4">
                {categoryParam === 'all' ? dictionary.shop.title : categories.find(c => c.val === categoryParam)?.label}
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                {dictionary.shop.subtitle}
              </p>
            </div>

            {/* Desktop Sort */}
            <div className="hidden md:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-border/50 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">
                {dictionary.shop.filters.sortBy}
              </span>
              <div className="relative">
                <select 
                  className="bg-transparent border-none text-sm font-bold text-brand-dark focus:ring-0 cursor-pointer appearance-none pr-6"
                  value={sortParam}
                  onChange={(e) => updateFilters("sort", e.target.value)}
                >
                  <option value="featured">{dictionary.shop.filters.sort.featured}</option>
                  <option value="new">{dictionary.shop.filters.sort.newest}</option>
                  <option value="price-low">{dictionary.shop.filters.sort.priceAsc}</option>
                  <option value="price-high">{dictionary.shop.filters.sort.priceDesc}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary" />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <Button 
              variant="outline" 
              className="md:hidden w-full h-14 rounded-2xl border-border bg-white flex items-center justify-between px-6"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <span className="flex items-center gap-2 font-bold text-brand-dark">
                <SlidersHorizontal className="w-5 h-5 text-brand-primary" />
                {dictionary.shop.filters.mobile}
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-brand-primary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 animate-in fade-in slide-in-from-top-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mr-2">
                {dictionary.shop.filters.active}:
              </span>
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
              {sizeParam && (
                <FilterChip 
                  label={sizeParam} 
                  onRemove={() => updateFilters('size', null)} 
                />
              )}
              <button 
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-brand-primary hover:underline ml-2"
              >
                {dictionary.shop.filters.clearAll}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3 space-y-12 sticky top-24 h-fit">
            
            {/* Categories */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                {dictionary.shop.filters.title}
              </h3>
              <ul className="space-y-3">
                {categories.map((cat) => (
                  <li key={cat.val}>
                    <button 
                      onClick={() => updateFilters('category', cat.val)}
                      className={`group flex items-center gap-3 text-sm font-bold transition-all ${
                        categoryParam === cat.val ? "text-brand-primary" : "text-brand-dark/60 hover:text-brand-dark"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${categoryParam === cat.val ? "bg-brand-primary scale-100" : "bg-transparent scale-0 group-hover:bg-brand-dark/20 group-hover:scale-100"}`} />
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colors */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                {dictionary.shop.filters.colors}
              </h3>
              <div className="flex flex-wrap gap-4">
                {availableColors.map((color) => {
                  const isSelected = colorParam === color.name;
                  return (
                    <button 
                      key={color.name}
                      onClick={() => updateFilters('color', isSelected ? null : color.name)}
                      className={`group relative w-7 h-7 rounded-full border border-border shadow-sm transition-all hover:scale-110 flex items-center justify-center ${isSelected ? 'ring-2 ring-brand-primary ring-offset-4' : ''}`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white mix-blend-difference" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                {dictionary.shop.filters.sizes}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {availableSizes.map((size) => {
                  const isSelected = sizeParam === size;
                  return (
                    <button 
                      key={size}
                      onClick={() => updateFilters('size', isSelected ? null : size)}
                      className={`px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        isSelected 
                          ? 'bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/20' 
                          : 'bg-white text-brand-dark/60 border-border/60 hover:border-brand-primary/40 hover:text-brand-dark'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary/30 mb-6">
                  <Filter className="w-8 h-8" />
                </div>
                <p className="text-lg font-serif text-brand-dark mb-4">{dictionary.shop.empty}</p>
                <Button variant="outline" onClick={clearAllFilters} className="rounded-2xl h-12 px-8">
                  {dictionary.shop.clearFilters}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-md bg-[#fcfbf9] z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 pb-32">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-serif text-brand-dark">{dictionary.shop.filters.mobile}</h2>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-3 bg-white rounded-2xl border border-border shadow-sm text-brand-dark/40 hover:text-brand-dark"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-12">
                  {/* Category */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">{dictionary.shop.filters.title}</h3>
                    <div className="flex flex-col gap-3">
                      {categories.map((cat) => (
                        <button 
                          key={cat.val}
                          onClick={() => updateFilters('category', cat.val)}
                          className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${categoryParam === cat.val ? 'bg-brand-primary/5 border-brand-primary text-brand-primary' : 'bg-white border-border/50 text-brand-dark'}`}
                        >
                          <span className="font-bold text-sm">{cat.label}</span>
                          {categoryParam === cat.val && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">{dictionary.shop.filters.colors}</h3>
                    <div className="flex flex-wrap gap-4">
                      {availableColors.map((color) => {
                        const isSelected = colorParam === color.name;
                        return (
                          <button 
                            key={color.name}
                            onClick={() => updateFilters('color', isSelected ? null : color.name)}
                            className={`flex flex-col items-center gap-2 group`}
                          >
                            <div 
                              className={`w-12 h-12 rounded-full border border-border transition-all flex items-center justify-center ${isSelected ? 'ring-2 ring-brand-primary ring-offset-4 scale-110 shadow-lg' : ''}`}
                              style={{ backgroundColor: color.code }}
                            >
                              {isSelected && <Check className="w-5 h-5 text-white mix-blend-difference" />}
                            </div>
                            <span className={`text-[10px] font-bold transition-colors ${isSelected ? 'text-brand-primary' : 'text-brand-dark/40'}`}>
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">{dictionary.shop.filters.sizes}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableSizes.map((size) => {
                        const isSelected = sizeParam === size;
                        return (
                          <button 
                            key={size}
                            onClick={() => updateFilters('size', isSelected ? null : size)}
                            className={`flex items-center justify-center p-5 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all ${isSelected ? 'bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20' : 'bg-white border-border/50 text-brand-dark'}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="fixed bottom-0 right-0 w-full p-8 bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9] to-transparent pt-12">
                <Button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  variant="premium" 
                  className="w-full h-16 rounded-[1.5rem] shadow-2xl shadow-brand-dark/10 text-lg"
                >
                  {dictionary.common.confirm} ({filteredProducts.length})
                </Button>
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
    <div className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold border border-brand-primary/10">
      {label}
      <button onClick={onRemove} className="hover:text-brand-dark transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
