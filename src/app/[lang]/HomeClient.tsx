"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { mockProducts, mockFAQs } from "@/lib/mock-data";
import { ProductCard } from "@/components/product/ProductCard";
import { Locale } from "@/i18n/config";
import { motion } from "framer-motion";
import { ChevronRight, Star, Heart, ShieldCheck, Truck, RefreshCw, Ruler } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface HomeProps {
  lang: Locale;
  dictionary: any;
}

export default function HomeClient({ lang, dictionary }: HomeProps) {
  const featuredProducts = mockProducts.filter((p) => p.featured).slice(0, 3);
  const faqPreview = mockFAQs.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] as const }
    }
  };

  const testimonials = [
    { quote: dictionary.home.testimonialSection.quote1, author: dictionary.home.testimonialSection.author1 },
    { quote: dictionary.home.testimonialSection.quote2, author: dictionary.home.testimonialSection.author2 },
  ];

  return (
    <div className="flex flex-col flex-1 bg-[#fcfbf9]">
      
      {/* Hero Section - Refined Editorial Layout */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/static/cover.jpg" 
            alt="Hero background" 
            fill 
            className="object-cover brightness-[0.9] transition-transform duration-[2s] scale-110 active:scale-100" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/30 via-transparent to-[#fcfbf9]" />
        </div>
        
        <motion.div 
          className="container relative z-20 flex flex-col items-center text-center max-w-5xl px-4 py-32"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.span 
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase px-6 py-2 rounded-full mb-8 shadow-xl"
          >
            {dictionary.home.hero.subtitle}
          </motion.span>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif text-white mb-8 leading-[0.95] tracking-tight drop-shadow-2xl"
          >
            {lang === 'ka' ? (
                <>ვქმნით <span className="italic text-brand-soft/80">სირბილეს</span><br/>თქვენი დღისთვის.</>
            ) : (
                <>Crafting <span className="italic text-brand-soft/80">softness</span><br/>for your tools.</>
            )}
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-white/90 max-w-2xl text-balance mb-12 font-medium leading-relaxed drop-shadow-md"
          >
            {dictionary.home.hero.description}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
            <Button asChild size="lg" variant="premium" className="text-base h-16 px-10 rounded-[1.5rem] shadow-2xl shadow-brand-dark/20 group">
              <Link href={`/${lang}/shop`} className="flex items-center gap-3">
                {dictionary.home.hero.cta}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base h-16 px-10 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-brand-dark transition-all rounded-[1.5rem]">
              <Link href={`/${lang}/about`}>{dictionary.nav.about}</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40"
        >
           <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{lang === 'ka' ? "ჩამოშალეთ" : "Scroll"}</span>
           <div className="w-px h-12 bg-white/20 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 w-full h-full bg-white origin-top"
                animate={{ scaleY: [0, 1, 0], y: [0, 48, 48] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
           </div>
        </motion.div>
      </section>

      {/* Featured Products - High Spacing editorial Grid */}
      <section className="py-32 bg-white border-y border-border/40">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="text-brand-primary text-xs font-bold uppercase tracking-[0.2em]">
                 {dictionary.home.bestsellersSection.subtitle}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-dark font-medium leading-tight">
                {dictionary.home.bestsellersSection.title}
              </h2>
            </div>
            <Link 
              href={`/${lang}/shop`} 
              className="group flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-brand-dark/60 hover:text-brand-primary transition-all pb-2 border-b border-border/60 hover:border-brand-primary"
            >
              {dictionary.common.viewAll}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {featuredProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <ProductCard product={product} lang={lang} dictionary={dictionary} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Value Section - Curated Storytelling */}
      <section className="py-32 bg-[#f8f6f2] overflow-hidden">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                <span className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-primary/10">
                  {dictionary.home.storySection.subtitle}
                </span>
                <h2 className="text-4xl md:text-6xl font-serif font-medium text-brand-dark leading-[1.1]">
                  {dictionary.home.storySection.title}
                </h2>
                <p className="text-xl text-brand-dark/70 leading-relaxed font-medium italic">
                  {dictionary.home.storySection.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t border-brand-primary/20">
                <div className="space-y-3">
                   <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-dark/5 text-brand-primary mb-4">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                  <h4 className="font-serif text-2xl font-medium text-brand-dark">{dictionary.home.features.premium.title}</h4>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">{dictionary.home.features.premium.description}</p>
                </div>
                <div className="space-y-3">
                   <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-dark/5 text-brand-primary mb-4">
                      <Heart className="w-5 h-5" />
                   </div>
                  <h4 className="font-serif text-2xl font-medium text-brand-dark">{dictionary.home.features.minimal.title}</h4>
                  <p className="text-sm text-brand-dark/60 leading-relaxed">{dictionary.home.features.minimal.description}</p>
                </div>
              </div>
              
              <div className="pt-8">
                <Button asChild variant="premium" size="lg" className="h-16 px-10 rounded-2xl group shadow-2xl shadow-brand-dark/[0.05]">
                  <Link href={`/${lang}/about`} className="flex items-center gap-3">
                    {dictionary.home.storySection.cta}
                    <Star className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-6 relative aspect-square md:aspect-[4/5] order-1 lg:order-2">
               <motion.div 
                 className="w-full h-full p-4 bg-white rounded-[3rem] shadow-2xl shadow-brand-dark/[0.05] relative z-10"
                 style={{ rotate: "2deg" }}
                 whileInView={{ rotate: 0 }}
                 transition={{ duration: 1 }}
               >
                 <Image src="/static/sleeve2.jpg" alt="Tissu Craftsmanship" fill className="object-cover rounded-[2.5rem]" />
               </motion.div>
               <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-[#fcfbf9] rounded-full blur-3xl opacity-60 z-0" />
               <div className="absolute bottom-[-5%] left-[-5%] w-[30%] aspect-square border border-brand-primary/20 rounded-full z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Testimonials Bar - Minimalist */}
      <section className="py-24 bg-brand-dark text-white text-center">
         <div className="container px-4 max-w-4xl mx-auto space-y-12">
            <div className="flex justify-center gap-1.5 color-brand-primary">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-brand-primary text-brand-primary" />)}
            </div>
            
            <div className="relative">
               <div className="text-3xl md:text-5xl font-serif italic text-white/95 leading-tight">
                  "{testimonials[0].quote}"
               </div>
               <div className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-white/40">
                  — {testimonials[0].author}
               </div>
            </div>
         </div>
      </section>

      {/* NEW: Size Guide Preview - Clean comparison */}
      <section className="py-32 bg-white overflow-hidden border-b border-border/40">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <span className="text-brand-primary text-xs font-bold uppercase tracking-[0.2em]">{dictionary.home.sizeGuideSection.title}</span>
             <h2 className="text-4xl md:text-6xl font-serif text-brand-dark">{dictionary.home.sizeGuideSection.subtitle}</h2>
          </div>

          <div className="grid md:grid-cols-12 gap-12 items-center">
             <div className="md:col-span-8 relative aspect-video bg-brand-soft/30 rounded-[3rem] border border-border/40 flex items-center justify-center p-8 overflow-hidden group">
                <div className="flex items-end gap-4 relative z-10 transition-transform duration-1000 group-hover:scale-105">
                   <div className="w-[180px] sm:w-[220px] aspect-[4/5] bg-white rounded-3xl shadow-2xl shadow-brand-dark/5 flex flex-col items-center justify-center border border-border/60">
                      <div className="w-full h-full relative p-4 flex flex-col items-center justify-center">
                         <div className="w-12 h-1 bg-brand-primary rounded-full mb-4" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">{dictionary.home.sizeGuideSection.small}</span>
                      </div>
                   </div>
                   <div className="w-[220px] sm:w-[280px] aspect-[4/5] bg-brand-soft rounded-3xl shadow-2xl shadow-brand-dark/10 flex flex-col items-center justify-center border border-white/80">
                      <div className="w-full h-full relative p-4 flex flex-col items-center justify-center">
                         <div className="w-16 h-1 bg-brand-primary/60 rounded-full mb-4" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">{dictionary.home.sizeGuideSection.large}</span>
                      </div>
                   </div>
                </div>
                <div className="absolute top-[10%] left-[5%] text-[12vw] font-serif text-brand-dark/[0.03] leading-none select-none">SIZE MATTERS</div>
             </div>
             
             <div className="md:col-span-4 space-y-8">
                <div className="p-8 bg-brand-soft rounded-[2rem] border border-border/40 space-y-6">
                   <div className="flex items-center gap-4 text-brand-dark font-serif text-2xl">
                      <Ruler className="w-6 h-6 text-brand-primary" />
                      <h4>{dictionary.home.sizeGuideSection.title}</h4>
                   </div>
                   <p className="text-brand-dark/60 text-sm leading-relaxed">
                      {dictionary.home.sizeGuideSection.description}
                   </p>
                   <ul className="space-y-3 pt-4 border-t border-border/60">
                      {[13, 14, 16].map(s => (
                         <li key={s} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-dark/70">
                            <span>Sleeve {s}"</span>
                            <span className="text-brand-primary">MacBook Pro/{s === 13 ? 'Air' : s}</span>
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* NEW: FAQ & Gallery sections could go here similarly... */}
      
      {/* Editorial Quote / Community */}
      <section className="py-32 bg-white">
        <div className="container px-4 text-center max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl md:text-7xl font-serif text-brand-dark leading-[1.05]">
                {lang === 'ka' ? "შეუერთდი მათ, ვინც აფასებს ხარისხს." : "Join those who value touch over fast fashion."}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild variant="premium" size="lg" className="rounded-2xl px-12 h-16 group">
                   <Link href={`/${lang}/shop`} className="flex items-center gap-3">
                      {dictionary.home.hero.cta}
                      <ShoppingBag className="w-5 h-5" />
                   </Link>
                </Button>
            </div>

            <div className="pt-20">
               <div className="flex items-center justify-center gap-4 mb-4">
                  <Instagram className="w-6 h-6 text-brand-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em]">{dictionary.home.gallerySection.subtitle}</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square bg-muted rounded-2xl overflow-hidden relative group">
                        <Image src={`/static/sleeve${i % 2 + 1}.jpg`} alt="Social feed" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
        </div>
      </section>

    </div>
  );
}

function Instagram(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function ShoppingBag(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
