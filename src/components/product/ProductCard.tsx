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
import { ShapeBlob } from "../ui/ShapeBlob";
import { Sticker } from "../ui/Sticker";

const blobColors = [
  "var(--color-pink)",
  "var(--color-mint)",
  "var(--color-yellow)",
  "var(--color-purple)",
  "var(--color-sky)",
];

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

  const blobColor = blobColors[parseInt(product.id.slice(-1)) % blobColors.length] || blobColors[0];

  return (
    <Link href={`/${lang}/product/${product.id}`} className="group block focus-ring relative">
      <div className="relative aspect-[4/5] overflow-visible mb-6 transition-all duration-500">
        
        {/* Background Blob */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 group-hover:scale-110 transition-transform duration-700">
           <ShapeBlob 
             color={blobColor} 
             size="lg" 
             variant={(parseInt(product.id.slice(-1)) % 4 + 1) as 1|2|3|4}
             className="opacity-60 blur-3xl"
           />
        </div>

        <div className="relative w-full h-full overflow-hidden rounded-[4rem] bg-white/40 backdrop-blur-sm border-2 border-white shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand-dark/5 group-hover:-translate-y-2">
            <Image
              src={product.images[0] || "/placeholder.jpg"}
              alt={name}
              fill
              className="object-contain p-8 transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            
            {/* Badges as Stickers */}
            {product.badges && product.badges.length > 0 && (
              <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                {product.badges.map((badge, idx) => (
                  <Sticker 
                    key={idx} 
                    variant={idx % 2 === 0 ? "wavy" : "pill"} 
                    color="white" 
                    rotate={idx % 2 === 0 ? -5 : 3}
                    className="text-[9px] px-4 py-2 border border-brand-dark/5"
                  >
                    {badge[lang] || badge['ka']}
                  </Sticker>
                ))}
              </div>
            )}

            {/* Action Overlays */}
            <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-20">
              <button
                onClick={handleQuickAdd}
                disabled={!defaultVariant?.inStock}
                className="w-full bg-brand-primary text-white flex items-center justify-center gap-3 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                {defaultVariant?.inStock 
                   ? (dictionary?.product?.quickAdd || (lang === 'ka' ? "დამატება" : "Quick Add"))
                   : (lang === 'ka' ? "ამოიწურა" : "Out of Stock")
                }
              </button>
            </div>
        </div>
      </div>

      <div className="space-y-3 px-2">
        <div className="flex justify-between items-start gap-4">
           <div className="space-y-1 flex-1">
             <h3 className="font-serif text-2xl font-black text-brand-dark leading-tight group-hover:text-brand-primary transition-colors">{name}</h3>
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
