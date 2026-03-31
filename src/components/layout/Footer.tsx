import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-soft pt-16 pb-8 border-t border-brand-dark/20 mt-auto">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 lg:gap-12 pl-6 pr-6">
        {/* Brand Col */}
        <div className="md:col-span-1 space-y-6">
          <Link href="/" className="text-3xl font-serif tracking-widest font-semibold block">
            Tissu.
          </Link>
          <p className="text-sm text-brand-soft/70 max-w-xs leading-relaxed">
            Beautifully crafted textile lifestyle essentials. Designed to elevate your everyday routines.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-brand-soft/70 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-brand-soft/70 hover:text-white transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-brand-soft/70 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Links Col 1 */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Shop</h4>
          <ul className="space-y-3 text-sm text-brand-soft/70">
            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=laptop-sleeves" className="hover:text-white transition-colors">Laptop Sleeves</Link></li>
            <li><Link href="/shop?category=pouches" className="hover:text-white transition-colors">Pouches</Link></li>
            <li><Link href="/shop?sort=new" className="hover:text-white transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Links Col 2 */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Help</h4>
          <ul className="space-y-3 text-sm text-brand-soft/70">
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Shipping</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Newsletter Col */}
        <div className="space-y-4 md:col-span-1">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Stay Inspired</h4>
          <p className="text-sm text-brand-soft/70 leading-relaxed">
            Join our newsletter for early access to new collections and exclusive lifestyle pieces.
          </p>
          <form className="flex gap-2 mt-4" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="bg-white/10 border-transparent text-white placeholder:text-brand-soft/40 focus-visible:ring-brand-accent focus-visible:border-transparent rounded-sm rounded-r-none h-10"
            />
            <Button variant="premium" className="h-10 rounded-l-none whitespace-nowrap px-4 border border-brand-primary">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
      
      <div className="container mt-16 pt-8 border-t border-white/10 text-xs text-brand-soft/50 flex flex-col md:flex-row justify-between items-center px-6">
        <p>© {new Date().getFullYear()} Tissu. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
