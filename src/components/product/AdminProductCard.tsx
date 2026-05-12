"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, RotateCw } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/lib/admin-api";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  burntDeep: "#a84e1a",
  champagne: "#c9a86c",
  rose: "#c4849a",
  green: "#3f6f56",
};

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
  if (product.tags.includes("new")) return { label: labels.badges.new, tone: "rose" as const };
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
          tags: product.tags ?? [],
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

  /* Badge background colour */
  const badgeBg =
    badge?.tone === "mustard"
      ? C.mustard
      : badge?.tone === "rose"
      ? C.rose
      : C.ink;

  const badgeColor =
    badge?.tone === "mustard" ? C.ink : C.cream;

  return (
    <Link
      href={`/${lang}/product/${product.id}`}
      className="group rounded-[28px] p-5 flex flex-col gap-4 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
      style={{
        background: C.cream,
        boxShadow: "0 8px 20px rgba(42,29,20,0.12)",
      }}
    >
      {/* Image area */}
      <div className="relative aspect-square rounded-[20px] overflow-hidden">
        {/* Badge */}
        {badge && (
          <span
            className="absolute top-3.5 left-3.5 z-2 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest"
            style={{
              background: badgeBg,
              color: badgeColor,
              fontFamily: FRAUNCES,
            }}
          >
            {badge.label}
          </span>
        )}

        {/* Heart */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          aria-label={labels.favourite}
          className="absolute top-3.5 right-3.5 z-2 w-10 h-10 rounded-full inline-flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: C.cream, color: C.ink }}
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Flip */}
        {hasBack && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFlipped((f) => !f);
            }}
            aria-label={labels.flipSides ?? "Flip"}
            className="absolute bottom-3.5 right-3.5 z-2 w-10 h-10 rounded-full inline-flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: C.cream, color: C.ink }}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}

        <Image
          src={activeImg}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02] group-hover:-rotate-1"
        />
      </div>

      {/* Text */}
      <div>
        <h3
          className="leading-tight"
          style={{
            fontFamily: FRAUNCES,
            fontStyle: "italic",
            fontSize: "20px",
            color: C.ink,
          }}
        >
          {name}
        </h3>
        {sub && (
          <div
            className="mt-1 uppercase tracking-[0.25em]"
            style={{ fontSize: "11px", color: C.champagne }}
          >
            {sub}
          </div>
        )}
      </div>

      {/* Price row */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: PACIFICO,
            fontSize: "24px",
            color: C.burnt,
          }}
        >
          {product.price}
          {product.currency === "GEL" ? "₾" : ` ${product.currency}`}
        </span>

        {!inStock && (
          <span
            className="px-3 py-1 rounded-full font-bold uppercase tracking-widest"
            style={{ fontSize: "11px", background: C.champagne, color: C.ink }}
          >
            {labels.outOfStock}
          </span>
        )}
      </div>

      {/* Add to basket */}
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={!inStock}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-extrabold text-[12px] uppercase tracking-[0.2em] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 self-start disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          fontFamily: FRAUNCES,
          background: C.ink,
          color: C.cream,
          boxShadow: "0 5px 0 rgba(42,29,20,0.4)",
          fontWeight: 800,
        }}
      >
        <ShoppingBag className="w-4 h-4" />
        {labels.addToBasket}
      </button>
    </Link>
  );
}
