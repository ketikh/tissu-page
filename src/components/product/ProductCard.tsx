"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = product.variants[0];
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant) {
      addItem(product, defaultVariant, 1);
      openCart();
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block focus-ring rounded-xl">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted mb-4">
        {/* Placeholder for real images. We use a fallback logic in next/image via unstyled img if needed, or rely on public folder placeholdler */}
        <Image
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} variant="premium" className="shadow-sm">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-background/95 backdrop-blur-md text-foreground flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm shadow-lg hover:bg-brand-primary hover:text-white transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      <div className="space-y-1 relative">
        <h3 className="font-serif text-lg font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.subtitle}</p>
        <div className="flex items-center gap-2 pt-1 font-medium text-sm text-foreground">
          {product.price && <span className={product.originalPrice ? "text-destructive" : ""}>{formatPrice(product.price)}</span>}
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        
        {/* Colors available indicator */}
        <div className="flex gap-1.5 pt-3">
          {product.variants.map((variant) => (
            <div 
              key={variant.id} 
              className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
              style={{ backgroundColor: variant.colorCode }}
              title={variant.color}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
