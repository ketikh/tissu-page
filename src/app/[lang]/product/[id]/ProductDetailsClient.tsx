"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { formatPrice } from "@/lib/utils";
import { 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart,
  Maximize2,
  Info,
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
    <div className="bg-[#fcfbf9] min-h-screen">
      <div className="container px-4 py-8 md:py-16 max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-10 overflow-x-auto whitespace-nowrap pb-2">
          <Link href={`/${lang}`} className="hover:text-brand-primary transition-colors">{dictionary.product.breadcrumbHome}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${lang}/shop`} className="hover:text-brand-primary transition-colors">{dictionary.shop.title}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-dark/80">{name}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-12 xl:gap-20">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <motion.div 
                layoutId="activeImage"
                className="relative aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-dark/[0.03] border border-border/40 cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <Image 
                      src={product.images[activeImage] || "/placeholder.jpg"} 
                      alt={name} 
                      fill 
                      className="object-cover" 
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                <div className="absolute bottom-8 right-8 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </motion.div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border-2 transition-all duration-500 ${activeImage === idx ? "border-brand-primary scale-95 shadow-lg shadow-brand-primary/10" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}
                >
                  <Image src={img || "/placeholder.jpg"} alt={name} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Actions Section */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="mb-10">
              <div className="flex flex-wrap gap-3 mb-6">
                {product.badges.map((badge, idx) => (
                  <span key={idx} className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-primary/10">
                    {badge[lang] || badge['ka']}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-dark tracking-tight leading-tight mb-4">
                {name}
              </h1>
              <p className="text-xl text-muted-foreground font-medium mb-6">{subtitle}</p>
              
              <div className="flex items-center gap-6">
                <span className="text-3xl font-bold text-brand-dark">
                  {formatPrice(selectedVariant?.price || product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through decoration-brand-primary/30">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-brand-soft/50 px-3 py-1 rounded-full border border-border/50">
                    <Star className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" />
                    <span className="text-xs font-bold text-brand-dark">5.0</span>
                    <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-border/40 mb-10" />

            {/* Selectors Area */}
            <div className="space-y-10 mb-12">
              
              {/* Sizes */}
              {uniqueSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">{dictionary.product.size}</label>
                    <button className="text-[10px] font-bold text-brand-primary flex items-center gap-1.5 hover:underline">
                      <Info className="w-3 h-3" />
                      {dictionary.product.sizeGuide}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {uniqueSizes.map((size) => {
                      const variant = product.variants.find(v => v.size === size);
                      const isSelected = selectedVariant.size === size;
                      const isAvailable = product.variants.some(v => v.size === size && v.inStock);
                      
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedVariantId(variant?.id || "")}
                          disabled={!isAvailable}
                          className={`relative h-14 px-6 rounded-2xl border text-sm font-bold transition-all ${
                            isSelected 
                              ? "border-brand-dark bg-brand-dark text-white shadow-xl shadow-brand-dark/20" 
                              : isAvailable 
                                ? "border-border/60 bg-white text-brand-dark hover:border-brand-primary/50 hover:text-brand-primary" 
                                : "border-border/30 bg-muted/20 text-muted-foreground/40 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {size}
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-px bg-muted-foreground/30 -rotate-12" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors */}
              {uniqueColorsForCurrentSize.length > 0 && (
                <div className="space-y-5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">
                    {dictionary.product.color}: <span className="text-brand-dark ml-2">{selectedVariant.color[lang] || selectedVariant.color['ka']}</span>
                  </label>
                  <div className="flex flex-wrap gap-5">
                    {uniqueColorsForCurrentSize.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`group relative w-12 h-12 rounded-full border border-border shadow-sm transition-all hover:scale-110 flex items-center justify-center ${
                            isSelected ? "ring-2 ring-brand-primary ring-offset-4 scale-110 shadow-lg" : "hover:shadow-md"
                          }`}
                          style={{ backgroundColor: v.colorCode }}
                          disabled={!v.inStock}
                        >
                          {isSelected && <CheckIcon />}
                          {!v.inStock && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/10">
                              <X className="w-4 h-4 text-white/50" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/50">{dictionary.product.quantity}</label>
                <div className="flex items-center bg-white border border-border overflow-hidden rounded-[1.25rem] w-fit shadow-sm">
                  <button 
                    className="w-14 h-14 flex items-center justify-center text-brand-dark/40 hover:text-brand-primary hover:bg-brand-soft/20 transition-all disabled:opacity-20"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-brand-dark">{quantity}</span>
                  <button 
                    className="w-14 h-14 flex items-center justify-center text-brand-dark/40 hover:text-brand-primary hover:bg-brand-soft/20 transition-all"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                variant="premium" 
                className="flex-1 h-20 text-xl font-serif tracking-wide shadow-2xl shadow-brand-dark/[0.08] rounded-[1.5rem] group"
                onClick={handleAddToCart}
                disabled={!selectedVariant.inStock}
              >
                {!selectedVariant.inStock ? (
                  dictionary.product.soldOut
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    {dictionary.product.addToCart}
                  </>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-20 h-20 rounded-[1.5rem] bg-white border-border/60 hover:bg-brand-soft/20 group"
              >
                <Heart className="w-6 h-6 text-brand-dark group-hover:fill-brand-primary group-hover:text-brand-primary transition-all duration-300" />
              </Button>
            </div>

            {/* Delivery/Returns Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-white rounded-[2rem] border border-border/40 shadow-sm shadow-brand-dark/[0.02]">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark leading-tight">
                  {dictionary.product.trust.quality}
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark leading-tight">
                  {dictionary.product.trust.delivery}
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-dark leading-tight">
                  {dictionary.product.trust.returns}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details (Tabs Simulation) */}
        <div className="mt-32 max-w-4xl">
          <div className="flex gap-12 border-b border-border mb-12 overflow-x-auto pb-4 hide-scrollbar">
            {["description", "details", "shipping"].map((tab) => (
              <button 
                key={tab}
                className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark relative pb-4 transition-colors"
              >
                {dictionary.product.tabs[tab]}
                <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-primary" />
              </button>
            ))}
          </div>
          
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4 text-2xl font-serif text-brand-dark leading-snug">
                {lang === 'ka' ? "შექმნილია სირბილის მოყვარულთათვის" : "Crafted for those who value texture"}
              </div>
              <div className="md:col-span-8 space-y-6">
                <p className="text-brand-dark/70 leading-relaxed text-lg italic">
                  "{description}"
                </p>
                <div className="grid sm:grid-cols-2 gap-10 pt-10 border-t border-border/40">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-5">{dictionary.product.tabs.description}</h4>
                    <ul className="space-y-4">
                      {product.materials.map((mat, i) => (
                        <li key={i} className="text-sm font-bold text-brand-dark flex items-start gap-3">
                          <div className="w-1 h-1 rounded-full bg-brand-primary mt-2" />
                          {mat[lang] || mat['ka']}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-5">{dictionary.product.tabs.details}</h4>
                    <ul className="space-y-4">
                      {product.careInstructions.map((care, i) => (
                        <li key={i} className="text-sm font-medium text-brand-dark/70 flex items-start gap-3">
                           <div className="w-1 h-1 rounded-full bg-brand-primary/30 mt-2" />
                           {care[lang] || care['ka']}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-24 border-t border-border/40">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4">{dictionary.product.related}</h2>
                <p className="text-muted-foreground text-lg italic">{lang === 'ka' ? "აღმოაჩინე შენი შემდეგი ფავორიტი" : "Discover your next favorite"}</p>
              </div>
              <Button asChild variant="outline" className="hidden sm:flex rounded-2xl h-14 border-border/60 hover:bg-white hover:text-brand-primary group">
                <Link href={`/${lang}/shop`} className="flex items-center gap-2">
                  {dictionary.common.viewAll}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} dictionary={dictionary} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Overlay (Framer Motion) */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <button className="absolute top-8 right-8 p-4 bg-brand-soft rounded-2xl border border-border shadow-sm">
              <X className="w-6 h-6" />
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

function CheckIcon() {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg">
      <Check className="w-4 h-4 text-brand-dark" />
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
