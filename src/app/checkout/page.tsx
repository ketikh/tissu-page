"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, Lock } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, getSummary } = useCartStore();
  const { subtotal } = getSummary();
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Flat rate for shipping example
  const shippingCost = shippingMethod === "express" ? 15 : 5;
  const deliveryText = shippingMethod === "express" ? "1-2 Business Days" : "3-5 Business Days";
  const orderTotal = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container min-h-[50vh] flex flex-col items-center justify-center py-16">
        <h1 className="text-2xl font-serif">Checkout not available</h1>
        <p className="text-muted-foreground my-4">Your cart is empty.</p>
        <Button asChild><Link href="/shop">Return to Shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        
        {/* Simple Checkout Header */}
        <header className="flex justify-between items-center mb-8 border-b border-border pb-6">
          <Link href="/" className="text-3xl font-serif font-semibold text-brand-dark tracking-widest">
            Tissu.
          </Link>
          <Link href="/cart" className="text-sm font-medium text-brand-primary hover:text-brand-dark flex items-center transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Return to Cart
          </Link>
        </header>

        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-16 lg:flex-row-reverse">
          
          {/* Right Column: Order Summary (Shows on top on mobile) */}
          <div className="lg:col-span-5 lg:order-2 bg-brand-soft/50 rounded-2xl p-6 lg:p-8 h-max border border-brand-primary/10">
            <h2 className="text-xl font-serif font-medium text-brand-dark mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-20 bg-muted rounded-md overflow-hidden shrink-0 border border-brand-primary/10">
                    <Image src={item.product.images[0] || "/placeholder.jpg"} alt={item.product.name} fill className="object-cover" />
                    <div className="absolute -top-2 -right-2 bg-brand-dark text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-brand-dark line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.variant.size} / {item.variant.color}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice((item.variant.price || item.product.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-brand-primary/20 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-brand-dark">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping ({deliveryText})</span>
                <span className="font-medium text-brand-dark">{formatPrice(shippingCost)}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-brand-dark/10 flex justify-between items-center text-lg md:text-xl font-semibold text-brand-dark">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>

          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 lg:order-1 flex flex-col gap-10">
            
            {/* Contact Info */}
            <section className="space-y-5">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl font-serif font-medium text-brand-dark">Contact Information</h2>
                <span className="text-sm text-muted-foreground">Already have an account? <Link href="/account/login" className="text-brand-primary hover:underline">Log in</Link></span>
              </div>
              <Input type="email" placeholder="Email Address" required className="bg-white h-12" />
              <Input type="tel" placeholder="Phone Number (e.g. +995 5XX XXX XXX)" required className="bg-white h-12" />
            </section>

            {/* Shipping Info */}
            <section className="space-y-5">
              <h2 className="text-2xl font-serif font-medium text-brand-dark mb-2">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First Name" required className="bg-white h-12" />
                <Input placeholder="Last Name" required className="bg-white h-12" />
              </div>
              <Input placeholder="Street Address" required className="bg-white h-12" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="City (e.g. Tbilisi)" required className="bg-white h-12" />
                <Input placeholder="Postal Code" required className="bg-white h-12" />
              </div>
              <Input placeholder="Additional Notes (Optional)" className="bg-white h-12" />
            </section>

            {/* Shipping Method */}
            <section className="space-y-5">
              <h2 className="text-2xl font-serif font-medium text-brand-dark mb-2">Shipping Method</h2>
              <div className="grid gap-4">
                <label className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-brand-primary bg-brand-primary/5' : 'border-border bg-white hover:border-brand-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Standard Delivery</span>
                      <span className="text-xs text-muted-foreground">3-5 Business Days</span>
                    </div>
                  </div>
                  <span className="font-medium text-sm">{formatPrice(5)}</span>
                </label>

                <label className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-brand-primary bg-brand-primary/5' : 'border-border bg-white hover:border-brand-primary/50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Express Delivery</span>
                      <span className="text-xs text-muted-foreground">1-2 Business Days</span>
                    </div>
                  </div>
                  <span className="font-medium text-sm">{formatPrice(15)}</span>
                </label>
              </div>
            </section>

            {/* Payment Info Placeholer */}
            <section className="space-y-5">
              <h2 className="text-2xl font-serif font-medium text-brand-dark mb-2">Payment</h2>
              <p className="text-sm text-muted-foreground mb-4">All transactions are secure and encrypted.</p>
              
              <div className="grid gap-0 border border-border rounded-xl bg-white overflow-hidden shadow-sm">
                
                <label className={`flex items-center gap-3 p-4 border-b border-border cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-brand-primary/5' : 'hover:bg-muted/50'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" />
                  <span className="font-medium text-sm flex-1">Credit / Debit Card</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-muted rounded border border-border flex justify-center items-center text-[8px] font-bold">VISA</div>
                    <div className="w-8 h-5 bg-muted rounded border border-border flex justify-center items-center text-[8px] font-bold">MC</div>
                  </div>
                </label>
                
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-muted/30 grid gap-4 border-b border-border">
                    <Input placeholder="Card Number" className="bg-white" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="MM / YY" className="bg-white" />
                      <Input placeholder="CVC" className="bg-white" />
                    </div>
                    <Input placeholder="Name on Card" className="bg-white" />
                  </div>
                )}

                <label className={`flex items-center gap-3 p-4 border-b border-border cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'bg-brand-primary/5' : 'hover:bg-muted/50'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" />
                  <span className="font-medium text-sm">Cash on Delivery</span>
                </label>

              </div>
            </section>

            {/* Action */}
            <div className="pt-8">
              <Button size="lg" variant="premium" className="w-full h-14 text-lg tracking-wide shadow-xl flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Pay {formatPrice(orderTotal)}
              </Button>
            </div>

            <div className="flex justify-center text-xs text-muted-foreground space-x-4 border-t border-border pt-8 pb-12 w-full mt-4">
              <Link href="/terms" className="hover:text-brand-dark">Refund Policy</Link>
              <Link href="/privacy" className="hover:text-brand-dark">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-brand-dark">Terms of Service</Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
