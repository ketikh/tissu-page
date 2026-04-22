"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag, Sun } from "lucide-react";
import { Locale } from "@/i18n/config";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

interface HomeProps {
  lang: Locale;
  dictionary: any;
}

type ProductTag = "pouch" | "laptop" | "bag" | "new";

interface LandingProduct {
  id: number;
  name: { en: string; ka: string };
  price: number;
  img: string;
  tags: ProductTag[];
  badge?: { label: { en: string; ka: string }; tone: "ink" | "mustard" | "cobalt" };
  colors: string[];
  sub: { en: string; ka: string };
}

const IMG_BLUE = "/static/landing-bag-blue.jpg";
const IMG_YELLOW = "/static/landing-bag-yellow.jpg";
const IMG_STRIPED = "/static/landing-bag-striped.png";

const products: LandingProduct[] = [
  {
    id: 1,
    name: { en: "Blueberry quilted pouch", ka: "მოცვისფერი ქვილტინგ ჩანთა" },
    price: 85,
    img: IMG_BLUE,
    tags: ["pouch", "new"],
    badge: { label: { en: "NEW", ka: "ახალი" }, tone: "cobalt" },
    colors: ["#264ba0", "#e8b23a", "#b89bd9"],
    sub: { en: "Small · cotton", ka: "პატარა · ბამბა" },
  },
  {
    id: 2,
    name: { en: "Lemon quilted pouch", ka: "ლიმონისფერი ქვილტინგ ჩანთა" },
    price: 85,
    img: IMG_YELLOW,
    tags: ["pouch"],
    badge: { label: { en: "BESTSELLER", ka: "ბესტსელერი" }, tone: "mustard" },
    colors: ["#e8b23a", "#f65c32", "#264ba0"],
    sub: { en: "Small · cotton", ka: "პატარა · ბამბა" },
  },
  {
    id: 3,
    name: { en: "Stripe laptop sleeve", ka: "ზოლიანი ლეპტოპის ქერქი" },
    price: 140,
    img: IMG_STRIPED,
    tags: ["laptop"],
    colors: ["#e8b23a", "#264ba0", "#b89bd9"],
    sub: { en: '13" · padded', ka: '13" · რბილი შიგთავსი' },
  },
  {
    id: 4,
    name: { en: "Mustard mini tote", ka: "ხახვისფერი მინი თოუთი" },
    price: 120,
    img: IMG_YELLOW,
    tags: ["bag"],
    colors: ["#e8b23a", "#264ba0"],
    sub: { en: "Medium · cotton canvas", ka: "საშუალო · ბამბის კანვა" },
  },
  {
    id: 5,
    name: { en: "Cobalt crossbody", ka: "კობალტის კროსბოდი" },
    price: 165,
    img: IMG_BLUE,
    tags: ["bag", "new"],
    badge: { label: { en: "NEW", ka: "ახალი" }, tone: "cobalt" },
    colors: ["#264ba0", "#2a1d14", "#e8b23a"],
    sub: { en: "Adjustable strap", ka: "რეგულირებადი სამაჯური" },
  },
  {
    id: 6,
    name: { en: "Sunday stripe pouch", ka: "კვირის ზოლიანი ჩანთა" },
    price: 95,
    img: IMG_STRIPED,
    tags: ["pouch", "new"],
    badge: { label: { en: "LIMITED", ka: "შეზღუდული" }, tone: "ink" },
    colors: ["#e8b23a", "#b89bd9", "#f65c32"],
    sub: { en: "Tablet size", ka: "ტაბლეტის ზომა" },
  },
];

type Swatch = { key: string; hex: string; img: string; background: string };
const swatches: Swatch[] = [
  { key: "cobalt", hex: "#264ba0", img: IMG_BLUE, background: "#264ba0" },
  { key: "mustard", hex: "#e8b23a", img: IMG_YELLOW, background: "#e8b23a" },
  {
    key: "stripe",
    hex: "#f3c758",
    img: IMG_STRIPED,
    background: "repeating-linear-gradient(90deg,#f3c758 0 10px,#fbf3e4 10px 20px)",
  },
  { key: "lilac", hex: "#b89bd9", img: IMG_BLUE, background: "#b89bd9" },
  { key: "terracotta", hex: "#f65c32", img: IMG_YELLOW, background: "#f65c32" },
  { key: "cream", hex: "#f6ead7", img: IMG_STRIPED, background: "#f6ead7" },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1.0] as const },
  },
};

