import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/product/ProductCard";

export default function Home() {
  const featuredProducts = mockProducts.filter((p) => p.featured);

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Abstract/Image Background Placeholder */}
        <div className="absolute inset-0 bg-brand-primary/20 z-0">
          {/* <Image src="/hero-bg.jpg" alt="Hero background" fill className="object-cover opacity-60" priority /> */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        </div>
        
        <div className="container relative z-20 flex flex-col items-center text-center max-w-4xl px-4 py-32 mt-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-dark/80 mb-6 drop-shadow-sm">
            Introducing Tissu Essentials
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-brand-dark mb-8 leading-[1.1] tracking-tight">
            Elevate Your Everyday Essentials
          </h1>
          <p className="text-lg md:text-xl text-brand-dark/80 max-w-2xl text-balance mb-12 font-medium">
            Discover our collection of premium, handcrafted laptop sleeves and accessories designed for modern serenity. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" variant="premium" className="text-base h-14 px-8">
              <Link href="/shop">Shop Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base h-14 bg-white/80 backdrop-blur-sm border-brand-dark/20 text-brand-dark">
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-brand-dark font-medium">Featured Pieces</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Curated items from our core collection, blending timeless design with modern functionality.</p>
            </div>
            <Link href="/shop" className="hidden md:inline-flex items-center font-medium text-brand-primary hover:text-brand-dark transition-colors border-b border-brand-primary pb-1">
              View All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-12 md:hidden">
            <Button asChild variant="outline" className="w-full h-12">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Values / Editorial Section */}
      <section className="py-24 bg-brand-soft overflow-hidden">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-brand-dark leading-tight">
                Designed with intention, crafted with care.
              </h2>
              <p className="text-lg text-brand-dark/80 leading-relaxed font-medium">
                We believe that the objects we carry every day should bring us joy. Our designs strip away the unnecessary, leaving only beautiful materials and thoughtful details.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-brand-primary/20">
                <div className="space-y-2">
                  <h4 className="font-serif text-xl font-medium">Sustainable</h4>
                  <p className="text-sm text-brand-dark/70">Organic cottons and recycled materials.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-xl font-medium">Refined</h4>
                  <p className="text-sm text-brand-dark/70">Minimalist aesthetics without compromise.</p>
                </div>
              </div>
              
              <Button asChild variant="premium" className="mt-8">
                <Link href="/about">Discover Tissu</Link>
              </Button>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/5] bg-muted rounded-2xl overflow-hidden shadow-2xl">
              {/* <Image src="/story-image.jpg" alt="Tissu Craftsmanship" fill className="object-cover" /> */}
              <div className="absolute inset-0 bg-brand-primary/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
