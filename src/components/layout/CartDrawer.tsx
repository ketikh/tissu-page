"use client";

import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Locale } from "@/i18n/config";
import { useStoreHydration } from "@/store/useHydration";

interface CartDrawerProps {
  dictionary: any;
  lang: Locale;
}

export function CartDrawer({ dictionary, lang }: CartDrawerProps) {
  useStoreHydration();
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, getSummary } = useCartStore();
  const { subtotal } = getSummary();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-serif font-semibold tracking-wide">{dictionary.cartDrawer.title}</h2>
          <button 
            onClick={closeCart}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-serif">{dictionary.cartDrawer.empty}</p>
                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto text-balance">
                  {dictionary.cartDrawer.discover}
                </p>
              </div>
              <Button onClick={closeCart} asChild variant="premium">
                <Link href={`/${lang}/shop`}>{dictionary.cartDrawer.continue}</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="relative w-20 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <Image 
                    src={item.product.images[0] || "/placeholder.jpg"} 
                    alt={item.product.name[lang] || item.product.name['ka']}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-medium text-sm leading-tight text-foreground pr-4">
                        {item.product.name[lang] || item.product.name['ka']}
                      </h3>
                      <button 
            onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.variant.color[lang] || item.variant.color['ka']} / {item.variant.size}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-md px-2 py-1 bg-background">
                      <button 
                        className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground text-lg"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button 
                        className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground text-lg"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="font-medium text-sm text-foreground">
                      {formatPrice((item.variant.price || item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground font-medium">{dictionary.cartDrawer.subtotal}</span>
              <span className="text-lg font-serif font-bold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {dictionary.cartDrawer.shipping}
            </p>
            <Button asChild onClick={closeCart} className="w-full h-12 text-base font-medium rounded-xl shadow-xl shadow-brand-primary/10">
              <Link href={`/${lang}/checkout`}>{dictionary.cartDrawer.checkout}</Link>
            </Button>
            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest pt-2">
              • {dictionary.cartDrawer.secure} •
            </p>
          </div>
        )}
      </div>
    </>
  );
}
