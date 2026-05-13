import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import Link from "next/link";
import Image from "next/image";

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  green: "#3f6f56",
  greenDeep: "#2c5640",
  champagne: "#c9a86c",
  rose: "#c4849a",
  teal: "#1e4d43",
};

const STEPS = [
  {
    num: "01",
    en: { title: "Source", body: "Water-resistant canvas from local mills. Colours chosen by season, texture by hand." },
    ka: { title: "ვარჩევთ", body: "წყალგაუმტარ ტილოს ადგილობრივი მომწოდებლებისგან. ფერი — სეზონით, ფაქტურა — ხელით." },
  },
  {
    num: "02",
    en: { title: "Pattern", body: "From paper templates we've refined for two years — always with two prints in mind." },
    ka: { title: "ვჭრით", body: "ქაღალდის თარგებით, რომლებსაც 2 წელია ვხვეწთ — ყოველთვის ორი პრინტის გათვალისწინებით." },
  },
  {
    num: "03",
    en: { title: "Stitch & line", body: "Two layers, one seam. Flip it — and the bag becomes a whole new friend." },
    ka: { title: "ვკერავთ", body: "ორი ფენა, ერთი ნაკერი. გადმოაბრუნებ — და ჩანთა ახალი მეგობარი ხდება." },
  },
  {
    num: "04",
    en: { title: "Wrap & send", body: "Wrapped in colourful paper, stickered, and sent off in a kraft-paper bag." },
    ka: { title: "ვფუთავთ", body: "ფერად ქაღალდში ვახვევთ, სტიკერს ვაკრავთ და კრაფტის ჩანთით გიგზავნით." },
  },
];

