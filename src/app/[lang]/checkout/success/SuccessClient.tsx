"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin, Printer } from "lucide-react";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { useEffect, useState } from "react";
import { Order } from "@/lib/types";

interface SuccessClientProps {
  lang: Locale;
  dictionary: any;
  orderId?: string;
}

export default function SuccessClient({ lang, dictionary, orderId }: SuccessClientProps) {
  useStoreHydration();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && orderId) {
      const foundOrder = user.orders.find(o => o.id === orderId);
      if (foundOrder) setOrder(foundOrder);
    }
  }, [isAuthenticated, user, orderId]);

  return (
    <div className="bg-[#fcfbf9] min-h-screen py-16 px-4">
      <div className="container max-w-3xl mx-auto">
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-24 h-24 bg-success shadow-xl shadow-success/20 rounded-full flex items-center justify-center text-white mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4 tracking-tight">
            {dictionary.orderStatus.success.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {dictionary.orderStatus.success.subtitle}
          </p>
          {orderId && (
            <div className="mt-8 bg-brand-soft/50 py-3 px-6 rounded-2xl w-fit mx-auto border border-border/50">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                {dictionary.orderStatus.success.orderNumber}
              </span>
              <span className="text-2xl font-mono font-bold text-brand-dark">{orderId}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {isAuthenticated ? (
            <Button asChild variant="premium" size="lg" className="h-16 rounded-2xl shadow-xl shadow-brand-dark/5">
              <Link href={`/${lang}/account`} className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {dictionary.orderStatus.success.track}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="premium" size="lg" className="h-16 rounded-2xl shadow-xl shadow-brand-dark/5">
              <Link href={`/${lang}/account/register`} className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {lang === 'ka' ? 'შექმენით ანგარიში' : 'Create an Account'}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="h-16 rounded-2xl bg-white border-border/80 hover:bg-brand-soft/50 group">
            <Link href={`/${lang}/shop`} className="flex items-center justify-center gap-2">
              {dictionary.orderStatus.success.continue}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Summary Card */}
        {order && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-brand-dark/[0.02] border border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
              <h2 className="text-2xl font-serif text-brand-dark">{dictionary.orderStatus.success.details}</h2>
              <button 
                onClick={() => window.print()}
                className="text-xs font-bold text-brand-primary flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <Printer className="w-4 h-4" />
                {lang === 'ka' ? 'ამობეჭდვა' : 'Print'}
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {order.items.map((item, idx) => {
                const name = item.productName[lang] || item.productName['ka'];
                const variant = item.variantName[lang] || item.variantName['ka'];
                return (
                  <div key={idx} className="flex gap-5 items-center">
                    <div className="relative w-16 h-20 bg-brand-soft rounded-xl overflow-hidden shrink-0">
                      <Image src={item.image} alt={name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-brand-dark line-clamp-1">{name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{variant} × {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-brand-dark">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-dark/70">
                  <MapPin className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">{dictionary.checkout.address}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                  {order.shippingAddress.streetAddress}, {order.shippingAddress.city}<br />
                  {order.shippingAddress.phone}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-dark/70">
                  <Package className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">{dictionary.checkout.payment}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {order.paymentMethod === 'card' ? dictionary.checkout.card : dictionary.checkout.cash}
                </p>
                <div className="pt-4 border-t border-border flex justify-between items-center text-xl font-bold text-brand-dark">
                  <span>{dictionary.checkout.total}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
