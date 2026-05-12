"use client";

import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { useStoreHydration } from "@/store/useHydration";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  dictionary: any;
  lang: Locale;
}

const FRAUNCES = "var(--font-noto-sans), var(--font-nunito), 'Inter', system-ui, -apple-system, sans-serif";
const PRICE_FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  cream: "#fef0d6",
  ink: "#2a1d14",
  burnt: "#d56826",
  green: "#3f6f56",
  rose: "#c4849a",
};

function Price({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, fontFamily: FRAUNCES, color: C.ink, lineHeight: 1 }}>
      <span style={{ fontWeight: 700, fontSize: big ? 26 : 15, letterSpacing: "-0.02em" }}>{value}</span>
      <span style={{
        fontFamily: PRICE_FONT, fontWeight: 500,
        fontSize: big ? 12 : 11,
        color: C.ink, opacity: 0.55,
        marginBottom: big ? 3 : 1,
      }}>₾</span>
    </span>
  );
}

export function CartDrawer({ dictionary, lang }: CartDrawerProps) {
  useStoreHydration();
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, getSummary } = useCartStore();
  const { subtotal } = getSummary();
  const isKa = lang === "ka";

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(42,29,20,0.45)", backdropFilter: "blur(3px)" }}
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: "white", boxShadow: "-8px 0 32px rgba(42,29,20,0.14)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid rgba(42,29,20,0.08)` }}>
              <h2 style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18,
                color: C.ink, letterSpacing: "-0.005em",
                margin: 0,
              }}>
                {isKa ? "კალათა" : dictionary.cartDrawer.title}
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close"
                style={{
                  width: 36, height: 36, border: "none", background: "transparent",
                  borderRadius: 999, color: C.ink, opacity: 0.55,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  transition: "opacity 0.18s ease, background 0.18s ease",
                }}
                className="hover:!opacity-100 hover:bg-[rgba(42,29,20,0.05)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-5 px-6">
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 80, height: 80, borderRadius: "50%",
                    background: "#f9f4eb", color: C.burnt,
                  }}>
                    <ShoppingBag size={30} strokeWidth={1.6} />
                  </span>
                  <div className="space-y-2">
                    <p style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18, color: C.ink, margin: 0 }}>
                      {dictionary.cartDrawer.empty}
                    </p>
                    <p style={{ fontFamily: PRICE_FONT, fontSize: 13, color: C.ink, opacity: 0.6, margin: 0, maxWidth: 260 }}>
                      {dictionary.cartDrawer.discover}
                    </p>
                  </div>
                  <Link
                    href={`/${lang}/shop`}
                    onClick={closeCart}
                    style={{
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                      letterSpacing: "0.02em",
                      background: C.burnt, color: C.cream,
                      borderRadius: 999,
                      padding: "11px 24px",
                      display: "inline-flex", alignItems: "center", gap: 8,
                      textDecoration: "none",
                      transition: "transform 0.18s ease",
                    }}
                    className="hover:-translate-y-0.5"
                  >
                    {dictionary.cartDrawer.continue}
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const name = item.product?.name?.[lang] || item.product?.name?.['ka'] || "";
                    const variantField =
                      (item.variant as any)?.color ??
                      (item.variant as any)?.colorName ??
                      null;
                    const variantLabel = variantField?.[lang] || variantField?.['ka'] || "";
                    const linePrice = (item.variant?.price || item.product?.price || 0) * item.quantity;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.28 }}
                        className="flex gap-4 p-4"
                        style={{
                          background: "white",
                          borderRadius: 14,
                          border: `1px solid rgba(42,29,20,0.10)`,
                        }}
                      >
                        <div className="relative shrink-0 overflow-hidden" style={{ width: 70, height: 84, borderRadius: 10, background: "#f5f5f5" }}>
                          <Image
                            src={item.product.images[0] || "/placeholder.jpg"}
                            alt={name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex justify-between items-start gap-2">
                            <h3 style={{
                              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                              color: C.ink, lineHeight: 1.25,
                              margin: 0,
                              letterSpacing: "-0.005em",
                            }}>
                              {name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove"
                              style={{
                                border: "none", background: "transparent",
                                color: C.ink, opacity: 0.45, padding: 0,
                                cursor: "pointer",
                                transition: "opacity 0.18s ease, color 0.18s ease",
                              }}
                              className="hover:opacity-100 hover:!text-[#c4849a]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {variantLabel && (
                            <p style={{
                              fontFamily: PRICE_FONT, fontSize: 11.5, color: C.ink, opacity: 0.55,
                              margin: "3px 0 0 0",
                            }}>
                              {variantLabel}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-2.5">
                            <div style={{
                              display: "inline-flex", alignItems: "center",
                              border: `1.5px solid rgba(42,29,20,0.14)`,
                              borderRadius: 10,
                              background: "white",
                            }}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease"
                                style={{ width: 28, height: 30, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}
                              >
                                <Minus size={12} />
                              </button>
                              <span style={{
                                minWidth: 20, textAlign: "center",
                                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13, color: C.ink,
                              }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase"
                                style={{ width: 28, height: 30, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <Price value={linePrice} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5" style={{ borderTop: `1px solid rgba(42,29,20,0.08)`, background: "#fdfaf2" }}>
                <div className="flex items-baseline justify-between mb-1">
                  <span style={{
                    fontFamily: FRAUNCES, fontWeight: 700, fontSize: 15,
                    color: C.ink, letterSpacing: "-0.005em",
                  }}>
                    {dictionary.cartDrawer.subtotal}
                  </span>
                  <Price value={subtotal} big />
                </div>
                <p style={{
                  fontFamily: PRICE_FONT, fontSize: 12, color: C.ink, opacity: 0.5,
                  margin: "0 0 14px 0",
                }}>
                  {dictionary.cartDrawer.shipping}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    href={`/${lang}/cart`}
                    onClick={closeCart}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                      letterSpacing: "0.02em",
                      background: "transparent", color: C.ink,
                      border: `1.5px solid rgba(42,29,20,0.18)`,
                      borderRadius: 14,
                      padding: "11px 22px",
                      textDecoration: "none",
                      transition: "background 0.18s ease",
                    }}
                    className="hover:bg-[rgba(42,29,20,0.05)]"
                  >
                    {isKa ? "კალათაზე გადასვლა" : "View basket"}
                  </Link>
                  <Link
                    href={`/${lang}/checkout`}
                    onClick={closeCart}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      fontFamily: FRAUNCES, fontWeight: 600, fontSize: 14,
                      letterSpacing: "0.02em",
                      background: C.burnt, color: C.cream,
                      borderRadius: 14,
                      padding: "13px 22px",
                      textDecoration: "none",
                      transition: "transform 0.18s ease",
                    }}
                    className="hover:-translate-y-0.5"
                  >
                    {dictionary.cartDrawer.checkout}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <p style={{
                  fontFamily: PRICE_FONT, fontSize: 11, color: C.ink, opacity: 0.45,
                  textAlign: "center", margin: "12px 0 0 0",
                }}>
                  {dictionary.cartDrawer.secure}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
