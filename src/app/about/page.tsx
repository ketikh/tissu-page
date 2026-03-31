import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-brand-soft/30 min-h-screen">
      {/* Hero Section */}
      <section className="container max-w-5xl px-4 py-24 md:py-32 text-center">
        <span className="text-brand-primary uppercase tracking-widest text-xs font-semibold mb-6 block">Our Story</span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-dark mb-8 leading-[1.1] text-balance mx-auto cursor-default">
          Crafting essentials that soften the digital edge.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tissu began with a simple belief: the objects that carry our most important tools shouldn't feel cold or generic. They should be beautiful, tactile, and thoughtfully made.
        </p>
      </section>

      {/* Visual Block */}
      <section className="container max-w-6xl px-4 pb-24">
        <div className="relative aspect-[21/9] bg-brand-primary/10 rounded-3xl overflow-hidden">
          {/* <Image src="/about-hero.jpg" alt="Tissu Materials" fill className="object-cover" /> */}
          <div className="absolute inset-0 flex items-center justify-center text-brand-primary/40 font-serif text-3xl">Editorial Image Placeholder</div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-brand-dark text-brand-soft py-24 px-4 overflow-hidden">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-medium mb-8">The Philosophy of Softness</h2>
              <div className="space-y-6 text-brand-soft/80 text-lg leading-relaxed">
                <p>
                  In a world dominated by aluminum, glass, and harsh plastics, we wanted to introduce warmth. Your laptop is a portal to your work, your ideas, and your connections. The vessel that protects it should reflect that value.
                </p>
                <p>
                  We source premium textiles that feel alive—organic cottons that patina beautifully, rich linens that offer subtle texture, and felted cores that provide dense, lightweight protection.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] bg-white/5 rounded-2xl border border-white/10 overflow-hidden transform md:rotate-2 shadow-2xl">
               <div className="absolute inset-0 flex items-center justify-center text-white/20 font-serif">Detail Image</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Commitment */}
      <section className="container max-w-4xl px-4 py-32 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-brand-dark mb-10">Our Commitment to Quality</h2>
        <div className="grid md:grid-cols-3 gap-12 text-left mt-16">
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4">Conscious Materials</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We exclusively use GOTS-certified organic cotton and recycled PET padding to reduce our environmental footprint while maintaining ultimate softness.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4">Artisan Construction</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every detail matters. From reinforced stitching at stress points to hidden magnetic closures that won't scratch your device.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4">Georgia Based</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Designed in Tbilisi. We blend local inspiration with timeless minimalist design aesthetics to create a global product.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