const FEATURES = [
  {
    icon: "💧",
    en: { title: "Water-resistant canvas", body: "Handles rain. Keeps what's inside dry." },
    ka: { title: "წყალგაუმტარი ტილო", body: "წვიმას გაუძლებს. შიგთავსს მშრალი ვუტოვებთ." },
  },
  {
    icon: "↺",
    en: { title: "Two sides, one bag", body: "One design outside, another inside." },
    ka: { title: "ორი მხარე, ერთი ჩანთა", body: "სხვა დიზაინი გარედან, სხვა შიგნიდან." },
  },
  {
    icon: "✦",
    en: { title: "Handmade", body: "Every stitch by a real human in Tbilisi." },
    ka: { title: "ხელით ნაკერი", body: "ყოველი ნემსი ცოცხალი ადამიანის ხელით." },
  },
  {
    icon: "★",
    en: { title: "Since 2023", body: "In a sunny Tbilisi studio." },
    ka: { title: "2023 წლიდან", body: "თბილისის მზიან სტუდიაში." },
  },
];

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  await getDictionary(locale);
  const isKa = locale === "ka";

  return (
    <div style={{
      background: "#fffcf5",
      backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
      backgroundSize: "26px 26px",
    }}>
      {/* Top stripe */}
      <div
        className="h-2 w-full"
        style={{ background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)" }}
        aria-hidden="true"
      />

      {/* ── Hero ── */}
      <section className="container pt-16 md:pt-24 pb-12 md:pb-20">
        <span
          className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em] mb-5"
          style={{ color: C.green, fontFamily: FRAUNCES }}
        >
          {isKa ? "ჩვენი ამბავი" : "Our story"}
        </span>

        <h1
          className="leading-[0.95] mb-6"
          style={{
            fontFamily: isKa ? ALK_LIFE : FRAUNCES,
            fontStyle: isKa ? "normal" : "italic",
            fontWeight: 900,
            fontSize: "clamp(38px, 6.5vw, 88px)",
            color: C.ink,
            maxWidth: 820,
          }}
        >
          {isKa ? (
            <>ერთი წყვილი ხელი,<br />თითო ჩანთა.</>
          ) : (
            <>One pair of hands,<br />one bag at a time.</>
          )}
        </h1>

        <p
          style={{
            fontFamily: FRAUNCES,
            fontStyle: "italic",
            fontSize: "clamp(15px, 1.5vw, 18px)",
            color: C.greenDeep,
            lineHeight: 1.7,
            maxWidth: 600,
          }}
        >
          {isKa
            ? "Tissu დაიწყო თბილისის მზიან სამზარეულოში — ერთი საკერავი მანქანა, წყალგაუმტარი ტილო და იდეა, რომ ჩანთამ ორჯერ მეტი უნდა შეეძლოს. დღემდე პატარები ვართ, ხელით ვკერავთ."
            : "Tissu started on a sunny Tbilisi kitchen table — one sewing machine, a roll of canvas, and the idea that a bag should work twice as hard. We're still small, still handmade."}
        </p>
      </section>

      {/* ── Teal feature strip ── */}
      <section className="relative w-full overflow-hidden py-14 md:py-20" style={{ background: C.teal }}>
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ background: "repeating-linear-gradient(90deg, #c9a86c 0 18px, #1e4d43 18px 36px)" }}
          aria-hidden="true"
        />

        <div className="container">
          <h2
            className="text-center mb-10"
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 52px)",
              color: C.cream,
            }}
          >
            {isKa ? "ერთი ჩანთა, ორი ცხოვრება." : "One bag, two lives."}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {FEATURES.map((f) => (
              <div
                key={f.en.title}
                className="flex flex-col gap-3 p-6"
                style={{ background: "rgba(255,255,255,0.07)", borderRadius: 24, border: `1.5px solid rgba(201,168,108,0.3)` }}
              >
                <span style={{ fontSize: 28, color: C.mustard }}>{f.icon}</span>
                <div
                  style={{ fontFamily: isKa ? ALK_LIFE : FRAUNCES, fontStyle: isKa ? "normal" : "italic", fontWeight: 700, fontSize: 16, color: C.cream }}
                >
                  {isKa ? f.ka.title : f.en.title}
                </div>
                <p style={{ fontFamily: FRAUNCES, fontSize: 12, color: C.champagne, lineHeight: 1.5 }}>
                  {isKa ? f.ka.body : f.en.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-2"
          style={{ background: "repeating-linear-gradient(90deg, #c9a86c 0 18px, #1e4d43 18px 36px)" }}
          aria-hidden="true"
        />
      </section>

      {/* ── How we make them ── */}
      <section id="process" className="container py-16 md:py-24">
        <div className="mb-10">
          <h2
            style={{
              fontFamily: isKa ? ALK_LIFE : FRAUNCES,
              fontStyle: isKa ? "normal" : "italic",
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 52px)",
              color: C.ink,
            }}
          >
            {isKa ? "როგორ ვქმნით." : "How we make them."}
          </h2>
          <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 15, color: C.champagne, marginTop: 8 }}>
            {isKa ? "ოთხი წყნარი ნაბიჯი — ტილოდან შენს კართან." : "Four quiet steps — from canvas roll to your doorstep."}
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const s = isKa ? step.ka : step.en;
            return (
              <div
                key={step.num}
                className="relative p-7 transition-transform hover:-translate-y-1 duration-300"
                style={{
                  background: C.beige,
                  borderRadius: 28,
                  border: `1.5px solid ${C.champagne}`,
                }}
              >
                <div
                  style={{ fontFamily: PACIFICO, fontSize: 52, color: C.mustard, lineHeight: 0.85, marginBottom: 16 }}
                >
                  {step.num}
                </div>
                <h4
                  style={{ fontFamily: isKa ? ALK_LIFE : FRAUNCES, fontStyle: isKa ? "normal" : "italic", fontWeight: 700, fontSize: 20, color: C.ink, marginBottom: 8 }}
                >
                  {s.title}
                </h4>
                <p style={{ fontFamily: FRAUNCES, fontSize: 13, color: C.greenDeep, lineHeight: 1.6 }}>
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Photo pair ── */}
      <section className="container pb-16 md:pb-24">
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          {[
            { src: "/static/landing-bag-blue.jpg", rotate: -4 },
            { src: "/static/landing-bag-yellow.jpg", rotate: 3 },
          ].map(({ src, rotate }) => (
            <div
              key={src}
              className="relative overflow-hidden shrink-0"
              style={{
                width: 220,
                height: 260,
                borderRadius: 20,
                transform: `rotate(${rotate}deg)`,
                border: `6px solid ${C.cream}`,
                boxShadow: `0 20px 40px rgba(42,29,20,0.18), 0 5px 0 ${C.mustardDeep}`,
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                style={{ filter: "saturate(0.92) sepia(0.04)" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative overflow-hidden py-14 md:py-20"
        style={{ background: C.ink }}
      >
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ background: "repeating-linear-gradient(90deg, #f3b62b 0 18px, #2a1d14 18px 36px)" }}
          aria-hidden="true"
        />

        <div className="container text-center flex flex-col items-center gap-6">
          <h2
            style={{
              fontFamily: isKa ? ALK_LIFE : PACIFICO,
              fontWeight: 400,
              fontSize: "clamp(28px, 4.5vw, 58px)",
              color: C.cream,
              lineHeight: 1.0,
            }}
          >
            {isKa ? "იპოვე შენი Tissu." : "Find your Tissu."}
          </h2>
          <p style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 16, color: C.champagne, maxWidth: 440 }}>
            {isKa
              ? "ქისები, ლეპტოპის გარსები, ტომრები, ყელსაბამები — ყველა ხელით ნაკერი."
              : "Pouches, laptop sleeves, totes, necklaces — all handmade."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2.5 font-extrabold text-[13px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              style={{
                fontFamily: FRAUNCES,
                fontWeight: 800,
                background: C.mustard,
                color: C.ink,
                borderRadius: 999,
                padding: "14px 32px",
                boxShadow: `0 5px 0 ${C.mustardDeep}`,
              }}
            >
              {isKa ? "მაღაზია" : "Shop the drop"}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2.5 font-bold text-[13px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: FRAUNCES,
                fontWeight: 700,
                background: "transparent",
                color: C.cream,
                borderRadius: 999,
                padding: "13px 30px",
                border: `1.5px solid ${C.champagne}`,
              }}
            >
              {isKa ? "მოგვწერე" : "Contact us"}
            </Link>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-2"
          style={{ background: "repeating-linear-gradient(90deg, #f3b62b 0 18px, #2a1d14 18px 36px)" }}
          aria-hidden="true"
        />
      </section>
    </div>
  );
}
