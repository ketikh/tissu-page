"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, User, Search } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";

export function Navbar() {
  const pathname = usePathname();
  const openCart = useUIStore((state) => state.openCart);
  const cartItemCount = useCartStore((state) => state.getSummary().itemsCount);

  const links = [
    { name: "Shop All", href: "/shop" },
    { name: "Best Sellers", href: "/shop?sort=featured" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden">
          <button className="p-2 -ml-2 text-foreground/80 hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-brand-primary ${
                pathname === link.href ? "text-brand-primary" : "text-foreground/80"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-2xl font-serif tracking-widest font-semibold text-brand-dark">
          Tissu.
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button className="text-foreground/80 hover:text-brand-primary transition-colors hidden sm:block">
            <Search className="w-[18px] h-[18px]" />
          </button>
          <Link href="/account" className="text-foreground/80 hover:text-brand-primary transition-colors">
            <User className="w-[18px] h-[18px]" />
          </Link>
          <button 
            onClick={openCart} 
            className="text-foreground/80 hover:text-brand-primary transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
