"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag, Droplets, RotateCw } from "lucide-react";
import { Locale } from "@/i18n/config";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { getLandingCopy } from "./landingCopy";

interface HomeProps {
  lang: Locale;
  dictionary: any;
}

type ProductTag = "pouch" | "laptop" | "bag" | "kidsbackpack" | "apron" | "necklace" | "new";

interface LandingProduct {
  id: number;
  price: number;
  img: string;
  tags: ProductTag[];
  badge?: { key: "new" | "bestseller" | "limited"; tone: "ink" | "mustard" | "cobalt" };
  colors: string[];
}

const IMG_BLUE = "/static/landing-bag-blue.jpg";
const IMG_YELLOW = "/static/landing-bag-yellow.jpg";
const IMG_STRIPED = "/static/landing-bag-striped.png";

// NOTE: Product imagery is a placeholder — real photos will replace these once the user uploads them.
const productsMeta: LandingProduct[] = [
  { id: 1, price: 85, img: IMG_BLUE, tags: ["pouch", "new"], badge: { key: "new", tone: "cobalt" }, colors: ["#264ba0", "#e8b23a", "#b89bd9"] },
  { id: 2, price: 85, img: IMG_YELLOW, tags: ["pouch"], badge: { key: "bestseller", tone: "mustard" }, colors: ["#e8b23a", "#f65c32", "#264ba0"] },
  { id: 3, price: 140, img: IMG_STRIPED, tags: ["laptop"], colors: ["#e8b23a", "#264ba0", "#b89bd9"] },
  { id: 4, price: 120, img: IMG_YELLOW, tags: ["bag"], colors: ["#e8b23a", "#264ba0"] },
  { id: 5, price: 165, img: IMG_BLUE, tags: ["bag", "new"], badge: { key: "new", tone: "cobalt" }, colors: ["#264ba0", "#2a1d14", "#e8b23a"] },
  { id: 6, price: 95, img: IMG_STRIPED, tags: ["pouch", "new"], badge: { key: "limited", tone: "ink" }, colors: ["#e8b23a", "#b89bd9", "#f65c32"] },
  { id: 7, price: 110, img: IMG_BLUE, tags: ["kidsbackpack", "new"], badge: { key: "new", tone: "cobalt" }, colors: ["#264ba0", "#f65c32", "#e8b23a"] },
  { id: 8, price: 125, img: IMG_STRIPED, tags: ["kidsbackpack"], colors: ["#b89bd9", "#e8b23a", "#264ba0"] },
  { id: 9, price: 65, img: IMG_YELLOW, tags: ["apron"], colors: ["#e8b23a", "#f65c32", "#b89bd9"] },
  { id: 10, price: 85, img: IMG_STRIPED, tags: ["apron"], colors: ["#264ba0", "#e8b23a", "#2a1d14"] },
  { id: 11, price: 45, img: IMG_YELLOW, tags: ["necklace", "new"], badge: { key: "new", tone: "mustard" }, colors: ["#e8b23a", "#b89bd9", "#f65c32"] },
  { id: 12, price: 55, img: IMG_BLUE, tags: ["necklace"], colors: ["#264ba0", "#f3cdaa", "#b89bd9"] },
];

