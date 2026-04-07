"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreHydration } from "@/store/useHydration";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, Lock, User as UserIcon, CheckCircle2, CreditCard, Wallet, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { Order } from "@/lib/types";

interface CheckoutClientProps {
  lang: Locale;
  dictionary: any;
}

export default function CheckoutClient({ lang, dictionary }: CheckoutClientProps) {
  useStoreHydration();
  const router = useRouter();
  const { items, getSummary, clearCart, discount } = useCartStore();
  const { user, isAuthenticated, addOrder } = useAuthStore();
  const { subtotal, total, discountAmount, shipping } = getSummary();
  
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "Tbilisi",
    postal: "",
    notes: ""
  });

  // Auto-fill if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setFormData({
        email: user.email,
        phone: user.phone || defaultAddr?.phone || "",
        firstName: user.firstName,
        lastName: user.lastName,
        street: defaultAddr?.streetAddress || "",
        city: defaultAddr?.city || "Tbilisi",
        postal: "",
        notes: ""
      });
      setIsGuest(false);
    }
  }, [isAuthenticated, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = dictionary.validation.required;
    if (!formData.phone) newErrors.phone = dictionary.validation.required;
    if (!formData.firstName) newErrors.firstName = dictionary.validation.required;
    if (!formData.lastName) newErrors.lastName = dictionary.validation.required;
    if (!formData.street) newErrors.street = dictionary.validation.required;
    if (!formData.city) newErrors.city = dictionary.validation.required;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const orderPayloadItems = items.map(i => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.variant.price || i.product.price,
        productName: i.product.name,
        variantName: i.variant.color,
        image: i.product.images[0]
      }));

      const payload = {
        items: orderPayloadItems,
        subtotal,
        shipping,
        discount,
        total,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress: formData.street,
          city: formData.city,
          phone: formData.phone
        },
        paymentMethod: paymentMethod as string,
        isGuest
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Checkout failed");

      const data = await response.json();
      const newOrder = data.order;
      
      const formattedOrder: Order = {
        ...newOrder,
        shippingAddress: JSON.parse(newOrder.shippingAddress),
        items: newOrder.items.map((i: any) => ({
          ...i,
          productName: JSON.parse(i.productName),
          variantName: JSON.parse(i.variantName)
        }))
      };

      if (isAuthenticated) {
        addOrder(formattedOrder);
      }

      clearCart();
      router.push(`/${lang}/checkout/success?orderId=${newOrder.id}`);
    } catch (err) {
      console.error(err);
      router.push(`/${lang}/checkout/failed`);
    }
    
    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary mb-8">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif text-brand-dark mb-4">{dictionary.checkout.empty}</h1>
        <Button asChild variant="premium" size="lg" className="mt-8 rounded-2xl h-14">
          <Link href={`/${lang}/shop`}>{dictionary.checkout.returnShop}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        
        <header className="flex justify-between items-center mb-12 border-b border-border pb-8">
          <Link href={`/${lang}`} className="block hover:opacity-80 transition-opacity">
            <img src="/static/logo.svg" alt="Tissu Logo" className="h-8 md:h-10 w-auto" />
          </Link>
          <Link href={`/${lang}/cart`} className="text-sm font-bold text-brand-primary hover:text-brand-dark flex items-center transition-all bg-white px-4 py-2 rounded-xl border border-border/50 shadow-sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> {dictionary.checkout.returnCart}
          </Link>
        </header>

        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-16 lg:flex-row-reverse">
          
          {/* Order Summary Column */}
          <div className="lg:col-span-5 lg:order-2">
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-2xl shadow-brand-dark/[0.03] border border-border/40 sticky top-24">
              <h2 className="text-2xl font-serif font-medium text-brand-dark mb-8">{dictionary.checkout.summary}</h2>
              
              <div className="flex flex-col gap-6 mb-10 max-h-[45vh] overflow-y-auto pr-3 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5 items-center">
                    <div className="relative w-20 h-24 bg-brand-soft rounded-2xl overflow-hidden shrink-0 border border-border/40">
                      <Image 
                        src={item.product.images[0] || "/placeholder.jpg"} 
                        alt={item.product.name[lang] || item.product.name['ka']} 
                        fill 
                        className="object-cover" 
                      />
                      <div className="absolute -top-1 -right-1 bg-brand-dark text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-brand-dark line-clamp-1">{item.product.name[lang] || item.product.name['ka']}</h3>
                      <p className="text-xs font-medium text-muted-foreground mt-1 bg-brand-soft/50 w-fit px-2 py-0.5 rounded-md">
                        {item.variant.size} • {item.variant.color[lang] || item.variant.color['ka']}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-brand-dark">
                      {formatPrice((item.variant.price || item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-border/60 text-sm font-semibold">
                <div className="flex justify-between text-muted-foreground">
                  <span>{dictionary.checkout.subtotal}</span>
                  <span className="text-brand-dark">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>{dictionary.checkout.shippingC}</span>
                  <span className="text-brand-dark">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>{dictionary.checkout.discount}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-brand-dark/10 flex justify-between items-center text-2xl md:text-3xl font-serif font-bold text-brand-dark">
                <span>{dictionary.checkout.total}</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="mt-10 bg-brand-soft/30 rounded-[2rem] p-6 flex items-center gap-4 border border-brand-primary/5 shadow-sm">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-success shadow-sm shadow-success/10">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-[11px] md:text-xs text-brand-dark/70 font-bold leading-relaxed tracking-wide">
                  {lang === 'ka' ? "შენი შეკვეთა დაზღვეულია Tissu-ს გარანტიით." : "YOUR ORDER IS PROTECTED BY TISSU GUARANTEE."}
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 lg:order-1 flex flex-col gap-12">
            
            {/* Auth Toggle / Info */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-border shadow-sm shadow-brand-dark/[0.02]">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark">{user.firstName} {user.lastName}</p>
                      <p className="text-xs font-medium text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => useAuthStore.getState().logout()} className="text-xs font-bold text-brand-primary hover:underline bg-brand-primary/5 px-4 py-2 rounded-xl transition-colors">
                    {dictionary.account.sidebar.logout}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">{dictionary.checkout.loginToContinue}</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Get exclusive offers and faster delivery.</p>
                  </div>
                  <div className="flex gap-4">
                    <Button asChild size="sm" variant="premium" className="h-12 px-6 rounded-xl font-bold">
                      <Link href={`/${lang}/account/login`}>{dictionary.checkout.login}</Link>
                    </Button>
                    <Button onClick={() => setIsGuest(true)} size="sm" variant="outline" className="h-12 px-6 rounded-xl font-bold bg-white">
                      {dictionary.checkout.guestCheckout}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-medium text-brand-dark flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-dark text-white text-xs flex items-center justify-center font-bold">1</span>
                {dictionary.checkout.contact}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.email}</label>
                  <Input 
                    type="email" 
                    placeholder="hello@example.com" 
                    className={`bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10 ${errors.email ? 'border-destructive ring-1 ring-destructive/20' : ''}`} 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={isAuthenticated}
                  />
                  {errors.email && <p className="text-[10px] font-bold text-destructive ml-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.phone}</label>
                  <Input 
                    type="tel" 
                    placeholder="+995 5XX XXX XXX" 
                    className={`bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10 ${errors.phone ? 'border-destructive ring-1 ring-destructive/20' : ''}`} 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-destructive ml-1">{errors.phone}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-medium text-brand-dark flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-dark text-white text-xs flex items-center justify-center font-bold">2</span>
                {dictionary.checkout.address}
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.firstName}</label>
                  <Input 
                    placeholder={dictionary.checkout.firstName} 
                    className={`bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10 ${errors.firstName ? 'border-destructive ring-1 ring-destructive/20' : ''}`} 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.lastName}</label>
                  <Input 
                    placeholder={dictionary.checkout.lastName} 
                    className={`bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10 ${errors.lastName ? 'border-destructive ring-1 ring-destructive/20' : ''}`} 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.street}</label>
                <Input 
                  placeholder={dictionary.checkout.street} 
                  className={`bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10 ${errors.street ? 'border-destructive ring-1 ring-destructive/20' : ''}`} 
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.city}</label>
                  <Input 
                    placeholder={dictionary.checkout.city} 
                    className={`bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10 ${errors.city ? 'border-destructive ring-1 ring-destructive/20' : ''}`} 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">{dictionary.checkout.postal}</label>
                  <Input 
                    placeholder={dictionary.checkout.postal} 
                    className="bg-white h-14 rounded-2xl border-border px-6 focus:ring-brand-primary/10" 
                    value={formData.postal}
                    onChange={(e) => setFormData({...formData, postal: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-medium text-brand-dark flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-dark text-white text-xs flex items-center justify-center font-bold">3</span>
                {dictionary.checkout.shippingMethod}
              </h2>
              <div className="grid gap-5">
                <label className={`flex justify-between items-center p-6 border rounded-[1.5rem] cursor-pointer transition-all duration-500 shadow-sm ${shippingMethod === 'standard' ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20' : 'border-border/60 bg-white hover:border-brand-primary/40'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shippingMethod === 'standard' ? 'border-brand-primary' : 'border-border/60'}`}>
                      {shippingMethod === 'standard' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                    </div>
                    <input type="radio" name="shipping" className="hidden" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-brand-dark">{dictionary.checkout.standard}</span>
                      <span className="text-xs font-medium text-muted-foreground mt-0.5">{dictionary.checkout.standardDesc}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-brand-dark">{formatPrice(5)}</span>
                </label>

                <label className={`flex justify-between items-center p-6 border rounded-[1.5rem] cursor-pointer transition-all duration-500 shadow-sm ${shippingMethod === 'express' ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20' : 'border-border/60 bg-white hover:border-brand-primary/40'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${shippingMethod === 'express' ? 'border-brand-primary' : 'border-border/60'}`}>
                      {shippingMethod === 'express' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                    </div>
                    <input type="radio" name="shipping" className="hidden" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-brand-dark">{dictionary.checkout.express}</span>
                      <span className="text-xs font-medium text-muted-foreground mt-0.5">{dictionary.checkout.expressDesc}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-brand-dark">{formatPrice(15)}</span>
                </label>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif font-medium text-brand-dark flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-dark text-white text-xs flex items-center justify-center font-bold">4</span>
                {dictionary.checkout.payment}
              </h2>
              <p className="text-xs font-medium text-muted-foreground pl-11">{dictionary.checkout.secureMsg}</p>
              
              <div className="grid gap-0 border border-border/60 rounded-[2rem] bg-white overflow-hidden shadow-sm shadow-brand-dark/[0.03]">
                
                <div 
                  className={`flex items-center gap-4 p-6 cursor-pointer transition-colors border-b border-border/60 ${paymentMethod === 'card' ? 'bg-brand-primary/5' : 'hover:bg-brand-soft/20'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'border-brand-primary' : 'border-border/60'}`}>
                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <CreditCard className="w-5 h-5 text-brand-dark/70" />
                    <span className="font-bold text-sm text-brand-dark">{dictionary.checkout.card}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-muted rounded-md" />
                    <div className="w-8 h-5 bg-muted rounded-md" />
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="p-8 md:p-10 bg-brand-soft/10 grid gap-6 border-b border-border/60 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{dictionary.checkout.cardNumber}</label>
                      <Input placeholder="0000 0000 0000 0000" className="bg-white h-14 rounded-2xl border-border font-mono tracking-widest px-6" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{dictionary.checkout.expiryDate}</label>
                        <Input placeholder="MM / YY" className="bg-white h-14 rounded-2xl border-border px-6" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{dictionary.checkout.cvc}</label>
                        <Input placeholder="CVC" className="bg-white h-14 rounded-2xl border-border px-6" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{dictionary.checkout.nameCard}</label>
                      <Input placeholder="ANNA SMITH" className="bg-white h-14 rounded-2xl border-border px-6 uppercase" />
                    </div>
                  </div>
                )}

                <div 
                  className={`flex items-center gap-4 p-6 cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'bg-brand-primary/5' : 'hover:bg-brand-soft/20'}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cash' ? 'border-brand-primary' : 'border-border/60'}`}>
                    {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                  </div>
                  <Wallet className="w-5 h-5 text-brand-dark/70" />
                  <span className="font-bold text-sm text-brand-dark">{dictionary.checkout.cash}</span>
                </div>

              </div>
            </section>

            <div className="pt-8">
              <Button 
                onClick={handlePay}
                disabled={isSubmitting}
                size="lg" 
                variant="premium" 
                className="w-full h-20 text-xl font-serif tracking-wide shadow-2xl shadow-brand-primary/20 flex items-center justify-center gap-4 rounded-[1.5rem] disabled:opacity-70 disabled:cursor-not-allowed group transition-all duration-500"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
                    {dictionary.checkout.pay} {formatPrice(total)}
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-t border-border pt-12 pb-20 w-full mt-10">
              <Link href={`/${lang}/terms`} className="hover:text-brand-dark transition-colors">{dictionary.checkout.policies.refund}</Link>
              <Link href={`/${lang}/privacy`} className="hover:text-brand-dark transition-colors">{dictionary.checkout.policies.privacy}</Link>
              <Link href={`/${lang}/terms`} className="hover:text-brand-dark transition-colors">{dictionary.checkout.policies.terms}</Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
