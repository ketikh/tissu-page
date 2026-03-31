"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Trash2, ChevronLeft, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSummary } = useCartStore();
  const { subtotal } = getSummary();

  if (items.length === 0) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-4xl font-serif text-brand-dark mb-6 tracking-tight">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-center">
          We noticed you haven't added anything to your cart yet. Discover our latest collection of premium laptop sleeves and lifestyle accessories.
        </p>
        <Button asChild variant="premium" size="lg" className="h-14 px-8 text-base">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-16">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/shop" className="hover:text-foreground flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl lg:text-5xl font-serif text-brand-dark mb-10 tracking-tight">Shopping Bag</h1>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Cart Header Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="flex flex-col gap-6">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4 border-b border-border">
                {/* Product Info */}
                <div className="md:col-span-6 flex gap-6">
                  <div className="relative w-24 md:w-32 aspect-[4/5] bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.product.images[0] || "/placeholder.jpg"} 
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${item.product.id}`} className="font-serif text-lg md:text-xl font-medium text-brand-dark hover:text-brand-primary line-clamp-2">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.variant.size} / {item.variant.color}
                    </p>
                    <p className="text-sm font-medium mt-2 md:hidden">
                      {formatPrice(item.variant.price || item.product.price)}
                    </p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 mt-4 w-max transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="md:col-span-3 flex md:justify-center">
                  <div className="flex items-center border border-border rounded-lg bg-card h-12 w-32">
                    <button 
                      className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted font-medium transition-colors rounded-l-lg"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-medium text-sm">{item.quantity}</span>
                    <button 
                      className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted font-medium transition-colors rounded-r-lg"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="md:col-span-3 hidden md:flex justify-end">
                  <span className="font-medium text-lg text-brand-dark">
                    {formatPrice((item.variant.price || item.product.price) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-brand-soft rounded-2xl p-6 lg:p-8 sticky top-24">
            <h2 className="text-2xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm font-medium mb-8">
              <div className="flex justify-between text-brand-dark/80">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-dark/80">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-brand-primary/20 pt-4 flex justify-between text-lg text-brand-dark">
                <span>Estimated Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Promo code" className="bg-white" />
                <Button variant="outline" className="bg-white border-border shrink-0">Apply</Button>
              </div>
              
              <Button asChild variant="premium" size="lg" className="w-full h-14 text-base mt-4 shadow-xl shadow-brand-dark/10">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-white">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-brand-dark">Secure Shopping</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
