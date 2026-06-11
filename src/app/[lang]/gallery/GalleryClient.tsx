"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { GalleryItem } from "@/lib/gallery";

const PACIFICO = "var(--font-pacifico), 'Pacifico', cursive";
const FRAUNCES = "var(--font-fraunces), 'Fraunces', Georgia, serif";
const ALK_LIFE = "var(--font-alk-life), serif";

const C = {
  cream: "#fef0d6",
  beige: "#f5e3c2",
  ink: "#2a1d14",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  burnt: "#d56826",
  rose: "#c4849a",
  green: "#3f6f56",
  champagne: "#c9a86c",
};

export default function GalleryClient({ lang, items }: { lang: Locale; items: GalleryItem[] }) {
  const isKa = lang === "ka";
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "#fffcf5",
        backgroundImage: "radial-gradient(rgba(243,182,43,0.10) 1.4px, transparent 1.4px)",
        backgroundSize: "26px 26px",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative pebbles & stars — match the home/contact retro vibe */}
      <span aria-hidden="true" style={{ position: "absolute", top: 70, left: "4%", opacity: 0.7, color: C.mustard }}>
        <svg width={18} height={18} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
      </span>
      <span aria-hidden="true" style={{ position: "absolute", top: 60, right: "8%", opacity: 0.7, color: C.burnt }}>
        <svg width={14} height={14} viewBox="0 0 24 24"><path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z" fill="currentColor" /></svg>
      </span>
      <div aria-hidden="true" style={{ position: "absolute", top: 180, right: "-3%", width: 130, height: 130, background: C.rose, opacity: 0.22, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%", transform: "rotate(12deg)" }} />
      <div aria-hidden="true" style={{ position: "absolute", top: 80, left: "-3%", width: 100, height: 100, background: C.mustard, opacity: 0.3, borderRadius: "55% 45% 50% 50% / 50% 55% 45% 50%", transform: "rotate(-12deg)" }} />

      <div className="container py-14 md:py-20 max-w-[1100px]" style={{ position: "relative" }}>
        {/* Hero */}
        <div className="mb-10 md:mb-14 text-center">
          <h1
            className="mb-3"
            style={{
              fontFamily: isKa ? ALK_LIFE : PACIFICO,
              fontWeight: isKa ? 700 : 400,
              fontSize: "clamp(34px, 5.5vw, 64px)",
              color: C.ink,
              lineHeight: 1.05,
            }}
          >
            {isKa ? "გალერეა" : "Gallery"}
          </h1>
          <p
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontSize: 15,
              color: C.ink,
              opacity: 0.65,
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {isKa
              ? "მომენტები სტუდიიდან, მოდელებიდან და Tissu-ს ცხოვრებიდან."
              : "Moments from the studio, on models and around Tissu life."}
          </p>
        </div>

        {/* Masonry grid using CSS columns — handles mixed aspect ratios cleanly */}
        {items.length === 0 ? (
          <EmptyState isKa={isKa} />
        ) : (
          <div
            style={{
              columnCount: 2,
              columnGap: 14,
            }}
            className="md:[column-count:3] lg:[column-count:4]"
          >
            {items.map((item, i) => (
              <Tile key={item.id} item={item} index={i} onOpen={() => setOpenIdx(i)} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom stripe to anchor the page above the footer */}
      <div
        aria-hidden="true"
        style={{
          height: 8,
          background: "repeating-linear-gradient(90deg, #c4849a 0 18px, #fef0d6 18px 36px)",
        }}
      />

      {/* Lightbox */}
      <Lightbox
        items={items}
        index={openIdx}
        onClose={() => setOpenIdx(null)}
        onPrev={() => setOpenIdx((i) => (i === null ? null : (i - 1 + items.length) % items.length))}
        onNext={() => setOpenIdx((i) => (i === null ? null : (i + 1) % items.length))}
      />
    </div>
  );
}

function Tile({ item, index, onOpen }: { item: GalleryItem; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(0.04 * index, 0.4) }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: 14,
        breakInside: "avoid",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(42,29,20,0.10)",
      }}
      className="hover:-translate-y-0.5 transition-transform"
      aria-label={item.caption || "Gallery photo"}
    >
      <div style={{ position: "relative", width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.caption || ""}
          loading="lazy"
          style={{
            width: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
        {item.caption && (
          <div
            style={{
              position: "absolute",
              left: 0, right: 0, bottom: 0,
              padding: "16px 14px 12px",
              background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
              color: "#fff",
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontSize: 13,
              textAlign: "left",
            }}
          >
            {item.caption}
          </div>
        )}
      </div>
    </motion.button>
  );
}

function EmptyState({ isKa }: { isKa: boolean }) {
  return (
    <div
      className="text-center py-20"
      style={{
        background: "white",
        border: `1.5px dashed ${C.champagne}`,
        borderRadius: 28,
      }}
    >
      <div style={{ fontSize: 36 }} aria-hidden="true">✦</div>
      <p
        style={{
          fontFamily: FRAUNCES,
          fontStyle: "italic",
          fontSize: 17,
          color: C.ink,
          opacity: 0.65,
          marginTop: 10,
        }}
      >
        {isKa
          ? "გალერეა ჯერ ცარიელია — ფოტოები მალე გამოჩნდება."
          : "The gallery is empty for now — photos coming soon."}
      </p>
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="close"
            style={{
              position: "fixed",
              top: 18, right: 20,
              width: 40, height: 40,
              borderRadius: "50%",
              background: "rgba(254,240,214,0.15)",
              color: "#fff",
              border: "1px solid rgba(254,240,214,0.4)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              zIndex: 71,
            }}
          >
            <X size={18} />
          </button>

          {items.length > 1 && (
            <>
              <ArrowBtn dir="left"  onClick={(e) => { e.stopPropagation(); onPrev(); }} />
              <ArrowBtn dir="right" onClick={(e) => { e.stopPropagation(); onNext(); }} />
            </>
          )}

          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(960px, 92vw)",
              maxHeight: "86vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.caption || ""}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 12,
                background: "rgba(254,240,214,0.06)",
              }}
            />
            {item.caption && (
              <p style={{
                color: "#fef0d6",
                fontFamily: FRAUNCES, fontStyle: "italic", fontSize: 14,
                marginTop: 12, textAlign: "center", opacity: 0.85,
              }}>
                {item.caption}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ArrowBtn({ dir, onClick }: { dir: "left" | "right"; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir}
      style={{
        position: "fixed",
        [dir === "left" ? "left" : "right"]: 18,
        top: "50%",
        transform: "translateY(-50%)",
        width: 44, height: 44,
        borderRadius: "50%",
        background: "rgba(254,240,214,0.18)",
        color: "#fff",
        border: "1px solid rgba(254,240,214,0.4)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        zIndex: 71,
        fontSize: 22,
        lineHeight: 1,
        fontFamily: FRAUNCES,
      } as React.CSSProperties}
    >
      {dir === "left" ? "‹" : "›"}
    </button>
  );
}