export default function HomeClient({ lang }: HomeProps) {
  const isKa = lang === "ka";
  const openCart = useUIStore((state) => state.openCart);
  const cartPush = useCartStore((state) => state.addItem);

  const [filter, setFilter] = useState<"all" | ProductTag>("all");
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch>(swatches[0]);

  const filters = useMemo(
    () => [
      { key: "all" as const, label: isKa ? "ყველა · 12" : "All · 12" },
      { key: "pouch" as const, label: isKa ? "ჩანთები" : "Pouches" },
      { key: "laptop" as const, label: isKa ? "ლეპტოპის ქერქები" : "Laptop sleeves" },
      { key: "bag" as const, label: isKa ? "თოუთ ჩანთები" : "Tote bags" },
      { key: "new" as const, label: isKa ? "ახალი" : "New arrivals" },
    ],
    [isKa]
  );

  const visibleProducts =
    filter === "all" ? products : products.filter((p) => p.tags.includes(filter));

  const handleQuickAdd = (p: LandingProduct) => {
    // Minimal ephemeral cart line — we'd need a full Product type for the store,
    // but the drawer can render the addition and the user can continue to /shop.
    try {
      cartPush(
        {
          id: `landing-${p.id}`,
          slug: `landing-${p.id}`,
          name: { en: p.name.en, ka: p.name.ka },
          subtitle: { en: p.sub.en, ka: p.sub.ka },
          description: { en: "", ka: "" },
          price: p.price,
          images: [p.img],
          variants: [
            {
              id: `v-${p.id}`,
              size: "one",
              colorName: { en: "default", ka: "default" },
              colorCode: p.colors[0],
              inStock: true,
            },
          ],
          category: p.tags[0] as any,
          featured: true,
          badges: [],
        } as any,
        {
          id: `v-${p.id}`,
          size: "one",
          colorName: { en: "default", ka: "default" },
          colorCode: p.colors[0],
          inStock: true,
        } as any,
        1
      );
      openCart();
    } catch {
      openCart();
    }
  };

  return (
    <div className="bg-[var(--tissu-cream)]">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pb-28">
        <div className="container grid gap-10 items-center md:grid-cols-[1.05fr_1fr]">
          <motion.div initial="hidden" animate="visible" variants={reveal}>
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[#eadcc3] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
              <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
              {isKa ? "გაზაფხული / ზაფხული '26" : "Spring / summer '26 drop"}
            </span>

            <h1 className="font-serif text-[54px] sm:text-[76px] md:text-[96px] lg:text-[118px] leading-[0.95] tracking-[-0.02em] mt-6 mb-6 text-[var(--tissu-ink)]">
              {isKa ? (
                <>
                  ატარე შენი <em className="not-italic italic text-[var(--tissu-terracotta)]">პატარა</em>
                  <br />
                  სიხარულები, <span className="squiggle-under">ნაზად</span>.
                </>
              ) : (
                <>
                  Carry your <em className="not-italic italic text-[var(--tissu-terracotta)]">little</em>
                  <br />
                  joys, <span className="squiggle-under">softly</span>.
                </>
              )}
            </h1>

            <p className="text-[18px] leading-[1.55] text-[var(--tissu-ink-soft)] max-w-[500px] mb-8">
              {isKa
                ? "ხელით ნაკერი ქვილტინგ ჩანთები, ლეპტოპის ქერქები და ჯიბის ჩანთები — ჭრილი, ნაკერი და ლენტით შეკრული მზიან თბილისურ სტუდიაში. მხოლოდ ბამბა. შექმნილია იმისთვის, რომ დიდხანს მოგემსახუროს."
                : "Handmade quilted pouches, laptop sleeves and pocket bags — cut, stitched and tied by hand in a sunlit studio in Tbilisi. Cotton only. Made to last for all your everyday hauls."}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href={`/${lang}/shop`}
                className="inline-flex items-center gap-3 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-7 py-4 rounded-full font-extrabold text-[15px] tracking-[0.02em] shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200"
              >
                {isKa ? "იყიდე ახალი კოლექცია" : "Shop the drop"}
                <span className="w-7 h-7 rounded-full bg-[var(--tissu-terracotta)] inline-flex items-center justify-center text-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link
                href={`/${lang}/about`}
                className="inline-flex items-center px-7 py-4 rounded-full font-bold text-[15px] text-[var(--tissu-ink)] border-[1.5px] border-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
              >
                {isKa ? "ჩვენი ისტორია" : "Our story"}
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <div className="flex">
                <span className="w-[38px] h-[38px] rounded-full border-[3px] border-[var(--tissu-cream)] bg-gradient-to-br from-[#f3c758] to-[var(--tissu-mustard)]" />
                <span className="-ml-2.5 w-[38px] h-[38px] rounded-full border-[3px] border-[var(--tissu-cream)] bg-gradient-to-br from-[#b89bd9] to-[#9877c4]" />
                <span className="-ml-2.5 w-[38px] h-[38px] rounded-full border-[3px] border-[var(--tissu-cream)] bg-gradient-to-br from-[var(--tissu-cobalt)] to-[#4671c9]" />
              </div>
              <div>
                <div className="text-[var(--tissu-mustard)] font-bold">
                  ★★★★★ <span className="text-[var(--tissu-ink)] font-extrabold">4.9</span>
                </div>
                <small className="block text-[13px] text-[var(--tissu-ink-soft)]">
                  {isKa
                    ? "2 400+ ბედნიერი მყიდველი · დადასტურებული შეფასებები"
                    : "2,400+ happy humans · verified reviews"}
                </small>
              </div>
            </div>
          </motion.div>

          {/* Hero image stage */}
          <div className="relative h-[480px] md:h-[620px]">
            <div className="absolute inset-0 m-auto w-[92%] h-[92%] bg-[var(--tissu-lilac-soft)] shape-blob-morph" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-[8%] top-[5%] w-[74%] h-[78%] rounded-[28px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(42,29,20,0.35)] -rotate-[3deg] z-[2] hover:-rotate-[1deg] hover:scale-[1.02] transition-transform duration-500"
            >
              <Image
                src={IMG_BLUE}
                alt={isKa ? "კობალტის ქვილტინგ ჩანთა" : "Cobalt blue quilted pouch"}
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="absolute right-[2%] top-[36%] w-[42%] h-[48%] rounded-[28px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(42,29,20,0.35)] rotate-[6deg] z-[3] border-[6px] border-[var(--tissu-cream)] hover:rotate-[2deg] hover:scale-[1.04] transition-transform duration-500"
            >
              <Image
                src={IMG_YELLOW}
                alt={isKa ? "ხახვისფერი ქვილტინგ ჩანთა" : "Mustard yellow quilted pouch"}
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Rotating sticker */}
            <div className="absolute top-[2%] right-[12%] w-[120px] h-[120px] z-[4]">
              <div className="relative w-full h-full rounded-full bg-[var(--tissu-mustard)] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 120 120">
                  <defs>
                    <path
                      id="hero-sticker-circle"
                      d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
                    />
                  </defs>
                  <text
                    fill="#2a1d14"
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 800,
                      fontSize: 11,
                      letterSpacing: "0.2em",
                    }}
                  >
                    <textPath href="#hero-sticker-circle">
                      · made by hand · made in tbilisi · made with love ·
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-[10px] rounded-full bg-[var(--tissu-ink)] text-[var(--tissu-cream)] flex flex-col items-center justify-center font-serif text-[14px] leading-[1.1] animate-spin-slow-reverse">
                  TISSU
                  <small className="font-sans font-bold text-[9px] tracking-[0.15em] mt-1">
                    EST. 2023
                  </small>
                </div>
              </div>
            </div>

            {/* Floating tags */}
            <div className="absolute top-[8%] left-[-4%] z-[5] bg-[var(--tissu-cobalt)] text-[var(--tissu-cream)] rounded-[20px] px-4 py-3 flex items-center gap-2.5 text-[13px] font-bold shadow-[0_8px_20px_rgba(42,29,20,0.18)] animate-bob [animation-delay:-2s]">
              <span className="w-7 h-7 rounded-full bg-[var(--tissu-mustard-soft)] inline-flex items-center justify-center">
                <Sun className="w-4 h-4 text-[var(--tissu-ink)]" strokeWidth={2.4} />
              </span>
              {isKa ? "100% ბამბა" : "100% cotton"}
            </div>

            <div className="absolute bottom-[10%] left-0 z-[5] bg-[var(--tissu-white)] rounded-[20px] px-4 py-3 flex items-center gap-2.5 text-[13px] font-bold shadow-[0_8px_20px_rgba(42,29,20,0.12)] animate-bob">
              <span className="w-7 h-7 rounded-full bg-[var(--tissu-mustard)] inline-flex items-center justify-center">
                <Heart className="w-4 h-4 text-[var(--tissu-ink)]" strokeWidth={2.4} />
              </span>
              {isKa ? "ნაკერი სიყვარულით" : "Made with love"}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SHOP COLLECTION ================= */}
      <section id="shop" className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-10 mb-14">
            <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[72px] leading-[1] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[720px]">
              {isKa ? (
                <>
                  ყოველდღიური <em className="not-italic italic text-[var(--tissu-terracotta)]">პატარა</em>
                  <br />
                  რამეების კოლექცია.
                </>
              ) : (
                <>
                  The <em className="not-italic italic text-[var(--tissu-terracotta)]">everyday</em>
                  <br />
                  little-things edit.
                </>
              )}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[380px]">
              {isKa
                ? "ექვსი ახალი ფორმა, სამი ქსოვილი, ერთი დაპირება: ყველა ნაკერი ხელით შესრულებული ცოცხალი ადამიანის მიერ ჩვენს თბილისურ სტუდიაში."
                : "Six new shapes, three fabrics, one promise: every stitch tied by a real human in our Tbilisi studio."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-9">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2.5 rounded-full border-[1.5px] text-[14px] font-bold transition-colors ${
                  filter === f.key
                    ? "bg-[var(--tissu-ink)] text-[var(--tissu-cream)] border-[var(--tissu-ink)]"
                    : "border-[var(--border)] text-[var(--tissu-ink-soft)] hover:border-[var(--tissu-ink)] hover:text-[var(--tissu-ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((p, idx) => (
              <div
                key={p.id}
                className="group bg-[var(--tissu-white)] rounded-[28px] p-5 flex flex-col gap-4 relative overflow-hidden hover:-translate-y-1.5 transition-transform duration-300"
              >
                <div className="relative aspect-square rounded-[20px] overflow-hidden">
                  {p.badge && (
                    <span
                      className={`absolute top-3.5 left-3.5 z-[2] px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.1em] ${
                        p.badge.tone === "cobalt"
                          ? "bg-[var(--tissu-cobalt)] text-white"
                          : p.badge.tone === "mustard"
                          ? "bg-[var(--tissu-mustard)] text-[var(--tissu-ink)]"
                          : "bg-[var(--tissu-ink)] text-[var(--tissu-cream)]"
                      }`}
                    >
                      {p.badge.label[lang] || p.badge.label.en}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={isKa ? "რჩეულებში დამატება" : "Favourite"}
                    className="absolute top-3.5 right-3.5 z-[2] w-10 h-10 rounded-full bg-[rgba(255,250,240,0.9)] backdrop-blur text-[var(--tissu-ink)] inline-flex items-center justify-center hover:bg-[var(--tissu-terracotta)] hover:text-white transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <Image
                    src={p.img}
                    alt={p.name[lang] || p.name.en}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-[22px] text-[var(--tissu-ink)] leading-tight">
                    {p.name[lang] || p.name.en}
                  </h3>
                  <div className="text-[13px] text-[var(--tissu-ink-soft)] mt-1">
                    {p.sub[lang] || p.sub.en}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex gap-1.5">
                    {p.colors.map((c, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full border ${
                          i === 0 ? "ring-2 ring-offset-2 ring-[var(--tissu-ink)]" : ""
                        }`}
                        style={{ background: c, borderColor: "rgba(0,0,0,0.1)" }}
                      />
                    ))}
                  </div>
                  <span className="font-serif text-[22px] text-[var(--tissu-terracotta)]">
                    {p.price}₾
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(p)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--tissu-ink)] text-[var(--tissu-cream)] text-[13px] font-bold hover:bg-[var(--tissu-terracotta)] transition-colors self-start"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isKa ? "კალათაში დამატება" : "Add to basket"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STORY STRIP ================= */}
      <section id="story" className="py-10">
        <div className="container">
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-[var(--tissu-cobalt)] text-[var(--tissu-cream)] px-6 py-12 md:px-14 md:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -left-5 opacity-[0.08] font-serif text-[220px] md:text-[300px] leading-none whitespace-nowrap"
            >
              TISSU · TISSU · TISSU
            </div>
            <div className="relative grid gap-12 items-center md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[rgba(255,250,240,0.15)] border border-[rgba(255,250,240,0.25)] text-[13px] font-bold uppercase tracking-[0.1em]">
                  <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
                  {isKa ? "ჩვენი ისტორია" : "Our story"}
                </span>
                <h2 className="font-serif text-[36px] md:text-[52px] leading-[1.02] mt-5 mb-5">
                  {isKa ? (
                    <>
                      ნაჭრილი <em className="not-italic italic text-[var(--tissu-mustard)]">ნარჩენი</em> ბამბიდან,
                      <br />
                      ზრუნვით ნაკერი.
                    </>
                  ) : (
                    <>
                      Cut from <em className="not-italic italic text-[var(--tissu-mustard)]">leftover</em> cotton, stitched with care.
                    </>
                  )}
                </h2>
                <p className="text-[17px] leading-[1.6] max-w-[460px] opacity-90">
                  {isKa
                    ? "Tissu დაიწყო კვირა საღამოობით კერვით მზიან თბილისურ სამზარეულოში — ნარჩენი ბამბა, ძველი მანქანა და აზრი, რომ ჩანთა პატარა ჩახუტების ანალოგი უნდა იყოს. დღეს ჯერ კიდევ პატარა ვართ, ჯერ კიდევ ხელით ვქმნით და ჯერ კიდევ ცოტათი შეპყრობილი ვართ ლენტის კვანძის სრულყოფით."
                    : "Tissu started as Sunday-afternoon sewing in a sunny Tbilisi kitchen — leftover cotton, a vintage machine, and the idea that a pouch should feel like a small hug. Today we're still tiny, still handmade, and still a little obsessed with getting the tie-ribbons just right."}
                </p>
                <div className="flex flex-wrap gap-8 mt-9">
                  {[
                    { num: "100%", lbl: isKa ? "ბამბის ქსოვილი" : "Cotton fabric" },
                    { num: "3", lbl: isKa ? "ხელი თითო ჩანთაზე" : "Hands per bag" },
                    { num: "0", lbl: isKa ? "ნარჩენი ქსოვილი" : "Waste fabric" },
                  ].map((stat) => (
                    <div key={stat.lbl}>
                      <div className="font-serif text-[48px] leading-none text-[var(--tissu-mustard)]">
                        {stat.num}
                      </div>
                      <div className="text-[13px] opacity-80 mt-1.5">{stat.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative h-[320px] md:h-[380px]">
                <div className="absolute inset-0 m-auto w-[300px] h-[300px] md:w-[340px] md:h-[340px] rounded-full bg-[var(--tissu-mustard)] animate-bob" />
                <div className="absolute inset-0 m-auto w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-[8px] border-[var(--tissu-cream)]">
                  <Image
                    src={IMG_STRIPED}
                    alt={isKa ? "ზოლიანი ლეპტოპის ქერქი" : "Striped laptop sleeve"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4 md:top-5 md:right-5 w-[110px] h-[110px] rounded-full bg-[var(--tissu-cream)] text-[var(--tissu-ink)] font-serif text-[15px] text-center leading-[1.05] flex flex-col items-center justify-center -rotate-[10deg] shadow-[0_10px_20px_rgba(0,0,0,0.2)] p-4">
                  {isKa ? "2023" : "Since"}
                  {isKa ? null : <br />}
                  {isKa ? "წლიდან" : <>&apos;23</>}
                  <small className="block mt-1.5 text-[10px] font-sans font-bold tracking-[0.2em] text-[var(--tissu-terracotta)]">
                    TBILISI
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section id="process" className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-10 mb-14">
            <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[72px] leading-[1] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[720px]">
              {isKa ? (
                <>
                  ბამბის რულონიდან
                  <br />
                  შენს <em className="not-italic italic text-[var(--tissu-terracotta)]">კართან</em>.
                </>
              ) : (
                <>
                  From <em className="not-italic italic text-[var(--tissu-terracotta)]">cotton roll</em>
                  <br />
                  to your doorstep.
                </>
              )}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[380px]">
              {isKa
                ? "არანაირი ქარხანა, არანაირი გამარტივებული გზები. უბრალოდ ოთხი მშვიდი ნაბიჯი ქსოვილიდან შენს საყვარელ ჩანთამდე."
                : "No factories, no shortcuts. Just four quiet steps between a bolt of cloth and a bag you'll love for years."}
            </p>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                title: isKa ? "მოპოვება" : "Source",
                body: isKa
                  ? "ბამბის რულონებს ავირჩევთ ადგილობრივი ფაბრიკებიდან. ფერები სეზონის მიხედვით, ფაქტურა ხელით."
                  : "We pick cotton rolls from local mills. Colours chosen by season, texture chosen by hand.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16v5H4zM4 9v11h16V9" />
                    <path d="M8 13h8" />
                  </svg>
                ),
              },
              {
                n: "02",
                title: isKa ? "ჭრილი" : "Pattern",
                body: isKa
                  ? "თითოეული ფორმა იჭრება ქაღალდის შაბლონებიდან, რომელიც ორი წელია ვსრულყოფთ."
                  : "Each shape is cut from paper templates we've refined for two years running.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                ),
              },
              {
                n: "03",
                title: isKa ? "ქვილტინგი და კერვა" : "Quilt & stitch",
                body: isKa
                  ? "რომბისებრი ქვილტინგი ხელით — ის პატარა კრის-კროსი, რაც Tissu-ს Tissu-დ აქცევს."
                  : "Diamond-quilted by hand — the little criss-cross that makes a Tissu a Tissu.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12c3-6 15-6 18 0-3 6-15 6-18 0z" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                ),
              },
              {
                n: "04",
                title: isKa ? "შეფუთვა და გაგზავნა" : "Wrap & send",
                body: isKa
                  ? "ლენტით შეკრული, თეთრეულის ჩანთაში გახვეული, თბილისური ფოსტით შენთან."
                  : "Tied with ribbon, slipped into a linen pouch, off on a Tbilisi post truck to you.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7h18l-1 12H4z" />
                    <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                  </svg>
                ),
              },
            ].map((step, idx) => (
              <div
                key={step.n}
                className="relative rounded-[28px] bg-[var(--tissu-white)] border border-[#ead8bb] p-7 hover:-translate-y-1 hover:bg-[var(--tissu-mustard)] transition-[transform,background] duration-300"
              >
                <div className="font-serif text-[60px] leading-[0.9] text-[var(--tissu-terracotta)]">
                  {step.n}
                </div>
                <div className="absolute top-7 right-7 w-11 h-11 rounded-full bg-[var(--tissu-cream)] text-[var(--tissu-ink)] inline-flex items-center justify-center">
                  {step.icon}
                </div>
                <h4 className="font-serif text-[22px] text-[var(--tissu-ink)] mt-4 mb-2.5">
                  {step.title}
                </h4>
                <p className="text-[14px] leading-[1.5] text-[var(--tissu-ink-soft)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PICK A COLOUR ================= */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-[var(--tissu-mustard)] px-6 py-12 md:px-14 md:py-16">
            <div className="grid gap-10 items-center md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[rgba(42,29,20,0.08)] border border-[rgba(42,29,20,0.15)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--tissu-terracotta)]" />
                  {isKa ? "ააწყვე შენი" : "Build your own"}
                </span>
                <h2 className="font-serif text-[36px] md:text-[50px] leading-[1.02] mt-5 mb-4 text-[var(--tissu-ink)]">
                  {isKa ? (
                    <>
                      აირჩიე <em className="not-italic italic">ფერი</em>, რომელიც შენზეა.
                    </>
                  ) : (
                    <>
                      Pick a <em className="not-italic italic">shade</em> that feels like you.
                    </>
                  )}
                </h2>
                <p className="text-[17px] leading-[1.55] max-w-[440px] text-[var(--tissu-ink-soft)]">
                  {isKa
                    ? "თითოეული Tissu დამზადებულია შეკვეთისამებრ. აირჩიე ქსოვილი, ჩვენ 5 დღეში შეგიკერავთ და თბილად გამოგიგზავნით."
                    : "Every Tissu is made to order. Choose your fabric, we'll stitch it in the next 5 days and ship it warm."}
                </p>
                <div className="flex flex-wrap gap-3.5 mt-7">
                  {swatches.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSelectedSwatch(s)}
                      aria-label={s.key}
                      className={`w-[60px] h-[60px] rounded-full border-[3px] border-[var(--tissu-cream)] transition-transform hover:scale-110 ${
                        selectedSwatch.key === s.key ? "ring-[3px] ring-offset-[3px] ring-[var(--tissu-ink)]" : ""
                      }`}
                      style={{ background: s.background }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3.5 mt-8">
                  <Link
                    href={`/${lang}/shop`}
                    className="inline-flex items-center gap-3 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-7 py-4 rounded-full font-extrabold text-[15px] shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200"
                  >
                    {isKa ? "დაიწყე — 85₾" : "Start this one — 85₾"}
                    <span className="w-7 h-7 rounded-full bg-[var(--tissu-terracotta)] inline-flex items-center justify-center text-white">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                  <span className="font-hand text-[22px] text-[var(--tissu-ink-soft)]">
                    ← {isKa ? "იგზავნება 5 დღეში" : "ships in 5 days"}
                  </span>
                </div>
              </div>

              <div className="relative h-[360px] md:h-[420px]">
                <div className="absolute inset-0 m-auto w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full border-2 border-dashed border-[var(--tissu-ink)]/30 animate-spin-slower" />
                <div
                  className="absolute inset-0 m-auto w-[260px] h-[260px] md:w-[320px] md:h-[320px] rounded-full transition-[background] duration-500"
                  style={{ background: selectedSwatch.background }}
                />
                <div className="absolute inset-0 m-auto w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                  <Image
                    src={selectedSwatch.img}
                    alt={isKa ? "არჩეული ფერის ვერსია" : "Selected colour preview"}
                    fill
                    className="object-cover transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-10 mb-14">
            <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[72px] leading-[1] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[720px]">
              {isKa ? (
                <>
                  შეყვარებული <em className="not-italic italic text-[var(--tissu-terracotta)]">ცოცხალი</em>
                  <br />
                  ადამიანების მიერ.
                </>
              ) : (
                <>
                  Loved by <em className="not-italic italic text-[var(--tissu-terracotta)]">real</em>
                  <br />
                  humans.
                </>
              )}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[380px]">
              {isKa
                ? "2 400+ შეფასება და ვითვლით. აი, ცოტა იმისა, რასაც ჩვენი მყიდველები ამბობენ."
                : "2,400+ reviews and counting. Here's a little scoop of what folks are saying."}
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {[
              {
                text: isKa
                  ? "ფერი ზუსტად ისეთია, როგორც ფოტოზე, და ნაკერი იმდენად ჩინებულია, რომ თითქმის არ მინდა რამე ჩავდო შიგნით."
                  : "The colour is exactly like the photo and the stitching is so neat I almost don't want to put anything in it.",
                name: "Mariam K.",
                meta: isKa ? "Blueberry ჩანთა · თბილისი" : "Blueberry pouch · Tbilisi",
                bg: "bg-[var(--tissu-white)]",
                av: "bg-[var(--tissu-lilac)]",
                offset: "",
              },
              {
                text: isKa
                  ? "თეთრეულის ლენტით იყო გახვეული. მხოლოდ შეფუთვამ კვირა გამიხარა — ჩანთამ კი მთელი წელი."
                  : "It arrived wrapped in a linen ribbon. The packaging alone made my week — the bag made my whole year.",
                name: "Sofia R.",
                meta: isKa ? "Lemon ლეპტოპის ქერქი · ლისაბონი" : "Lemon laptop sleeve · Lisbon",
                bg: "bg-[var(--tissu-lilac-soft)]",
                av: "bg-[var(--tissu-mustard)]",
                offset: "lg:-translate-y-3",
              },
              {
                text: isKa
                  ? "ბოლოსდაბოლოს, ლეპტოპის ჩანთა, რომელიც ბრანჩზე ზის. ქვილტინგი რბილია, ლენტები კი საუკეთესო დეტალია."
                  : "Finally a laptop bag that looks like it belongs at brunch. The quilting is buttery and the ties are the sweetest detail.",
                name: "Elene D.",
                meta: isKa ? "Stripe ქერქი · ბერლინი" : "Stripe sleeve · Berlin",
                bg: "bg-[var(--tissu-peach)]",
                av: "bg-[var(--tissu-cobalt)]",
                offset: "",
              },
            ].map((r, idx) => (
              <div
                key={r.name}
                className={`relative rounded-[28px] border border-[#ead8bb] p-7 ${r.bg} ${r.offset}`}
              >
                <div className="absolute top-4 right-5 font-serif text-[90px] leading-[0.7] text-[var(--tissu-terracotta)] opacity-25">
                  &quot;
                </div>
                <div className="text-[var(--tissu-mustard)] text-[18px] mb-3">★★★★★</div>
                <blockquote className="font-serif text-[20px] md:text-[22px] leading-[1.3] text-[var(--tissu-ink)] mb-5">
                  {r.text}
                </blockquote>
                <div className="flex items-center gap-3">
                  <span className={`w-11 h-11 rounded-full ${r.av}`} />
                  <div>
                    <strong className="block text-[14px] text-[var(--tissu-ink)]">{r.name}</strong>
                    <small className="block text-[12px] text-[var(--tissu-ink-soft)]">{r.meta}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INSTAGRAM ================= */}
      <section id="journal" className="pb-20 md:pb-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-10 mb-10">
            <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[64px] leading-[1] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[720px]">
              {isKa ? (
                <>
                  <em className="not-italic italic text-[var(--tissu-terracotta)]">@thetissushop</em>-ისგან
                </>
              ) : (
                <>
                  From <em className="not-italic italic text-[var(--tissu-terracotta)]">@thetissushop</em>
                </>
              )}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[380px]">
              {isKa
                ? "მოჰყევი სტუდიის სურათებს, კულისებს და დროდადრო — ლიმონს."
                : "Follow along for studio snaps, behind-the-scenes, and the occasional lemon."}
            </p>
          </div>

          <div className="grid gap-3.5 grid-cols-3 md:grid-cols-6">
            {[
              { type: "img" as const, src: IMG_BLUE, overlay: "❤ 1.2k", alt: "" },
              { type: "img" as const, src: IMG_YELLOW, overlay: "❤ 984", alt: "" },
              { type: "img" as const, src: IMG_STRIPED, overlay: "❤ 2.1k", alt: "" },
              { type: "text" as const, label: isKa ? "სტუდიის\nფოტო" : "studio\nsnap", bg: "bg-[var(--tissu-lilac-soft)]" },
              { type: "text" as const, label: isKa ? "კულისების\nვიდეო" : "BTS\nreel", bg: "bg-[var(--tissu-mustard)]" },
              { type: "text" as const, label: isKa ? "ლიმონები &\nსიყვარული" : "lemons\n& love", bg: "bg-[var(--tissu-peach)]" },
            ].map((tile, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-[18px] overflow-hidden cursor-pointer"
              >
                {tile.type === "img" ? (
                  <>
                    <Image
                      src={tile.src!}
                      alt={tile.alt!}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(42,29,20,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute bottom-2.5 right-2.5 text-white font-bold text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {tile.overlay}
                    </span>
                  </>
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center font-serif text-center text-[var(--tissu-ink)] text-[18px] whitespace-pre-line leading-tight p-4 ${tile.bg}`}
                  >
                    {tile.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="pb-20 md:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-6 py-12 md:px-14 md:py-16 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-5 -left-5 opacity-[0.1] font-serif text-[180px] md:text-[240px] leading-none whitespace-nowrap"
            >
              ♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡
            </div>
            <h2 className="relative font-serif text-[36px] md:text-[52px] lg:text-[60px] leading-[1.02] mb-4">
              {isKa ? (
                <>
                  მიიღე <em className="not-italic italic text-[var(--tissu-mustard)]">პირველ რიგში</em> ახალი კოლექციები.
                </>
              ) : (
                <>
                  Get <em className="not-italic italic text-[var(--tissu-mustard)]">first dibs</em> on new drops.
                </>
              )}
            </h2>
            <p className="relative opacity-80 max-w-[480px] mx-auto mb-8">
              {isKa
                ? "ორი ელფოსტა თვეში, მეტი არა. ახალი ფერები, სტუდიის კულისები და 10%-იანი კოდი შენთვის."
                : "Two emails a month, tops. New colours, studio peeks, and a 10% code on us."}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative mx-auto flex max-w-[520px] gap-2.5 rounded-full bg-[var(--tissu-cream)] p-1.5"
            >
              <input
                type="email"
                required
                placeholder="you@lovely.com"
                className="flex-1 bg-transparent px-5 py-3.5 text-[15px] text-[var(--tissu-ink)] outline-none placeholder:text-[var(--tissu-ink-soft)]"
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--tissu-terracotta)] text-white px-7 py-3.5 font-extrabold text-[14px] tracking-[0.04em] hover:bg-[var(--tissu-mustard)] hover:text-[var(--tissu-ink)] transition-colors"
              >
                {isKa ? "გამომწერე" : "Sign me up"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
