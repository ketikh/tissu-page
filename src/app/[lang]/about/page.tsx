import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Droplets, RotateCw, Heart } from "lucide-react";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  await getDictionary(locale);
  const isKa = locale === "ka";

  const heroTitleEn = (
    <>
      One <em className="not-italic italic text-[var(--tissu-terracotta)]">pair of hands</em>,
      <br /> one bag at a time.
    </>
  );
  const heroTitleKa = (
    <>
      ერთი <em className="not-italic italic text-[var(--tissu-terracotta)]">წყვილი ხელი</em>,
      <br /> თითო ჩანთა.
    </>
  );

  return (
    <div className="bg-[var(--tissu-cream)]">
      {/* Hero */}
      <section className="container pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
            <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
            {isKa ? "ჩვენი ამბავი" : "Our story"}
          </span>
          <h1 className="ka-display-xl font-serif text-[44px] sm:text-[60px] md:text-[78px] lg:text-[92px] leading-[1] tracking-[-0.02em] mt-6 mb-6 text-[var(--tissu-ink)]">
            {isKa ? heroTitleKa : heroTitleEn}
          </h1>
          <p className="text-[17px] md:text-[18px] leading-[1.6] text-[var(--tissu-ink-soft)] max-w-[620px]">
            {isKa
              ? "Tissu დაიწყო თბილისის მზიან სამზარეულოში კერვით — ერთი საკერავი მანქანა, წყალგაუმტარი ტილო და იდეა, რომ ერთ ჩანთას ორჯერ მეტი უნდა შეეძლოს. დღემდე პატარები ვართ, ხელით ვკერავთ და ყოველი ცალი ამბავს ატარებს."
              : "Tissu started on a sunny Tbilisi kitchen table — one sewing machine, a roll of water-resistant canvas, and the idea that a bag should work twice as hard. We're still small, still handmade, and every piece carries a story."}
          </p>
        </div>
      </section>

      {/* Two-sides strip */}
      <section className="container pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-[var(--tissu-cobalt)] text-[var(--tissu-cream)] px-6 py-12 md:px-14 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-5 opacity-[0.08] font-serif text-[220px] md:text-[300px] leading-none whitespace-nowrap"
          >
            TISSU · TISSU · TISSU
          </div>
          <div className="relative grid gap-12 items-center md:grid-cols-2">
            <div>
              <h2 className="ka-display-lg font-serif text-[32px] md:text-[44px] leading-[1.05] mb-5">
                {isKa ? (
                  <>
                    ერთი ჩანთა,{" "}
                    <em className="not-italic italic text-[var(--tissu-mustard)]">ორი</em> ცხოვრება.
                  </>
                ) : (
                  <>
                    One bag, <em className="not-italic italic text-[var(--tissu-mustard)]">two</em>{" "}
                    lives.
                  </>
                )}
              </h2>
              <p className="text-[17px] leading-[1.6] opacity-90 max-w-[500px]">
                {isKa
                  ? "ყველა Tissu ორმხრივია. გადმოაბრუნებ — და ჩანთას სხვა იერსახე აქვს: სხვა ფერი, სხვა ხასიათი. წვიმაშიც დარჩენილი მშრალია, რადგან ტილო წყალგაუმტარია."
                  : "Every Tissu is reversible. Flip it, and the bag changes personality: different colour, different mood. It stays dry in the rain because the canvas is water-resistant."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-full bg-[var(--tissu-mustard)] text-[var(--tissu-ink)] inline-flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="font-serif text-[22px] leading-tight">
                  {isKa ? "წყალგაუმტარი ტილო" : "Water-resistant canvas"}
                </div>
                <p className="text-[13px] opacity-80 leading-relaxed">
                  {isKa
                    ? "წვიმას გაუძლებს. შიგთავსს მშრალი ვუტოვებთ."
                    : "Handles rain. Keeps what's inside dry."}
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-full bg-[var(--tissu-mustard)] text-[var(--tissu-ink)] inline-flex items-center justify-center">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div className="font-serif text-[22px] leading-tight">
                  {isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag"}
                </div>
                <p className="text-[13px] opacity-80 leading-relaxed">
                  {isKa
                    ? "სხვა დიზაინი გარედან, სხვა შიგნიდან."
                    : "One design outside, another inside."}
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-full bg-[var(--tissu-mustard)] text-[var(--tissu-ink)] inline-flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="font-serif text-[22px] leading-tight">
                  {isKa ? "ხელით ნაკერი" : "Handmade"}
                </div>
                <p className="text-[13px] opacity-80 leading-relaxed">
                  {isKa
                    ? "ყოველი ნემსი ცოცხალი ადამიანის ხელით."
                    : "Every stitch by a real human."}
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-full bg-[var(--tissu-mustard)] text-[var(--tissu-ink)] inline-flex items-center justify-center font-serif text-[20px]">
                  ★
                </div>
                <div className="font-serif text-[22px] leading-tight">
                  {isKa ? "2023 წლიდან" : "Since 2023"}
                </div>
                <p className="text-[13px] opacity-80 leading-relaxed">
                  {isKa
                    ? "თბილისის მზიან სტუდიაში."
                    : "In a sunny Tbilisi studio."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="container py-10 md:py-16">
        <div className="max-w-2xl mb-12">
          <h2 className="ka-display-lg font-serif text-[36px] md:text-[52px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)]">
            {isKa ? (
              <>
                როგორ <em className="not-italic italic text-[var(--tissu-terracotta)]">ვქმნით</em>.
              </>
            ) : (
              <>
                How we <em className="not-italic italic text-[var(--tissu-terracotta)]">make</em> them.
              </>
            )}
          </h2>
          <p className="text-[16px] text-[var(--tissu-ink-soft)] mt-4">
            {isKa
              ? "ოთხი წყნარი ნაბიჯი — ტილოს რულონიდან შენს კართან."
              : "Four quiet steps — from canvas roll to your doorstep."}
          </p>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: isKa ? "ვარჩევთ" : "Source",
              body: isKa
                ? "წყალგაუმტარ ტილოს ადგილობრივი მომწოდებლებისგან. ფერი — სეზონით, ფაქტურა — ხელით."
                : "Water-resistant canvas from local mills. Colours chosen by season, texture by hand.",
            },
            {
              title: isKa ? "ვჭრით" : "Pattern",
              body: isKa
                ? "ქაღალდის თარგებით, რომლებსაც 2 წელია ვხვეწთ — ყოველთვის ორი პრინტის გათვალისწინებით."
                : "From paper templates we've refined for two years — always with two prints in mind.",
            },
            {
              title: isKa ? "ვკერავთ" : "Stitch & line",
              body: isKa
                ? "ორი ფენა, ერთი ნაკერი. გადმოაბრუნებ — და ჩანთა ახალი მეგობარი ხდება."
                : "Two layers, one seam. Flip it — and the bag becomes a whole new friend.",
            },
            {
              title: isKa ? "ვფუთავთ და ვაგზავნით" : "Wrap & send",
              body: isKa
                ? "ფერად ქაღალდში ვახვევთ, სტიკერს ვაკრავთ და კრაფტის ჩანთით გიგზავნით."
                : "Wrapped in colourful paper, stickered, and sent off in a kraft-paper bag.",
            },
          ].map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-[28px] bg-[var(--tissu-white)] border border-[#ead8bb] p-7 hover:-translate-y-1 hover:bg-[var(--tissu-mustard)] transition-[transform,background] duration-300"
            >
              <div className="font-serif text-[56px] leading-[0.9] text-[var(--tissu-terracotta)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h4 className="ka-display-md font-serif text-[22px] text-[var(--tissu-ink)] mt-4 mb-2.5">
                {step.title}
              </h4>
              <p className="text-[14px] leading-[1.5] text-[var(--tissu-ink-soft)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-6 py-12 md:px-14 md:py-16 text-center">
          <h2 className="ka-display-lg relative font-serif text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] mb-4">
            {isKa ? (
              <>
                იპოვე <em className="not-italic italic text-[var(--tissu-mustard)]">შენი</em> Tissu.
              </>
            ) : (
              <>
                Find <em className="not-italic italic text-[var(--tissu-mustard)]">your</em> Tissu.
              </>
            )}
          </h2>
          <p className="relative opacity-80 max-w-[520px] mx-auto mb-8">
            {isKa
              ? "ქისები, ლეპტოპის გარსები, ტომრები, ყელსაბამები — ყველა ხელით ნაკერი."
              : "Pouches, laptop sleeves, totes, necklaces — all handmade."}
          </p>
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <Link
              href={`/${lang}/shop`}
              className="inline-flex items-center gap-3 bg-[var(--tissu-terracotta)] text-white px-7 py-4 rounded-full font-extrabold text-[15px] tracking-[0.02em] hover:bg-[var(--tissu-mustard)] hover:text-[var(--tissu-ink)] transition-colors"
            >
              {isKa ? "მაღაზია" : "Shop the drop"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center px-7 py-4 rounded-full font-bold text-[15px] text-[var(--tissu-cream)] border-[1.5px] border-[var(--tissu-cream)] hover:bg-[var(--tissu-cream)] hover:text-[var(--tissu-ink)] transition-colors"
            >
              {isKa ? "მოგვწერე" : "Contact us"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
