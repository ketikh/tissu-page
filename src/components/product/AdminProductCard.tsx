"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, RotateCw } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

interface AdminProductCardProps {
  product: StorefrontProduct;
  lang: Locale;
  /** Optional localized name/sub override (used on the landing where we have
   *  translated placeholders while the admin doesn't yet serve Georgian copy). */
  localized?: { name: string; sub: string } | null;
  labels: {
    addToBasket: string;
    favourite: string;
    outOfStock: string;
    flipSides?: string;
    badges: { new: string; bestseller: string; limited: string };
  };
}

function pickBadge(product: StorefrontProduct, labels: AdminProductCardProps["labels"]) {
  if (product.tags.includes("bestseller"))
    return { label: labels.badges.bestseller, tone: "mustard" as const };
  if (product.tags.includes("limited"))
    return { label: labels.badges.limited, tone: "ink" as const };
  if (product.tags.includes("new")) return { label: labels.badges.new, tone: "cobalt" as const };
  return null;
}

export function AdminProductCard({ product, lang, localized, labels }: AdminProductCardProps) {
  const [flipped, setFlipped] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const isFallback = product.id.startsWith("fallback-");
  const name = isFallback && localized ? localized.name : product.name || localized?.name || product.code;
  const sub =
    isFallback && localized
      ? localized.sub
      : [product.size, product.color].filter(Boolean).join(" · ") || localized?.sub || "";

  const badge = pickBadge(product, labels);
  const hasBack = Boolean(product.image_back);
  const activeImg = flipped && product.image_back ? product.image_back : product.image_front;
  const inStock = product.in_stock && product.stock > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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
              colorName: { en: "default", ka: "default" },
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
          colorName: { en: "default", ka: "default" },
          colorCode: "#264ba0",
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
    <Link
      href={`/${lang}/product/${product.id}`}
      className="group bg-[var(--tissu-white)] rounded-[28px] p-5 flex flex-col gap-4 relative overflow-hidden hover:-translate-y-1.5 transition-transform duration-300"
    >
      <div className="relative aspect-square rounded-[20px] overflow-hidden">
        {badge && (
          <span
            className={`absolute top-3.5 left-3.5 z-[2] px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.1em] ${
              badge.tone === "cobalt"
                ? "bg-[var(--tissu-cobalt)] text-white"
                : badge.tone === "mustard"
                ? "bg-[var(--tissu-mustard)] text-[var(--tissu-ink)]"
                : "bg-[var(--tissu-ink)] text-[var(--tissu-cream)]"
            }`}
          >
            {badge.label}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          aria-label={labels.favourite}
          className="absolute top-3.5 right-3.5 z-[2] w-10 h-10 rounded-full bg-[rgba(255,250,240,0.9)] backdrop-blur text-[var(--tissu-ink)] inline-flex items-center justify-center hover:bg-[var(--tissu-terracotta)] hover:text-white transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>

        {hasBack && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFlipped((f) => !f);
            }}
            aria-label={labels.flipSides ?? "Flip"}
            className="absolute bottom-3.5 right-3.5 z-[2] w-10 h-10 rounded-full bg-[rgba(255,250,240,0.9)] backdrop-blur text-[var(--tissu-ink)] inline-flex items-center justify-center hover:bg-[var(--tissu-ink)] hover:text-[var(--tissu-cream)] transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}

        <Image
          src={activeImg}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div>
        <h3 className="font-serif text-[22px] text-[var(--tissu-ink)] leading-tight">{name}</h3>
        {sub && <div className="text-[13px] text-[var(--tissu-ink-soft)] mt-1">{sub}</div>}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-serif text-[22px] text-[var(--tissu-terracotta)]">
          {product.price}
          {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
        </span>
        {!inStock && (
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
            {labels.outOfStock}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={!inStock}
        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--tissu-ink)] text-[var(--tissu-cream)] text-[13px] font-bold hover:bg-[var(--tissu-terracotta)] transition-colors self-start disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="w-4 h-4" />
        {labels.addToBasket}
      </button>
    </Link>
  );
}
