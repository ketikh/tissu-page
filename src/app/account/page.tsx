"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Package, MapPin, User, Heart, Settings, LogOut } from "lucide-react";

export default function AccountDashboard() {
  return (
    <div className="container px-4 py-16 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-brand-dark font-medium mb-12 tracking-tight">My Account</h1>
      
      <div className="grid md:grid-cols-12 gap-12">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-3">
          <nav className="flex flex-col gap-2">
            <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-primary/10 text-brand-dark font-medium transition-colors">
              <User className="w-5 h-5 text-brand-primary" /> Profile Overview
            </Link>
            <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-brand-dark transition-colors">
              <Package className="w-5 h-5" /> Order History
            </Link>
            <Link href="/account/addresses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-brand-dark transition-colors">
              <MapPin className="w-5 h-5" /> Saved Addresses
            </Link>
            <Link href="/account/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-brand-dark transition-colors">
              <Heart className="w-5 h-5" /> Wishlist
            </Link>
            <Link href="/account/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-brand-dark transition-colors">
              <Settings className="w-5 h-5" /> Settings
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive mt-8 transition-colors">
              <LogOut className="w-5 h-5" /> Logout
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-9 space-y-8">
          
          {/* Welcome Card */}
          <div className="bg-brand-soft/30 rounded-3xl p-8 border border-brand-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-2xl font-serif text-brand-dark font-medium mb-1">Welcome back, Anna!</h2>
              <p className="text-muted-foreground text-sm">anna.smith@example.com</p>
            </div>
            <Button variant="outline" className="bg-white border-brand-primary/20 hover:border-brand-primary text-brand-dark">
              Edit Profile
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Orders Overview */}
            <div className="border border-border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Package className="w-5 h-5 text-brand-primary" /> Recent Order</h3>
                <Link href="/account/orders" className="text-sm text-brand-primary hover:underline font-medium">View all</Link>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border text-sm">
                  <div>
                    <span className="font-semibold block text-brand-dark">#TS-10928</span>
                    <span className="text-muted-foreground">Placed on Oct 24, 2026</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium inline-block px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs mb-1">Processing</span>
                    <span className="block font-semibold">149 ₾</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-16 bg-muted rounded overflow-hidden shrink-0"></div>
                  <div className="text-sm flex-1">
                    <p className="font-medium line-clamp-1">The Soft Wrap Sleeve</p>
                    <p className="text-muted-foreground text-xs pt-0.5">Oat / 14-inch</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">Track</Button>
                </div>
              </div>
            </div>

            {/* Default Address Overview */}
            <div className="border border-border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-brand-primary" /> Default Shipping</h3>
                <Link href="/account/addresses" className="text-sm text-brand-primary hover:underline font-medium">Manage</Link>
              </div>
              
              <div className="text-sm text-brand-dark/80 leading-relaxed bg-brand-soft/20 p-4 rounded-lg border border-brand-primary/5">
                <p className="font-semibold text-brand-dark mb-1">Anna Smith</p>
                <p>123 Rustaveli Avenue, Apt 45</p>
                <p>Tbilisi, 0108</p>
                <p>Georgia</p>
                <p className="mt-3 text-muted-foreground flex items-center gap-2"><Phone className="w-3 h-3"/> +995 5XX XXX XXX</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
