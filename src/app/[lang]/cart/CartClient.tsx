"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Trash2, ChevronLeft, ShieldCheck, Tag, ArrowRight, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Locale } from "@/i18n/config";
import { mockProducts } from "@/lib/mock-data";

interface CartClientProps {
  dictionary: any;
  lang: Locale;
}

export default function CartClient({ dictionary, lang }: CartClientProps) {
  const { items, removeItem, updateQuantity, getSummary, applyPromoCode, discount } = useCartStore();
  const { subtotal, total, discountAmount, shipping } = getSummary();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleApplyPromo = () => {
    const success = applyPromoCode(promoCode);
    if (success) {
      setPromoSuccess(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoSuccess(false);
    }
  };

  // Filter recommendations (different from items in cart)
  const recommendations = mockProducts
    .filter(p => !items.some(item => item.productId === p.id))
    .slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="container min-h-[70vh] py-16 px-4 flex flex-col items-center">
        <div className="max-w-2xl w-full text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif text-brand-dark mb-6 tracking-tight">
            {dictionary.cartDrawer.empty}
          </h1>
          <p className="text-muted-foreground mb-10 text-lg">
            {dictionary.cartDrawer.discover}
          </p>
          <Button asChild variant="premium" size="lg" className="h-16 px-10 text-lg rounded-2xl shadow-xl shadow-brand-dark/10">
            <Link href={`/${lang}/shop`}>{dictionary.cartDrawer.continue}</Link>
          </Button>
        </div>

        {/* Recommendations */}
        <div className="w-full max-w-6xl mt-12">
          <h2 className="text-2xl font-serif text-brand-dark mb-8 text-center italic">
            {dictionary.cartDrawer.recommendations}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((product) => (
              <Link 
                key={product.id} 
                href={`/${lang}/product/${product.id}`}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-brand-dark/5 transition-all duration-500"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image 
                    src={product.images[0]} 
                    alt={product.name[lang] || product.name['ka']} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl text-brand-dark group-hover:text-brand-primary transition-colors">
                    {product.name[lang] || product.name['ka']}
                  </h3>
                  <p className="text-sm text-brand-dark/70 font-semibold mt-2">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      <div className="container px-4 py-8 md:py-16 max-w-7xl mx-auto">
        
        <div className="flex items-center gap-2 text-sm font-medium text-brand-primary mb-10 hover:translate-x-[-4px] transition-transform w-fit">
          <Link href={`/${lang}/shop`} className="flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {dictionary.cartDrawer.continue}
          </Link>
        </div>

        <h1 className="text-4xl lg:text-6xl font-serif text-brand-dark mb-12 tracking-tight">
          {dictionary.cartDrawer.title}
        </h1>

        <div className="grid lg:grid-cols-12 gap-12 xl:gap-20">
          
          {/* Items List */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
            {items.map((item) => {
              const name = item.product.name[lang] || item.product.name['ka'];
              const color = item.variant.color[lang] || item.variant.color['ka'];
              
              return (
                <div key={item.id} className="flex flex-col md:flex-row gap-6 md:gap-10 pb-10 border-b border-border/60 last:border-0 relative group">
                  {/* Product Image */}
                  <div className="relative w-full md:w-48 aspect-[4/5] bg-brand-soft rounded-3xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <Image 
                      src={item.product.images[0] || "/placeholder.jpg"} 
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link href={`/${lang}/product/${item.product.id}`} className="font-serif text-2xl md:text-3xl font-medium text-brand-dark hover:text-brand-primary transition-colors pr-8">
                          {name}
                        </Link>
                        <span className="text-xl font-bold text-brand-dark hidden md:block">
                          {formatPrice(item.variant.price || item.product.price)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mt-3 uppercase tracking-widest bg-brand-soft/50 w-fit px-3 py-1 rounded-full">
                        {item.variant.size} • {color}
                      </p>
                      
                      <p className="text-lg font-bold text-brand-dark mt-4 md:hidden">
                        {formatPrice(item.variant.price || item.product.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                      {/* Quantity Control */}
                      <div className="flex items-center bg-white border border-border shadow-sm rounded-2xl p-1 h-14 w-36">
                        <button 
                          className="w-10 h-10 flex items-center justify-center text-brand-dark/60 hover:text-brand-primary hover:bg-brand-soft/30 transition-colors rounded-xl"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center font-bold text-lg text-brand-dark">{item.quantity}</span>
                        <button 
                          className="w-10 h-10 flex items-center justify-center text-brand-dark/60 hover:text-brand-primary hover:bg-brand-soft/30 transition-colors rounded-xl"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all rounded-2xl group/del"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5 group-hover/del:scale-110" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-2xl shadow-brand-dark/[0.03] border border-border/40 sticky top-24">
              <h2 className="text-2xl md:text-3xl font-serif text-brand-dark border-b border-border pb-6 mb-8">
                {dictionary.checkout.orderSummary}
              </h2>
              
              <div className="space-y-5 text-sm font-semibold mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>{dictionary.checkout.subtotal}</span>
                  <span className="text-brand-dark">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>{dictionary.checkout.shippingC}</span>
                  <span className="text-brand-dark">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-success bg-success/5 p-3 rounded-xl border border-success/10 animate-in fade-in slide-in-from-top-1">
                    <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {dictionary.checkout.discount} ({discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-border pt-6 flex justify-between text-2xl md:text-3xl font-serif font-bold text-brand-dark">
                  <span>{dictionary.checkout.total}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code UI */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder={dictionary.cartDrawer.promo.placeholder} 
                      className={`bg-brand-soft/30 border-0 h-14 pl-12 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 ${promoError ? 'ring-2 ring-destructive/20' : ''}`}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo}
                    className="h-14 px-6 font-bold rounded-2xl border-border bg-white hover:bg-brand-soft/50 shadow-sm transition-all"
                  >
                    {dictionary.common.apply}
                  </Button>
                </div>
                {promoError && <p className="text-xs font-bold text-destructive px-1">{dictionary.cartDrawer.promo.error}</p>}
                {promoSuccess && <p className="text-xs font-bold text-success px-1">{dictionary.cartDrawer.promo.success}</p>}
              </div>
              
              <Button asChild variant="premium" size="lg" className="w-full h-16 text-lg rounded-2xl shadow-xl shadow-brand-dark/10 group">
                <Link href={`/${lang}/checkout`} className="flex items-center justify-center gap-2">
                  {dictionary.cartDrawer.checkout}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <div className="mt-10 flex items-start gap-4 p-5 rounded-[2rem] bg-[#fcfbf9] border border-border/50">
                <div className="p-2 bg-white rounded-full text-brand-primary shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">{dictionary.cartDrawer.secure}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                    {dictionary.checkout.secureMsg}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
