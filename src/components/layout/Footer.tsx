"use client";

import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Globe, MessageCircle, Mail } from "lucide-react";
import { useParams } from "next/navigation";

interface FooterProps {
  dictionary: any;
}

export function Footer({ dictionary }: FooterProps) {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <footer className="bg-brand-dark text-brand-soft pt-16 pb-8 border-t border-brand-dark/20 mt-auto">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 lg:gap-12 px-6">
        {/* Brand Col */}
        <div className="md:col-span-1 space-y-6">
          <Link href={`/${lang}`} className="flex items-center">
            <img src="/static/logo.svg" alt="Tissu Logo" className="h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
          <p className="text-sm text-brand-soft/70 max-w-xs leading-relaxed">
            {dictionary.footer.shop.tagline}
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-brand-soft/70 hover:text-white transition-colors" title="Instagram">
              <Globe className="h-5 w-5" />
            </a>
            <a href="#" className="text-brand-soft/70 hover:text-white transition-colors" title="Facebook">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a href="#" className="text-brand-soft/70 hover:text-white transition-colors" title="Twitter">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Links Col 1: Shop */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">{dictionary.footer.shop.title}</h4>
          <ul className="space-y-3 text-sm text-brand-soft/70">
            <li><Link href={`/${lang}/shop`} className="hover:text-white transition-colors">{dictionary.footer.shop.all}</Link></li>
            <li><Link href={`/${lang}/shop?category=laptop-sleeves`} className="hover:text-white transition-colors">{dictionary.footer.shop.sleeves}</Link></li>
            <li><Link href={`/${lang}/shop?category=pouches`} className="hover:text-white transition-colors">{dictionary.footer.shop.accessories}</Link></li>
          </ul>
        </div>

        {/* Links Col 2: Help */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">{dictionary.footer.help.title}</h4>
          <ul className="space-y-3 text-sm text-brand-soft/70">
            <li><Link href={`/${lang}/faq`} className="hover:text-white transition-colors">{dictionary.footer.help.faq}</Link></li>
            <li><Link href={`/${lang}/about`} className="hover:text-white transition-colors">{dictionary.footer.about.story}</Link></li>
            <li><Link href={`/${lang}/contact`} className="hover:text-white transition-colors">{dictionary.footer.help.contact}</Link></li>
          </ul>
        </div>

        {/* Newsletter Col */}
        <div className="space-y-4 md:col-span-1">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-white">{dictionary.footer.newsletter.title}</h4>
          <p className="text-sm text-brand-soft/70 leading-relaxed">
            {dictionary.footer.newsletter.subtitle}
          </p>
          <form className="flex gap-2 mt-4" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder={dictionary.footer.newsletter.placeholder}
              className="bg-white/10 border-transparent text-white placeholder:text-brand-soft/40 focus-visible:ring-brand-accent focus-visible:border-transparent rounded-sm rounded-r-none h-10"
            />
            <Button variant="premium" className="h-10 rounded-l-none whitespace-nowrap px-4 border border-brand-primary">
              {dictionary.footer.newsletter.button}
            </Button>
          </form>
        </div>
      </div>
      
      <div className="container mt-16 pt-8 border-t border-white/10 text-xs text-brand-soft/50 flex flex-col md:flex-row justify-between items-center px-6">
        <p>{dictionary.footer.legal.copyright}</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href={`/${lang}/privacy`} className="hover:text-white">{dictionary.footer.legal.privacy}</Link>
          <Link href={`/${lang}/terms`} className="hover:text-white">{dictionary.footer.legal.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
