"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Heart, Minus, Plus, Truck, RotateCw, Droplets } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useStoreHydration } from "@/store/useHydration";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import { getLandingCopy } from "@/app/[lang]/landingCopy";

interface ProductDetailsClientProps {
  product: StorefrontProduct;
  related: StorefrontProduct[];
  lang: Locale;
  dictionary: any;
}

export function ProductDetailsClient({ product, related, lang }: ProductDetailsClientProps) {
  useStoreHydration();
  const copy = getLandingCopy(lang);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const hasBack = Boolean(product.image_back);
  const activeImg = activeSide === "back" && product.image_back ? product.image_back : product.image_front;
  const inStock = product.in_stock && product.stock > 0;

  const name = product.name || product.code;
  const sub = [product.size, product.color].filter(Boolean).join(" · ");
  const isKa = lang === "ka";

  const categoryLabel = copy.shop.filters[
    product.category === "tote" ? "bag" : product.category
  ];

  const onAddToCart = () => {
    if (!inStock) return;
    try {
      addItem(
        {
          id: product.id,
          slug: product.id,
          name: { en: name, ka: name },
          subtitle: { en: sub, ka: sub },
          description: { en: "", ka: "" },
          price: product.price,
          images: [product.image_front, product.image_back].filter(Boolean) as string[],
          variants: [
            {
              id: `${product.id}-default`,
              size: "one",
              colorName: { en: product.color || "default", ka: product.color || "default" },
              colorCode: "#264ba0",
              inStock: true,
            },
          ],
          category: product.category as any,
          featured: true,
          badges: [],
        } as any,
        {
          id: `${product.id}-default`,
          size: "one",
          colorName: { en: product.color || "default", ka: product.color || "default" },
          colorCode: "#264ba0",
          inStock: true,
        } as any,
        quantity
      );
      openCart();
    } catch {
      openCart();
    }
  };

  return (
    <div className="bg-[var(--tissu-cream)] min-h-screen">
      <div className="container py-10 md:py-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tissu-ink-soft)] mb-10 overflow-x-auto whitespace-nowrap">
          <Link href={`/${lang}`} className="hover:text-[var(--tissu-terracotta)] transition-colors">
            {isKa ? "მთავარი" : "Home"}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/${lang}/shop`} className="hover:text-[var(--tissu-terracotta)] transition-colors">
            {isKa ? "მაღაზია" : "Shop"}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={`/${lang}/shop?category=${product.category}`}
            className="hover:text-[var(--tissu-terracotta)] transition-colors"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--tissu-ink)]">{name}</span>
        </nav>

        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.1fr_1fr] items-start">
          {/* Image side */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[28px] overflow-hidden bg-[var(--tissu-white)] border border-[var(--border)]">
              <Image
                src={activeImg}
                alt={name}
                fill
                priority
                className="object-cover transition-opacity duration-300"
                key={activeImg}
              />
              {product.tags.includes("new") && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[var(--tissu-cobalt)] text-white text-[11px] font-extrabold uppercase tracking-[0.1em]">
                  {copy.shop.badges.new}
                </span>
              )}
              {product.tags.includes("bestseller") && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[var(--tissu-mustard)] text-[var(--tissu-ink)] text-[11px] font-extrabold uppercase tracking-[0.1em]">
                  {copy.shop.badges.bestseller}
                </span>
              )}
            </div>

            {hasBack && (
              <div className="flex items-center justify-between gap-3 bg-[var(--tissu-white)] border border-[var(--border)] rounded-full px-4 py-2">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--tissu-ink)]">
                  <RotateCw className="w-4 h-4 text-[var(--tissu-terracotta)]" />
                  {isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag"}
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSide("front")}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
                      activeSide === "front"
                        ? "bg-[var(--tissu-ink)] text-[var(--tissu-cream)]"
                        : "text-[var(--tissu-ink-soft)] hover:text-[var(--tissu-ink)]"
                    }`}
                  >
                    {isKa ? "გარე" : "Front"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide("back")}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
                      activeSide === "back"
                        ? "bg-[var(--tissu-ink)] text-[var(--tissu-cream)]"
                        : "text-[var(--tissu-ink-soft)] hover:text-[var(--tissu-ink)]"
                    }`}
                  >
                    {isKa ? "შიდა" : "Back"}
                  </button>
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveSide("front")}
                className={`relative w-20 h-20 rounded-[16px] overflow-hidden border-2 transition-colors ${
                  activeSide === "front" ? "border-[var(--tissu-ink)]" : "border-transparent"
                }`}
              >
                <Image src={product.image_front} alt="" fill className="object-cover" />
              </button>
              {hasBack && (
                <button
                  type="button"
                  onClick={() => setActiveSide("back")}
                  className={`relative w-20 h-20 rounded-[16px] overflow-hidden border-2 transition-colors ${
                    activeSide === "back" ? "border-[var(--tissu-ink)]" : "border-transparent"
                  }`}
                >
                  <Image src={product.image_back!} alt="" fill className="object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Info side */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tissu-ink-soft)] mb-3">
                {categoryLabel}
              </span>
              <h1 className="ka-display-lg font-serif text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)]">
                {name}
              </h1>
              {sub && <p className="text-[15px] text-[var(--tissu-ink-soft)] mt-2">{sub}</p>}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-[36px] text-[var(--tissu-terracotta)]">
                {product.price}
                {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
              </span>
              {inStock ? (
                <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-ink-soft)]">
                  {isKa ? `მარაგში · ${product.stock}` : `In stock · ${product.stock}`}
                </span>
              ) : (
                <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-terracotta)]">
                  {isKa ? "ამოიწურა" : "Sold out"}
                </span>
              )}
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[12px] font-bold">
                <Droplets className="w-3.5 h-3.5 text-[var(--tissu-cobalt)]" />
                {isKa ? "წყალგაუმტარი ტილო" : "Water-resistant canvas"}
              </span>
              {hasBack && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[12px] font-bold">
                  <RotateCw className="w-3.5 h-3.5 text-[var(--tissu-terracotta)]" />
                  {isKa ? "ორი მხარე, ერთი ჩანთა" : "Two sides, one bag"}
                </span>
              )}
            </div>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1 bg-[var(--tissu-white)] border border-[var(--border)] rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                  className="w-10 h-10 rounded-full inline-flex items-center justify-center hover:bg-[var(--tissu-cream)] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[28px] text-center font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase"
                  className="w-10 h-10 rounded-full inline-flex items-center justify-center hover:bg-[var(--tissu-cream)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={onAddToCart}
                disabled={!inStock}
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-6 py-4 rounded-full font-extrabold text-[15px] tracking-[0.02em] shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <ShoppingBag className="w-4 h-4" />
                {isKa ? "კალათაში დამატება" : "Add to basket"}
              </button>

              <button
                type="button"
                aria-label={copy.shop.card.favourite}
                className="w-14 h-14 rounded-full border-[1.5px] border-[var(--tissu-ink)] inline-flex items-center justify-center text-[var(--tissu-ink)] hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping / care strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-start gap-3 bg-[var(--tissu-white)] border border-[var(--border)] rounded-[20px] p-4">
                <div className="w-9 h-9 rounded-full bg-[var(--tissu-cream)] inline-flex items-center justify-center text-[var(--tissu-terracotta)]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[var(--tissu-ink)]">
                    {isKa ? "უფასო მიწოდება 150₾-დან" : "Free shipping over 150₾"}
                  </div>
                  <div className="text-[11px] text-[var(--tissu-ink-soft)]">
                    {isKa ? "იგზავნება თბილისიდან 2–4 დღეში" : "Ships from Tbilisi in 2–4 days"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[var(--tissu-white)] border border-[var(--border)] rounded-[20px] p-4">
                <div className="w-9 h-9 rounded-full bg-[var(--tissu-cream)] inline-flex items-center justify-center text-[var(--tissu-cobalt)]">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[var(--tissu-ink)]">
                    {isKa ? "გარეცხვა" : "Care"}
                  </div>
                  <div className="text-[11px] text-[var(--tissu-ink-soft)]">
                    {isKa ? "ხელით რეცხვა გრილი წყლით" : "Gentle hand-wash, cool water"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="ka-display-md font-serif text-[30px] md:text-[40px] leading-[1.05] tracking-[-0.02em] text-[var(--tissu-ink)] mb-8">
              {isKa ? "შესაძლოა ესეც მოგეწონოს" : "You might also love"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <AdminProductCard
                  key={p.id}
                  product={p}
                  lang={lang}
                  labels={{
                    addToBasket: copy.shop.card.addToBasket,
                    favourite: copy.shop.card.favourite,
                    outOfStock: isKa ? "ამოიწურა" : "Sold out",
                    flipSides: isKa ? "გადმოაბრუნე" : "Flip sides",
                    badges: copy.shop.badges,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
