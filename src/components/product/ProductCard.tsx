"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { ShoppingBag, Eye } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Locale } from "@/i18n/config";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  lang?: Locale;
  dictionary?: any;
}

export function ProductCard({ product, lang = 'ka', dictionary }: ProductCardProps) {
  const defaultVariant = product.variants.find(v => v.inStock) || product.variants[0];
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant && defaultVariant.inStock) {
      addItem(product, defaultVariant, 1);
      openCart();
    }
  };

  const name = product.name[lang] || product.name['ka'];
  const subtitle = product.subtitle[lang] || product.subtitle['ka'];

  return (
    <Link href={`/${lang}/product/${product.id}`} className="group block focus-ring">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-soft/30 mb-6 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand-dark/5">
        <Image
          src={product.images[0] || "/placeholder.jpg"}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        
        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {product.badges.map((badge, idx) => (
              <Badge key={idx} variant="premium" className="shadow-xl backdrop-blur-md bg-white/80 text-brand-dark border-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                {badge[lang] || badge['ka']}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Overlays */}
        <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors duration-500" />
        
        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-20">
          <button
            onClick={handleQuickAdd}
            disabled={!defaultVariant?.inStock}
            className="w-full bg-white text-brand-dark flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-primary hover:text-white transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            {defaultVariant?.inStock 
               ? (dictionary?.product?.quickAdd || (lang === 'ka' ? "დამატება" : "Quick Add"))
               : (lang === 'ka' ? "ამოიწურა" : "Out of Stock")
            }
          </button>
        </div>

        {/* View Details Hint */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0 z-20">
            <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-dark shadow-xl">
               <Eye className="w-4 h-4" />
            </div>
        </div>
      </div>

      <div className="space-y-3 px-2">
        <div className="flex justify-between items-start gap-4">
           <div className="space-y-1 flex-1">
             <h3 className="font-serif text-xl font-medium text-brand-dark leading-tight group-hover:text-brand-primary transition-colors">{name}</h3>
             <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 line-clamp-1">{subtitle}</p>
           </div>
           <div className="flex flex-col items-end font-bold text-sm text-brand-dark">
             {product.price && <span className={product.originalPrice ? "text-brand-primary" : ""}>{formatPrice(product.price)}</span>}
             {product.originalPrice && (
               <span className="text-[10px] text-brand-dark/30 line-through decoration-brand-dark/20 mt-0.5">
                 {formatPrice(product.originalPrice)}
               </span>
             )}
           </div>
        </div>
        
        {/* Colors available indicator - Premium refinement */}
        <div className="flex gap-2 pt-1">
          {product.variants.reduce((acc: string[], v) => {
             if (!acc.includes(v.colorCode)) acc.push(v.colorCode);
             return acc;
          }, []).map((colorCode, idx) => (
            <div 
              key={idx} 
              className="w-3.5 h-3.5 rounded-full border border-black/5 shadow-inner ring-1 ring-transparent group-hover:ring-brand-primary/20 transition-all"
              style={{ backgroundColor: colorCode }}
            />
          ))}
          {product.variants.length > 3 && (
             <span className="text-[10px] font-bold text-brand-dark/30 self-center">+{product.variants.length - 3}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
