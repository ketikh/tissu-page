"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { Locale } from "@/i18n/config";

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
      <div className="relative aspect-[4/5] mb-6 transition-all duration-500">
        <div className="relative w-full h-full overflow-hidden rounded-[28px] bg-[var(--tissu-white)] border border-dashed border-[var(--border)] transition-all duration-500 group-hover:shadow-[0_20px_50px_-20px_rgba(42,29,20,0.1)] group-hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--tissu-cream)]/30" />
          
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={name}
            fill
            className="object-contain p-10 transition-transform duration-1000 ease-out group-hover:scale-110"
          />
          
          {/* Badge */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-[var(--tissu-terracotta)] text-white text-[9px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase shadow-lg">
                {product.badges[0][lang] || product.badges[0]['ka']}
              </span>
            </div>
          )}

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
            <button
              onClick={handleQuickAdd}
              disabled={!defaultVariant?.inStock}
              className="w-full h-14 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] rounded-[20px] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--tissu-terracotta)] transition-colors disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {defaultVariant?.inStock ? (dictionary?.product?.addToCart || "ADD TO BAG") : (dictionary?.product?.soldOut || "SOLD OUT")}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="font-serif text-[22px] text-[var(--tissu-ink)] leading-none mb-1 group-hover:text-[var(--tissu-terracotta)] transition-colors">
              {name}
            </h3>
            <p className="text-[13px] text-[var(--tissu-ink-soft)] font-medium italic opacity-70">
              {subtitle}
            </p>
          </div>
          <div className="font-bold text-lg text-[var(--tissu-ink)]">
            {formatPrice(product.price)}
          </div>
        </div>
        
        <div className="flex gap-2.5 pt-2">
          {product.variants.reduce((acc: string[], v) => {
             if (!acc.includes(v.colorCode)) acc.push(v.colorCode);
             return acc;
          }, []).map((color, idx) => (
            <div 
              key={idx} 
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