type Swatch = { key: string; img: string; background: string };
const swatches: Swatch[] = [
  { key: "cobalt", img: IMG_BLUE, background: "#264ba0" },
  { key: "mustard", img: IMG_YELLOW, background: "#e8b23a" },
  {
    key: "stripe",
    img: IMG_STRIPED,
    background: "repeating-linear-gradient(90deg,#f3c758 0 10px,#fbf3e4 10px 20px)",
  },
  { key: "lilac", img: IMG_BLUE, background: "#b89bd9" },
  { key: "terracotta", img: IMG_YELLOW, background: "#f65c32" },
  { key: "cream", img: IMG_STRIPED, background: "#f6ead7" },
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
  const copy = getLandingCopy(lang);
  const openCart = useUIStore((state) => state.openCart);
  const cartPush = useCartStore((state) => state.addItem);

  const [filter, setFilter] = useState<"all" | ProductTag>("all");
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch>(swatches[0]);

  const filterButtons = useMemo(
    () =>
      [
        { key: "all" as const, label: `${copy.shop.filters.all} · ${productsMeta.length}` },
        { key: "pouch" as const, label: copy.shop.filters.pouch },
        { key: "laptop" as const, label: copy.shop.filters.laptop },
        { key: "bag" as const, label: copy.shop.filters.bag },
        { key: "kidsbackpack" as const, label: copy.shop.filters.kidsbackpack },
        { key: "apron" as const, label: copy.shop.filters.apron },
        { key: "necklace" as const, label: copy.shop.filters.necklace },
        { key: "new" as const, label: copy.shop.filters.new },
      ],
    [copy]
  );

  const visibleProducts =
    filter === "all" ? productsMeta : productsMeta.filter((p) => p.tags.includes(filter));

  const handleQuickAdd = (p: LandingProduct, idx: number) => {
    const productCopy = copy.products[idx];
    try {
      cartPush(
        {
          id: `landing-${p.id}`,
          slug: `landing-${p.id}`,
          name: { en: productCopy.name, ka: productCopy.name },
          subtitle: { en: productCopy.sub, ka: productCopy.sub },
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
              {copy.hero.eyebrow}
            </span>

            <h1 className="font-serif text-[44px] sm:text-[60px] md:text-[78px] lg:text-[96px] leading-[0.98] tracking-[-0.02em] mt-6 mb-6 text-[var(--tissu-ink)]">
              {copy.hero.titlePart1}{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">
                {copy.hero.titleItalic}
              </em>
              <br />
              {copy.hero.titlePart2}{" "}
              <span className="squiggle-under">{copy.hero.titleSquiggle}</span>.
            </h1>

            <p className="text-[17px] leading-[1.55] text-[var(--tissu-ink-soft)] max-w-[520px] mb-8">
              {copy.hero.lead}
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href={`/${lang}/shop`}
                className="inline-flex items-center gap-3 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-7 py-4 rounded-full font-extrabold text-[15px] tracking-[0.02em] shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200"
              >
                {copy.hero.ctaPrimary}
                <span className="w-7 h-7 rounded-full bg-[var(--tissu-terracotta)] inline-flex items-center justify-center text-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link
                href={`/${lang}/about`}
                className="inline-flex items-center px-7 py-4 rounded-full font-bold text-[15px] text-[var(--tissu-ink)] border-[1.5px] border-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
              >
                {copy.hero.ctaSecondary}
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
                  {copy.hero.socialProof}
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
                alt={copy.hero.imageAltBlue}
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
                alt={copy.hero.imageAltYellow}
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
                <Droplets className="w-4 h-4 text-[var(--tissu-ink)]" strokeWidth={2.4} />
              </span>
              {copy.hero.tagCanvas}
            </div>

            <div className="absolute bottom-[10%] left-0 z-[5] bg-[var(--tissu-white)] rounded-[20px] px-4 py-3 flex items-center gap-2.5 text-[13px] font-bold shadow-[0_8px_20px_rgba(42,29,20,0.12)] animate-bob">
              <span className="w-7 h-7 rounded-full bg-[var(--tissu-mustard)] inline-flex items-center justify-center">
                <RotateCw className="w-4 h-4 text-[var(--tissu-ink)]" strokeWidth={2.4} />
              </span>
              {copy.hero.tagReversible}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SHOP COLLECTION ================= */}
      <section id="shop" className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-10 mb-14">
            <h2 className="font-serif text-[36px] md:text-[48px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[720px]">
              {copy.shop.titlePart1}{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">
                {copy.shop.titleItalic}
              </em>
              <br />
              {copy.shop.titlePart2}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[420px]">
              {copy.shop.sub}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-9">
            {filterButtons.map((f) => (
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
            {visibleProducts.map((p) => {
              const idx = productsMeta.indexOf(p);
              const pc = copy.products[idx];
              return (
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
                        {copy.shop.badges[p.badge.key]}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={copy.shop.card.favourite}
                      className="absolute top-3.5 right-3.5 z-[2] w-10 h-10 rounded-full bg-[rgba(255,250,240,0.9)] backdrop-blur text-[var(--tissu-ink)] inline-flex items-center justify-center hover:bg-[var(--tissu-terracotta)] hover:text-white transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <Image
                      src={p.img}
                      alt={pc.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-[22px] text-[var(--tissu-ink)] leading-tight">
                      {pc.name}
                    </h3>
                    <div className="text-[13px] text-[var(--tissu-ink-soft)] mt-1">{pc.sub}</div>
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
                    onClick={() => handleQuickAdd(p, idx)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--tissu-ink)] text-[var(--tissu-cream)] text-[13px] font-bold hover:bg-[var(--tissu-terracotta)] transition-colors self-start"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {copy.shop.card.addToBasket}
                  </button>
                </div>
              );
            })}
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
                  {copy.story.eyebrow}
                </span>
                <h2 className="font-serif text-[32px] md:text-[44px] leading-[1.05] mt-5 mb-5">
                  {copy.story.titlePart1}{" "}
                  <em className="not-italic italic text-[var(--tissu-mustard)]">
                    {copy.story.titleItalic}
                  </em>{" "}
                  {copy.story.titlePart2}
                </h2>
                <p className="text-[17px] leading-[1.6] max-w-[500px] opacity-90">
                  {copy.story.body}
                </p>
              </div>

              <div className="relative h-[320px] md:h-[380px]">
                <div className="absolute inset-0 m-auto w-[300px] h-[300px] md:w-[340px] md:h-[340px] rounded-full bg-[var(--tissu-mustard)] animate-bob" />
                <div className="absolute inset-0 m-auto w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-[8px] border-[var(--tissu-cream)]">
                  <Image
                    src={IMG_STRIPED}
                    alt={copy.hero.imageAltStriped}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4 md:top-5 md:right-5 w-[110px] h-[110px] rounded-full bg-[var(--tissu-cream)] text-[var(--tissu-ink)] font-serif text-[15px] text-center leading-[1.05] flex flex-col items-center justify-center -rotate-[10deg] shadow-[0_10px_20px_rgba(0,0,0,0.2)] p-4">
                  {copy.story.sinceLine1}
                  <br />
                  {copy.story.sinceLine2}
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
            <h2 className="font-serif text-[36px] md:text-[48px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[720px]">
              {copy.process.titlePart1}{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">
                {copy.process.titleItalic}
              </em>
              <br />
              {copy.process.titlePart2}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[420px]">
              {copy.process.sub}
            </p>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {copy.process.steps.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-[28px] bg-[var(--tissu-white)] border border-[#ead8bb] p-7 hover:-translate-y-1 hover:bg-[var(--tissu-mustard)] transition-[transform,background] duration-300"
              >
                <div className="font-serif text-[60px] leading-[0.9] text-[var(--tissu-terracotta)]">
                  {String(i + 1).padStart(2, "0")}
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
                  {copy.picker.eyebrow}
                </span>
                <h2 className="font-serif text-[32px] md:text-[44px] leading-[1.05] mt-5 mb-4 text-[var(--tissu-ink)]">
                  {copy.picker.titlePart1}{" "}
                  <em className="not-italic italic">{copy.picker.titleItalic}</em>{" "}
                  {copy.picker.titlePart2}
                </h2>
                <p className="text-[17px] leading-[1.55] max-w-[480px] text-[var(--tissu-ink-soft)]">
                  {copy.picker.body}
                </p>
                <div className="flex flex-wrap gap-3.5 mt-7">
                  {swatches.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSelectedSwatch(s)}
                      aria-label={s.key}
                      className={`w-[60px] h-[60px] rounded-full border-[3px] border-[var(--tissu-cream)] transition-transform hover:scale-110 ${
                        selectedSwatch.key === s.key
                          ? "ring-[3px] ring-offset-[3px] ring-[var(--tissu-ink)]"
                          : ""
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
                    {copy.picker.cta}
                    <span className="w-7 h-7 rounded-full bg-[var(--tissu-terracotta)] inline-flex items-center justify-center text-white">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                  <span className="font-hand text-[22px] text-[var(--tissu-ink-soft)]">
                    ← {copy.picker.shipsNote}
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
                    alt={copy.picker.altPreview}
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
            <h2 className="font-serif text-[36px] md:text-[48px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[820px]">
              {copy.reviews.titlePart1}{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">
                {copy.reviews.titleItalic}
              </em>{" "}
              {copy.reviews.titlePart2}
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[420px]">
              {copy.reviews.sub}
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {copy.reviews.items.map((r, i) => {
              const bg =
                i === 0
                  ? "bg-[var(--tissu-white)]"
                  : i === 1
                  ? "bg-[var(--tissu-lilac-soft)]"
                  : "bg-[var(--tissu-peach)]";
              const av =
                i === 0
                  ? "bg-[var(--tissu-lilac)]"
                  : i === 1
                  ? "bg-[var(--tissu-mustard)]"
                  : "bg-[var(--tissu-cobalt)]";
              const offset = i === 1 ? "lg:-translate-y-3" : "";
              return (
                <div
                  key={r.name}
                  className={`relative rounded-[28px] border border-[#ead8bb] p-7 ${bg} ${offset}`}
                >
                  <div className="absolute top-4 right-5 font-serif text-[90px] leading-[0.7] text-[var(--tissu-terracotta)] opacity-25">
                    &quot;
                  </div>
                  <div className="text-[var(--tissu-mustard)] text-[18px] mb-3">★★★★★</div>
                  <blockquote className="font-serif text-[19px] md:text-[21px] leading-[1.35] text-[var(--tissu-ink)] mb-5">
                    {r.text}
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <span className={`w-11 h-11 rounded-full ${av}`} />
                    <div>
                      <strong className="block text-[14px] text-[var(--tissu-ink)]">{r.name}</strong>
                      <small className="block text-[12px] text-[var(--tissu-ink-soft)]">
                        {r.meta}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= INSTAGRAM ================= */}
      <section id="journal" className="pb-20 md:pb-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-10 mb-10">
            <h2 className="font-serif text-[36px] md:text-[48px] lg:text-[56px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)] max-w-[820px]">
              {copy.ig.titlePart1}{" "}
              <em className="not-italic italic text-[var(--tissu-terracotta)]">
                {copy.ig.titleItalic}
              </em>
            </h2>
            <p className="text-[17px] leading-[1.5] text-[var(--tissu-ink-soft)] max-w-[420px]">
              {copy.ig.sub}
            </p>
          </div>

          <div className="grid gap-3.5 grid-cols-3 md:grid-cols-6">
            {[
              { type: "img" as const, src: IMG_BLUE, overlay: copy.ig.tiles[0].likes!, alt: "" },
              { type: "img" as const, src: IMG_YELLOW, overlay: copy.ig.tiles[1].likes!, alt: "" },
              { type: "img" as const, src: IMG_STRIPED, overlay: copy.ig.tiles[2].likes!, alt: "" },
              { type: "text" as const, l1: copy.ig.tiles[0].line1, l2: copy.ig.tiles[0].line2, bg: "bg-[var(--tissu-lilac-soft)]" },
              { type: "text" as const, l1: copy.ig.tiles[1].line1, l2: copy.ig.tiles[1].line2, bg: "bg-[var(--tissu-mustard)]" },
              { type: "text" as const, l1: copy.ig.tiles[2].line1, l2: copy.ig.tiles[2].line2, bg: "bg-[var(--tissu-peach)]" },
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
                    className={`w-full h-full flex flex-col items-center justify-center font-serif text-center text-[var(--tissu-ink)] text-[17px] leading-tight p-4 ${tile.bg}`}
                  >
                    <span>{tile.l1}</span>
                    <span>{tile.l2}</span>
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
            <h2 className="relative font-serif text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] mb-4">
              {copy.newsletter.titlePart1}{" "}
              <em className="not-italic italic text-[var(--tissu-mustard)]">
                {copy.newsletter.titleItalic}
              </em>{" "}
              {copy.newsletter.titlePart2}
            </h2>
            <p className="relative opacity-80 max-w-[520px] mx-auto mb-8">
              {copy.newsletter.body}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative mx-auto flex max-w-[520px] gap-2.5 rounded-full bg-[var(--tissu-cream)] p-1.5"
            >
              <input
                type="email"
                required
                placeholder={copy.newsletter.placeholder}
                className="flex-1 bg-transparent px-5 py-3.5 text-[15px] text-[var(--tissu-ink)] outline-none placeholder:text-[var(--tissu-ink-soft)]"
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--tissu-terracotta)] text-white px-7 py-3.5 font-extrabold text-[14px] tracking-[0.04em] hover:bg-[var(--tissu-mustard)] hover:text-[var(--tissu-ink)] transition-colors"
              >
                {copy.newsletter.cta}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
