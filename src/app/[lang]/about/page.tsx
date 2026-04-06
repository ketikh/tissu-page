import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <div className="bg-brand-soft/30 min-h-screen">
      {/* Hero Section */}
      <section className="container max-w-5xl px-4 py-24 md:py-32 text-center">
        <span className="text-brand-primary uppercase tracking-widest text-xs font-semibold mb-6 block">
          {dictionary.about.tag}
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-brand-dark mb-8 leading-[1.1] text-balance mx-auto cursor-default">
          {dictionary.about.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {dictionary.about.desc1}
        </p>
      </section>

      {/* Visual Block Placeholder */}
      <section className="container max-w-6xl px-4 pb-24">
        <div className="relative aspect-[21/9] bg-brand-primary/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="absolute inset-0 flex items-center justify-center text-brand-primary/40 font-serif text-3xl">
            {dictionary.about.photo}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-brand-dark text-brand-soft py-24 px-4 overflow-hidden">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
                {dictionary.about.philTitle}
              </h2>
              <div className="space-y-8 text-brand-soft/80 text-lg leading-relaxed font-medium">
                <p>
                  {dictionary.about.philDesc1}
                </p>
                <p>
                  {dictionary.about.philDesc2}
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] bg-white/5 rounded-2xl border border-white/10 overflow-hidden transform md:rotate-2 shadow-2xl">
               <div className="absolute inset-0 flex items-center justify-center text-white/20 font-serif">
                {dictionary.about.detailPhoto}
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Commitment to Quality */}
      <section className="container max-w-5xl px-4 py-32 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-brand-dark mb-16 underline decoration-brand-primary/20 underline-offset-8">
          {dictionary.about.commitmentTitle}
        </h2>
        <div className="grid md:grid-cols-3 gap-12 text-left">
          <div className="space-y-6">
            <h3 className="text-xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4">
              {dictionary.about.quality1.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dictionary.about.quality1.desc}
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4">
              {dictionary.about.quality2.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dictionary.about.quality2.desc}
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-serif text-brand-dark border-b border-brand-primary/20 pb-4">
              {dictionary.about.quality3.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dictionary.about.quality3.desc}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
