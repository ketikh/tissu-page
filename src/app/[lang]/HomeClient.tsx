"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { mockProducts, mockFAQs } from "@/lib/mock-data";
import { ProductCard } from "@/components/product/ProductCard";
import { Locale } from "@/i18n/config";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Heart, ShieldCheck, Ruler, ShoppingBag, Sparkles } from "lucide-react";
import { ShapeBlob } from "@/components/ui/ShapeBlob";
import { Sticker } from "@/components/ui/Sticker";
import { CustomStar } from "@/components/ui/CustomStar";
import { DecorativeGraph } from "@/components/ui/DecorativeGraph";

interface HomeProps {
  lang: Locale;
  dictionary: any;
}

export default function HomeClient({ lang, dictionary }: HomeProps) {
  const featuredProducts = mockProducts.filter((p) => p.featured).slice(0, 3);

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
    <div className="flex flex-col flex-1 bg-[#fffdfa] overflow-hidden">
      
      {/* Bubbly Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32 bg-brand-primary overflow-hidden">
        <DecorativeGraph />
        <ShapeBlob color="var(--color-pink)" size="xl" variant={1} className="absolute -top-40 -left-40 opacity-40 mix-blend-multiply blur-3xl" />
        <ShapeBlob color="var(--color-yellow)" size="lg" variant={2} className="absolute top-1/4 -right-20 opacity-30 mix-blend-multiply blur-2xl" />
        
        <div className="container relative z-10 px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8"
          >
             <Sticker variant="pill" color="white" className="px-6 py-2 shadow-2xl flex items-center gap-2">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-soft" />)}
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-brand-dark">10K+ Happy Customers</span>
             </Sticker>
          </motion.div>

          <motion.h1 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-7xl sm:text-9xl md:text-[12rem] lg:text-[15rem] font-serif font-black text-white mb-12 leading-[0.8] tracking-tighter drop-shadow-2xl"
          >
            {lang === 'ka' ? (
                <>ფუმფულა <br/>ჩანთები</>
            ) : (
                <>PUFFY <br/>BAGS</>
            )}
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl font-black text-white/90 max-w-2xl mb-12 uppercase tracking-tight"
          >
            {dictionary.home.hero.description}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
            <Button asChild size="lg" className="h-20 px-12 rounded-full bg-white text-brand-primary hover:bg-white/90 text-2xl font-black uppercase italic shadow-2xl transition-transform hover:scale-105 active:scale-95">
              <Link href={`/${lang}/shop`}>{dictionary.home.hero.cta}</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-20 px-12 rounded-full border-4 border-white text-white hover:bg-white hover:text-brand-primary text-2xl font-black uppercase italic shadow-2xl transition-transform hover:scale-105 active:scale-95">
               {lang === 'ka' ? 'ნახე მეტი' : 'SEE MORE'}
            </Button>
          </motion.div>
        </div>

        <motion.div 
           className="absolute -bottom-20 right-[5%] w-1/3 max-w-[400px] aspect-square z-20 hidden lg:block"
           animate={{ y: [0, -20, 0], rotate: [2, -2, 2] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
           <div className="relative w-full h-full p-4 bg-white rounded-[4rem] shadow-2xl rotate-3">
              <Image src="/static/sleeve1.jpg" alt="Featured Puffy" fill className="object-cover rounded-[3.5rem]" />
           </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
           <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(110%+1.3px)] h-[100px] fill-[#fffdfa]">
              <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.83C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
           </svg>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-16 bg-brand-primary overflow-hidden whitespace-nowrap flex border-y-4 border-brand-dark">
        <motion.div 
          className="flex gap-16 items-center"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="flex gap-16 items-center">
              <span className="text-4xl md:text-6xl font-serif font-black text-white italic uppercase tracking-tighter">SOFT TOUCH</span>
              <CustomStar size={40} fill="white" className="rotate-12" />
              <span className="text-4xl md:text-6xl font-serif font-black text-white italic uppercase tracking-tighter">100% ORGANIC</span>
              <CustomStar size={40} fill="white" className="-rotate-12" />
              <span className="text-4xl md:text-6xl font-serif font-black text-white italic uppercase tracking-tighter">HANDMADE</span>
              <CustomStar size={40} fill="white" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-white relative">
        <div className="container px-4 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8 text-center md:text-left">
            <div className="space-y-6 max-w-2xl mx-auto md:mx-0">
              <span className="bg-brand-primary text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                 {dictionary.home.bestsellersSection.subtitle}
              </span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-brand-dark font-black tracking-tighter leading-none">
                {dictionary.home.bestsellersSection.title}
              </h2>
            </div>
            <Button asChild variant="premium" className="h-16 px-10 rounded-full font-black uppercase tracking-widest shadow-xl">
              <Link href={`/${lang}/shop`} className="flex items-center gap-3">
                {dictionary.common.viewAll}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {featuredProducts.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.8, type: "spring", stiffness: 100 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <ProductCard product={product} lang={lang} dictionary={dictionary} />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-full opacity-5 pointer-events-none">
           <DecorativeGraph />
        </div>
      </section>

      {/* Bubbly Story Section */}
      <section className="py-40 bg-brand-soft overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
           <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[100px] fill-white">
              <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.83C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
           </svg>
        </div>

        <div className="container px-4 max-w-7xl mx-auto relative z-10 pt-20">
          <div className="grid lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7 space-y-12 order-2 lg:order-1 text-center lg:text-left">
              <div className="space-y-8">
                <Sticker variant="wavy" color="var(--brand-primary)" rotate={-2} className="text-white text-sm px-8 py-3">
                  {dictionary.home.storySection.subtitle}
                </Sticker>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-brand-dark leading-[0.9] tracking-tighter italic">
                  {dictionary.home.storySection.title}
                </h2>
                <p className="text-2xl text-brand-dark/80 leading-relaxed font-black uppercase tracking-tight">
                  {dictionary.home.storySection.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t-4 border-brand-dark/10">
                <div className="space-y-4">
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-brand-primary mx-auto lg:mx-0">
                      <ShieldCheck className="w-8 h-8" />
                   </div>
                  <h4 className="font-serif text-3xl font-black text-brand-dark">{dictionary.home.features.premium.title}</h4>
                  <p className="text-base text-brand-dark/60 leading-relaxed font-bold">{dictionary.home.features.premium.description}</p>
                </div>
                <div className="space-y-4">
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl text-brand-primary mx-auto lg:mx-0">
                      <Heart className="w-8 h-8" />
                   </div>
                  <h4 className="font-serif text-3xl font-black text-brand-dark">{dictionary.home.features.minimal.title}</h4>
                  <p className="text-base text-brand-dark/60 leading-relaxed font-bold">{dictionary.home.features.minimal.description}</p>
                </div>
              </div>
              
              <div className="pt-8 text-center lg:text-left">
                <Button asChild size="lg" className="h-20 px-12 rounded-full bg-brand-primary text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform text-xl font-black uppercase tracking-widest">
                  <Link href={`/${lang}/about`} className="flex items-center gap-4">
                    {dictionary.home.storySection.cta}
                    <CustomStar size={24} className="hover:rotate-45 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative order-1 lg:order-2 flex items-center justify-center">
               <motion.div 
                 className="w-full aspect-[4/5] p-6 bg-white rounded-[5rem] shadow-2xl relative z-10"
                 style={{ rotate: "5deg" }}
                 whileInView={{ rotate: 0 }}
                 transition={{ duration: 1.2, type: "spring" }}
               >
                 <Image src="/static/sleeve2.jpg" alt="Tissu Craftsmanship" fill className="object-cover rounded-[4.5rem]" />
               </motion.div>
               <ShapeBlob color="var(--color-pink)" size="xl" variant={4} className="absolute -top-10 -right-20 opacity-40 blur-3xl z-0" />
               <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-accent rounded-full -z-10 shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-40 bg-white relative overflow-hidden">
         <div className="container px-4 max-w-5xl mx-auto space-y-16 relative z-10 text-center">
            <div className="flex justify-center gap-4">
               {[1,2,3,4,5].map(i => <CustomStar key={i} size={48} className="text-brand-primary drop-shadow-xl" />)}
            </div>
            <div className="relative">
               <div className="text-4xl md:text-7xl font-serif font-black italic text-brand-dark leading-[0.9] tracking-tighter">
                  "{testimonials[0].quote}"
               </div>
               <div className="mt-16">
                  <Sticker variant="ticket" color="var(--brand-primary)" className="text-white px-12 py-5 text-xl rotate-[-3deg] shadow-2xl mx-auto">
                    — {testimonials[0].author}
                  </Sticker>
               </div>
            </div>
         </div>
         <DecorativeGraph />
      </section>

      {/* Size Guide Preview */}
      <section className="py-32 bg-[#fffdfa] overflow-hidden border-b border-border/40 relative">
        <div className="container px-4 max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-20">
             <span className="bg-brand-soft text-brand-dark px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">{dictionary.home.sizeGuideSection.title}</span>
             <h2 className="text-5xl md:text-7xl font-serif text-brand-dark font-black tracking-tighter italic">{dictionary.home.sizeGuideSection.subtitle}</h2>
          </div>

          <div className="grid md:grid-cols-12 gap-12 items-center relative">
             <div className="md:col-span-8 relative aspect-video bg-white rounded-[4rem] border-4 border-brand-soft/20 shadow-2xl flex items-center justify-center p-8 overflow-hidden group">
                <div className="flex items-end gap-6 relative z-10 transition-transform duration-1000 group-hover:scale-105">
                   <div className="w-[180px] sm:w-[220px] aspect-[4/5] bg-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center border border-brand-soft/30 rotate-[-5deg]">
                       <Sticker variant="pill" color="var(--color-mint)" className="scale-75">{dictionary.home.sizeGuideSection.small}</Sticker>
                   </div>
                   <div className="w-[220px] sm:w-[280px] aspect-[4/5] bg-brand-soft/50 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center border-4 border-white rotate-[5deg]">
                       <Sticker variant="pill" color="var(--brand-primary)" className="text-white scale-90">{dictionary.home.sizeGuideSection.large}</Sticker>
                   </div>
                </div>
                <div className="absolute top-[10%] left-[5%] text-[10vw] font-serif text-brand-primary/[0.05] leading-none select-none italic font-black">COMFORT</div>
                <ShapeBlob color="var(--color-yellow)" size="lg" className="absolute -bottom-20 -right-20 opacity-30" />
             </div>
             
             <div className="md:col-span-4 space-y-8">
                <div className="p-8 bg-brand-soft/30 rounded-[3rem] border-4 border-white shadow-xl space-y-6">
                   <div className="flex items-center gap-4 text-brand-dark font-serif text-2xl font-black">
                      <Ruler className="w-8 h-8 text-brand-primary" />
                      <h4>{dictionary.home.sizeGuideSection.title}</h4>
                   </div>
                   <p className="text-brand-dark/60 text-base leading-relaxed font-bold">
                      {dictionary.home.sizeGuideSection.description}
                   </p>
                   <ul className="space-y-3 pt-4 border-t-2 border-brand-dark/10">
                      {[13, 14, 16].map(s => (
                         <li key={s} className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-brand-dark/70">
                            <span>Sleeve {s}"</span>
                            <span className="text-brand-primary">MacBook {s === 13 ? 'Air' : s}</span>
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Editorial Community Section */}
      <section className="py-40 bg-white">
        <div className="container px-4 text-center max-w-4xl mx-auto space-y-16">
            <h2 className="text-5xl md:text-8xl font-serif text-brand-dark leading-[0.9] font-black tracking-tighter italic">
                {lang === 'ka' ? "შეუერთდი მათ, ვინც აფასებს ხარისხს." : "JOIN THE PUFFY REVOLUTION."}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full px-12 h-20 bg-brand-primary text-white text-xl font-black uppercase tracking-widest shadow-2xl transition-transform hover:scale-105">
                   <Link href={`/${lang}/shop`} className="flex items-center gap-3">
                      {dictionary.home.hero.cta}
                      <ShoppingBag className="w-6 h-6" />
                   </Link>
                </Button>
            </div>

            <div className="pt-24">
               <div className="flex items-center justify-center gap-4 mb-8">
                  <CustomStar size={32} className="text-brand-primary" />
                  <span className="text-sm font-black uppercase tracking-[0.4em] text-brand-dark/50">{dictionary.home.gallerySection.subtitle}</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-square bg-muted rounded-[2.5rem] overflow-hidden relative group shadow-lg">
                        <Image src={`/static/sleeve${i % 2 + 1}.jpg`} alt="Social feed" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/20 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
        </div>
      </section>
    </div>
  );
}
