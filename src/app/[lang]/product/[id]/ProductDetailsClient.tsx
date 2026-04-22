"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { 
  ChevronRight, 
  ChevronLeft,
  Truck, 
  RefreshCw, 
  Star, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart,
  X,
  Check
} from "lucide-react";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailsClientProps {
  product: Product;
  lang: Locale;
  dictionary: any;
}

export function ProductDetailsClient({ product, lang, dictionary }: ProductDetailsClientProps) {
  useStoreHydration();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
      openCart();
    }
  };

  const name = product.name[lang] || product.name['ka'];
  const subtitle = product.subtitle[lang] || product.subtitle['ka'];
  const description = product.description[lang] || product.description['ka'];

  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));
  const uniqueColorsForCurrentSize = product.variants.filter(v => v.size === selectedVariant.size);

  const relatedProducts = useMemo(() => {
    return mockProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
  }, [product.id, product.category]);

  return (
    <div className="bg-[var(--tissu-cream)] min-h-screen">
      <div className="container px-6 py-12 md:py-20 max-w-7xl">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--tissu-ink)] opacity-40 mb-12 overflow-x-auto whitespace-nowrap pb-2">
          <Link href={`/${lang}`} className="hover:text-[var(--tissu-terracotta)] transition-colors">{dictionary.product.breadcrumbHome}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${lang}/shop`} className="hover:text-[var(--tissu-terracotta)] transition-colors">{dictionary.shop.title}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="opacity-100">{name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">
          
          {/* Gallery Section */}
          <div className="space-y-8">
            <div className="relative group overflow-hidden rounded-[40px] bg-white border border-dashed border-[var(--border)] aspect-[4/5] shadow-sm shadow-[var(--tissu-ink)]/5">
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full p-12 lg:p-20"
                onClick={() => setIsZoomed(true)}
              >
                <Image 
                  src={product.images[activeImage] || "/placeholder.jpg"} 
                  alt={name} 
                  fill 
                  className="object-contain p-12 transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in" 
                  priority
                />
              </motion.div>
              
              {/* Pagination Arrows for Mobile/Touch */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none md:hidden">
                 <button className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-auto">
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-auto">
                   <ChevronRight className="w-6 h-6" />
                 </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-28 aspect-[4/5] rounded-[24px] overflow-hidden bg-white border-2 transition-all shrink-0 ${activeImage === idx ? "border-[var(--tissu-terracotta)]" : "border-transparent opacity-40 hover:opacity-100"}`}
                >
                  <Image src={img || "/placeholder.jpg"} alt={name} fill className="object-cover p-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col pt-4">
            <div className="mb-12">
              <div className="flex flex-wrap gap-3 mb-8">
                {product.badges.map((badge, idx) => (
                  <span key={idx} className="bg-[var(--tissu-terracotta)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--tissu-terracotta)]/10">
                    {badge[lang] || badge['ka']}
                  </span>
                ))}
              </div>
              
              <h1 className="text-6xl md:text-7xl font-serif text-[var(--tissu-ink)] tracking-tight leading-none mb-8">
                {name}
              </h1>
              <p className="text-2xl text-[var(--tissu-ink-soft)] font-medium italic opacity-70 mb-10 leading-relaxed">{subtitle}</p>
              
              <div className="flex items-center gap-10">
                <span className="text-4xl font-bold text-[var(--tissu-ink)]">
                  {formatPrice(selectedVariant?.price || product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-[var(--tissu-ink-soft)] line-through opacity-40">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-[var(--border)]">
                  <Star className="w-4 h-4 fill-[var(--tissu-terracotta)] text-[var(--tissu-terracotta)]" />
                  <span className="text-sm font-black text-[var(--tissu-ink)]">5.0</span>
                  <span className="text-xs text-[var(--tissu-ink-soft)] opacity-60">(12)</span>
                </div>
              </div>
            </div>

            <div className="h-px w-full border-t border-dashed border-[var(--border)] mb-12" />

            {/* Selectors Area */}
            <div className="space-y-12 mb-16">
              
              {/* Sizes */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">{dictionary.product.size}</label>
                  <div className="flex flex-wrap gap-4">
                    {uniqueSizes.map((size) => {
                      const variant = product.variants.find(v => v.size === size);
                      const isSelected = selectedVariant.size === size;
                      const isAvailable = product.variants.some(v => v.size === size && v.inStock);
                      
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedVariantId(variant?.id || "")}
                          disabled={!isAvailable}
                          className={`min-w-[100px] h-16 px-8 rounded-[20px] border font-bold text-sm transition-all ${
                            isSelected 
                              ? "bg-[var(--tissu-ink)] text-[var(--tissu-cream)] border-[var(--tissu-ink)] shadow-xl shadow-[var(--tissu-ink)]/10" 
                              : isAvailable 
                                ? "bg-white border-[var(--border)] text-[var(--tissu-ink)] hover:border-[var(--tissu-terracotta)] hover:text-[var(--tissu-terracotta)]" 
                                : "bg-transparent border-[var(--border)]/30 text-[var(--tissu-ink)] opacity-20 cursor-not-allowed"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors */}
              {uniqueColorsForCurrentSize.length > 0 && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">
                    {dictionary.product.color}: <span className="text-[var(--tissu-ink)] opacity-100 ml-3 italic">{selectedVariant.color[lang] || selectedVariant.color['ka']}</span>
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {uniqueColorsForCurrentSize.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`group relative w-12 h-12 rounded-full border border-black/10 shadow-sm transition-all hover:scale-110 flex items-center justify-center ${
                            isSelected ? "ring-2 ring-[var(--tissu-terracotta)] ring-offset-4 ring-offset-[var(--tissu-cream)] scale-110" : ""
                          }`}
                          style={{ backgroundColor: v.colorCode }}
                          disabled={!v.inStock}
                        >
                          {isSelected && <Check className="w-5 h-5 text-white mix-blend-difference" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tissu-ink)] opacity-40">{dictionary.product.quantity}</label>
                <div className="flex items-center bg-white border border-[var(--border)] overflow-hidden rounded-full w-fit">
                  <button 
                    className="w-16 h-16 flex items-center justify-center text-[var(--tissu-ink)] opacity-40 hover:opacity-100 transition-opacity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-black text-xl text-[var(--tissu-ink)]">{quantity}</span>
                  <button 
                    className="w-16 h-16 flex items-center justify-center text-[var(--tissu-ink)] opacity-40 hover:opacity-100 transition-opacity"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-5 mb-16">
              <Button 
                size="lg" 
                className="flex-[3] h-20 text-xl font-serif rounded-[24px] bg-[var(--tissu-terracotta)] text-white hover:bg-[var(--tissu-ink)] transition-colors shadow-2xl shadow-[var(--tissu-terracotta)]/10 group"
                onClick={handleAddToCart}
                disabled={!selectedVariant.inStock}
              >
                {!selectedVariant.inStock ? (
                  dictionary.product.soldOut
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform" />
                    {dictionary.product.addToCart}
                  </>
                )}
              </Button>
              <button className="flex-1 max-w-[80px] h-20 rounded-[24px] bg-white border border-[var(--border)] flex items-center justify-center text-[var(--tissu-ink)] hover:text-[var(--tissu-terracotta)] transition-colors">
                <Heart className="w-7 h-7" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-8 p-10 bg-white/50 backdrop-blur-md rounded-[32px] border border-dashed border-[var(--border)]">
              <div className="flex flex-col items-center text-center gap-3">
                <Truck className="w-6 h-6 text-[var(--tissu-terracotta)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--tissu-ink)] opacity-60">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <RefreshCw className="w-6 h-6 text-[var(--tissu-terracotta)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--tissu-ink)] opacity-60">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Check className="w-6 h-6 text-[var(--tissu-terracotta)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--tissu-ink)] opacity-60">High Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-32 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-[var(--tissu-ink)] mb-10">Carefully Crafted</h2>
            <p className="text-xl text-[var(--tissu-ink-soft)] leading-relaxed italic opacity-80 mb-16 px-6">
              "{description}"
            </p>
            
            <div className="grid md:grid-cols-2 gap-20 text-left">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--tissu-terracotta)]">{dictionary.product.tabs.description}</h3>
                <ul className="space-y-4">
                  {product.materials.map((mat, i) => (
                    <li key={i} className="text-lg font-bold text-[var(--tissu-ink)] flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--tissu-terracotta)]" />
                      {mat[lang] || mat['ka']}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--tissu-terracotta)]">{dictionary.product.tabs.details}</h3>
                <ul className="space-y-4">
                  {product.careInstructions.map((care, i) => (
                    <li key={i} className="text-lg font-medium text-[var(--tissu-ink-soft)] opacity-70 flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                      {care[lang] || care['ka']}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-40 pt-24 border-t border-dashed border-[var(--border)]">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl md:text-6xl font-serif text-[var(--tissu-ink)] mb-6">Complete the vibe</h2>
                <p className="text-xl text-[var(--tissu-ink-soft)] italic opacity-60">Discover your next favorite piece</p>
              </div>
              <Link href={`/${lang}/shop`} className="hidden sm:flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[var(--tissu-terracotta)] hover:opacity-70 transition-opacity">
                {dictionary.common.viewAll}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} dictionary={dictionary} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-[40px] z-[200] flex items-center justify-center p-10 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <button className="absolute top-10 right-10 w-16 h-16 bg-white rounded-full border border-[var(--border)] shadow-xl flex items-center justify-center">
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full">
              <Image 
                src={product.images[activeImage] || "/placeholder.jpg"} 
                alt={name} 
                fill 
                className="object-contain" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
