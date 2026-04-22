"use client";

import Link from "next/link";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Globe, MessageCircle, Mail, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { CustomStar } from "../ui/CustomStar";
import { ShapeBlob } from "../ui/ShapeBlob";

interface FooterProps {
  dictionary: any;
}

export function Footer({ dictionary }: FooterProps) {
  const params = useParams();
  const lang = params.lang as string;

  return (
    <footer className="relative bg-brand-accent text-brand-dark pt-32 pb-12 overflow-hidden mt-20">
      {/* Wavy Divider at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(140%+1.3px)] h-[80px] fill-[#fffdfa]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120c68.32,19.34,142.16,11.51,210.61-7.23C259.6,104.22,298,80.76,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Decorative Blobs */}
      <ShapeBlob color="var(--color-pink)" size="lg" variant={1} className="absolute -bottom-20 -left-20 opacity-40 mix-blend-multiply" />
      <ShapeBlob color="var(--color-mint)" size="md" variant={2} className="absolute top-1/2 -right-20 opacity-30 mix-blend-multiply" />
      
      <div className="container relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 px-6">
        {/* Brand Col */}
        <div className="md:col-span-1 space-y-8">
          <Link href={`/${lang}`} className="flex items-center group">
            <img src="/static/logo.svg" alt="Tissu Logo" className="h-12 w-auto brightness-0 transition-transform group-hover:scale-110" />
          </Link>
          <p className="text-lg font-medium leading-relaxed font-sans">
            {dictionary.footer.shop.tagline}
          </p>
          <div className="flex gap-4">
            {[Globe, MessageCircle, Mail].map((Icon, idx) => (
              <a key={idx} href="#" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all hover:-translate-y-1 shadow-lg shadow-brand-dark/5" title="Social">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Links Col 1: Shop */}
        <div className="space-y-6">
          <h4 className="text-2xl font-serif font-black uppercase italic tracking-tighter">{dictionary.footer.shop.title}</h4>
          <ul className="space-y-4 font-sans font-bold">
            <li><Link href={`/${lang}/shop`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group"><CustomStar size={12} className="opacity-0 group-hover:opacity-100" /> {dictionary.footer.shop.all}</Link></li>
            <li><Link href={`/${lang}/shop?category=laptop-sleeves`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group"><CustomStar size={12} className="opacity-0 group-hover:opacity-100" /> {dictionary.footer.shop.sleeves}</Link></li>
            <li><Link href={`/${lang}/shop?category=pouches`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group"><CustomStar size={12} className="opacity-0 group-hover:opacity-100" /> {dictionary.footer.shop.accessories}</Link></li>
          </ul>
        </div>

        {/* Links Col 2: Help */}
        <div className="space-y-6">
          <h4 className="text-2xl font-serif font-black uppercase italic tracking-tighter">{dictionary.footer.help.title}</h4>
          <ul className="space-y-4 font-sans font-bold">
            <li><Link href={`/${lang}/faq`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group"><CustomStar size={12} className="opacity-0 group-hover:opacity-100" /> {dictionary.footer.help.faq}</Link></li>
            <li><Link href={`/${lang}/about`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group"><CustomStar size={12} className="opacity-0 group-hover:opacity-100" /> {dictionary.footer.about.story}</Link></li>
            <li><Link href={`/${lang}/contact`} className="hover:text-brand-primary transition-colors flex items-center gap-2 group"><CustomStar size={12} className="opacity-0 group-hover:opacity-100" /> {dictionary.footer.help.contact}</Link></li>
          </ul>
        </div>

        {/* Newsletter Col */}
        <div className="space-y-6 md:col-span-1">
          <h4 className="text-2xl font-serif font-black uppercase italic tracking-tighter">{dictionary.footer.newsletter.title}</h4>
          <p className="text-base font-medium leading-relaxed">
            {dictionary.footer.newsletter.subtitle}
          </p>
          <div className="relative group">
             <form className="flex flex-col gap-3 mt-6" onSubmit={(e) => e.preventDefault()}>
               <Input 
                 type="email" 
                 placeholder={dictionary.footer.newsletter.placeholder}
                 className="bg-white border-2 border-brand-dark/10 h-14 rounded-2xl px-6 focus:border-brand-primary"
               />
               <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white h-14 rounded-2xl font-black uppercase italic shadow-xl shadow-brand-primary/20">
                 {dictionary.footer.newsletter.button}
                 <Sparkles className="ml-2 w-4 h-4" />
               </Button>
             </form>
          </div>
        </div>
      </div>
      
      <div className="container relative z-10 mt-20 pt-8 border-t-2 border-brand-dark/10 flex flex-col md:flex-row justify-between items-center px-6 gap-6">
        <p className="text-sm font-bold opacity-60">{dictionary.footer.legal.copyright}</p>
        <div className="flex gap-8 text-sm font-bold opacity-60">
          <Link href={`/${lang}/privacy`} className="hover:text-brand-primary transition-colors">{dictionary.footer.legal.privacy}</Link>
          <Link href={`/${lang}/terms`} className="hover:text-brand-primary transition-colors">{dictionary.footer.legal.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
