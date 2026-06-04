"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Save, Check, RotateCcw, AlertCircle, Search } from "lucide-react";
import { Locale } from "@/i18n/config";
import { StorefrontProduct } from "@/lib/admin-api";
import {
  PhotoPosition,
  PhotoPositions,
  DEFAULT_POSITION,
  buildPhotoTransform,
  buildBackPhotoTransform,
  backTransform,
  buildHomePhotoTransform,
  buildHomeBackPhotoTransform,
  homeFrontTransform,
  homeBackTransform,
} from "@/lib/shop-photo-positions";
import { cloudinaryCutout } from "@/lib/cloudinary";
import { FRAMES as HOME_FRAMES, buildOuterPath, buildInnerPath } from "@/components/landing/RetroProducts";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  ink: "#2a1d14",
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  burnt: "#d56826",
  mustard: "#f3b62b",
  mustardDeep: "#d99820",
  green: "#3f6f56",
  rose: "#c4849a",
};

const FRAME_COLORS = [C.rose, C.green, C.mustard, "#6b9eb5"];

export default function PhotosClient({
  lang: _lang,
  products,
  initialPositions,
}: {
  lang: Locale;
  products: StorefrontProduct[];
  initialPositions: PhotoPositions;
}) {
  void _lang;
  // Hydrate from localStorage if the user had unsaved work — otherwise use
  // the server-loaded positions.
  const [positions, setPositions] = useState<PhotoPositions>(initialPositions);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const hydrated = useRef(false);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pull any locally-cached work the previous session might have left behind.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem("tissu-photo-positions-draft");
      if (!raw) return;
      const parsed = JSON.parse(raw) as PhotoPositions;
      if (parsed && typeof parsed === "object") {
        setPositions(prev => ({ ...prev, ...parsed }));
        // Mark every restored entry as dirty so the user sees them as
        // unsaved and can review before pushing to the server.
        setDirty(new Set(Object.keys(parsed)));
      }
    } catch { /* ignore corrupted drafts */ }
  }, []);

  // Auto-save positions to localStorage so a refresh / accidental close
  // never loses the work the admin spent time on.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem("tissu-photo-positions-draft", JSON.stringify(positions));
    } catch { /* quota / private mode — silently skip */ }
  }, [positions]);

  const visible = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    return products
      .filter(p => Boolean(p.image_front))
      .filter(p =>
        !trimmed ||
        (p.name || "").toLowerCase().includes(trimmed) ||
        (p.code || "").toLowerCase().includes(trimmed),
      );
  }, [products, q]);

  function updateOne(id: string, patch: Partial<PhotoPosition>) {
    setPositions(prev => {
      const current = prev[id] ?? DEFAULT_POSITION;
      return { ...prev, [id]: { ...current, ...patch } };
    });
    setDirty(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function resetOne(id: string) {
    setPositions(prev => ({ ...prev, [id]: { ...DEFAULT_POSITION } }));
    setDirty(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    try {
      // Drop entries that are exactly default to keep the payload small.
      const payload: Record<string, PhotoPosition> = {};
      for (const [id, pos] of Object.entries(positions)) {
        if (pos.scale === 1 && pos.x === 0 && pos.y === 0) continue;
        payload[id] = pos;
      }
      const res = await fetch("/api/admin/photo-positions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: payload }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || d?.error || `Save failed (${res.status})`);
      }
      setDirty(new Set());
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
      // Successful server save — we can drop the localStorage draft.
      try { localStorage.removeItem("tissu-photo-positions-draft"); } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const dirtyCount = dirty.size;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: FRAUNCES, fontWeight: 700,
            fontSize: "clamp(24px, 3vw, 32px)",
            color: C.ink, margin: 0, letterSpacing: "-0.01em",
          }}>
            ფოტოს პოზიციონირება
          </h1>
          <p style={{
            fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.6,
            margin: "6px 0 0",
          }}>
            დაარეგულირე თითო პროდუქტის ფოტო — zoom, ↔ ჰორიზონტალური, ↕ ვერტიკალური.
            ცვლილებები მაღაზიის გვერდზე ცოცხალდება შენახვის შემდეგ.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {error && (
            <span style={{
              fontFamily: SANS, fontSize: 12, color: C.rose,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <AlertCircle size={12} /> {error}
            </span>
          )}
          {savedAt && (
            <span style={{
              fontFamily: SANS, fontSize: 12, color: C.green, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <Check size={12} /> შენახულია
            </span>
          )}
          <span style={{
            fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.6,
          }}>
            {dirtyCount > 0
              ? `შენახული არ არის ${dirtyCount} ცვლილება`
              : "ცვლილებები არ არის"}
          </span>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving || dirtyCount === 0}
            style={{
              fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
              color: "white",
              background: dirtyCount === 0 ? "rgba(42,29,20,0.25)" : C.burnt,
              padding: "10px 20px", borderRadius: 12, border: "none",
              cursor: saving || dirtyCount === 0 ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              display: "inline-flex", alignItems: "center", gap: 6,
              transition: "background 0.18s",
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            შენახვა
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 360 }}>
        <Search size={14} style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: C.ink, opacity: 0.4,
        }} />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="ძებნა სახელით ან კოდით..."
          style={{
            fontFamily: SANS, fontSize: 13, color: C.ink,
            width: "100%", height: 40, padding: "0 14px 0 38px",
            background: "white",
            border: "1.5px solid rgba(42,29,20,0.14)",
            borderRadius: 999, outline: "none",
          }}
        />
      </div>

      {/* Grid of editor cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {visible.length === 0 && (
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.55, padding: 24 }}>
            პროდუქტი ვერ მოიძებნა.
          </p>
        )}

        {visible.map((p, i) => {
          const pos = positions[p.id] ?? DEFAULT_POSITION;
          const isDirty = dirty.has(p.id);
          const frameColor = FRAME_COLORS[i % FRAME_COLORS.length];
          const homeFrame  = HOME_FRAMES[i % HOME_FRAMES.length];
          return (
            <PhotoEditorCard
              key={p.id}
              product={p}
              position={pos}
              dirty={isDirty}
              frameColor={frameColor}
              homeFrame={homeFrame}
              onChange={(patch) => updateOne(p.id, patch)}
              onReset={() => resetOne(p.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function PhotoEditorCard({
  product,
  position,
  dirty,
  frameColor,
  homeFrame,
  onChange,
  onReset,
}: {
  product: StorefrontProduct;
  position: PhotoPosition;
  dirty: boolean;
  frameColor: string;
  homeFrame: typeof HOME_FRAMES[number];
  onChange: (patch: Partial<PhotoPosition>) => void;
  onReset: () => void;
}) {
  return (
    <div style={{
      background: "white",
      border: `1.5px solid ${dirty ? C.mustard : "rgba(42,29,20,0.10)"}`,
      borderRadius: 16,
      padding: 14,
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: dirty ? `0 4px 0 ${C.mustardDeep}` : "0 2px 0 rgba(42,29,20,0.06)",
      transition: "border-color 0.18s, box-shadow 0.18s",
    }}>
      {/* Title + reset */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {product.name || product.code}
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 11, color: C.ink, opacity: 0.55,
            marginTop: 2,
          }}>
            [{product.code}]
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          title="საწყის მდგომარეობაში დაბრუნება"
          style={{
            background: "transparent", border: "none", color: C.ink, opacity: 0.55,
            cursor: "pointer", padding: 4,
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Front photo */}
      <PhotoFace
        label="წინა ფოტო"
        product={product}
        frameColor={frameColor}
        previewKey={`pe-${product.id}-front`}
        url={product.image_front}
        transform={buildPhotoTransform(position)}
        scale={position.scale}
        x={position.x}
        y={position.y}
        onChange={(patch) => onChange(patch)}
      />

      {/* Back / hover photo — only shown when this product actually has one */}
      {product.image_back && (() => {
        const b = backTransform(position);
        return (
          <PhotoFace
            label="უკანა ფოტო (hover)"
            product={product}
            frameColor={frameColor}
            previewKey={`pe-${product.id}-back`}
            url={product.image_back}
            transform={buildBackPhotoTransform(position)}
            scale={b.scale}
            x={b.x}
            y={b.y}
            onChange={(patch) => {
              // Map front-style {scale,x,y} back to the back-* fields.
              const out: Partial<PhotoPosition> = {};
              if (patch.scale !== undefined) out.backScale = patch.scale;
              if (patch.x     !== undefined) out.backX     = patch.x;
              if (patch.y     !== undefined) out.backY     = patch.y;
              onChange(out);
            }}
          />
        );
      })()}

      {/* "Show on home" toggle + collapsible home-page-specific sliders */}
      <div style={{ borderTop: "1px solid rgba(42,29,20,0.10)", paddingTop: 12, marginTop: 4 }}>
        <label style={{
          display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", fontFamily: SANS, fontSize: 13, color: C.ink,
        }}>
          <input
            type="checkbox"
            checked={Boolean(position.homeFeatured)}
            onChange={(e) => onChange({ homeFeatured: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: C.burnt, cursor: "pointer" }}
          />
          <span style={{ fontWeight: 600 }}>მთავარ გვერდზე ჩვენება</span>
        </label>

        {position.homeFeatured && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Home front */}
            {(() => {
              const h = homeFrontTransform(position);
              return (
                <PhotoFace
                  label="მთავარი — წინა ფოტო"
                  product={product}
                  frameColor={frameColor}
                  previewKey={`pe-${product.id}-home-front`}
                  url={product.image_front}
                  transform={buildHomePhotoTransform(position)}
                  scale={h.scale}
                  x={h.x}
                  y={h.y}
                  aspectRatio="4 / 5"
                  viewBoxHeight={500}
                  homeFrame={homeFrame}
                  onChange={(patch) => {
                    const out: Partial<PhotoPosition> = {};
                    if (patch.scale !== undefined) out.homeScale = patch.scale;
                    if (patch.x     !== undefined) out.homeX     = patch.x;
                    if (patch.y     !== undefined) out.homeY     = patch.y;
                    onChange(out);
                  }}
                />
              );
            })()}

            {/* Home back / hover */}
            {product.image_back && (() => {
              const h = homeBackTransform(position);
              return (
                <PhotoFace
                  label="მთავარი — უკანა ფოტო (hover)"
                  product={product}
                  frameColor={frameColor}
                  previewKey={`pe-${product.id}-home-back`}
                  url={product.image_back}
                  transform={buildHomeBackPhotoTransform(position)}
                  scale={h.scale}
                  x={h.x}
                  y={h.y}
                  aspectRatio="4 / 5"
                  viewBoxHeight={500}
                  homeFrame={homeFrame}
                  onChange={(patch) => {
                    const out: Partial<PhotoPosition> = {};
                    if (patch.scale !== undefined) out.homeBackScale = patch.scale;
                    if (patch.x     !== undefined) out.homeBackX     = patch.x;
                    if (patch.y     !== undefined) out.homeBackY     = patch.y;
                    onChange(out);
                  }}
                />
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoFace({
  label,
  product,
  frameColor,
  previewKey,
  url,
  transform,
  scale,
  x,
  y,
  onChange,
  aspectRatio = "1 / 1",
  viewBoxHeight = 400,
  homeFrame,
}: {
  label: string;
  product: StorefrontProduct;
  frameColor: string;
  previewKey: string;
  url: string;
  transform: string;
  scale: number;
  x: number;
  y: number;
  onChange: (patch: { scale?: number; x?: number; y?: number }) => void;
  aspectRatio?: string;
  viewBoxHeight?: number;
  /** When provided, draw the scallop home-strip frame (outer matte + inner
   *  clip) instead of the plain rounded-rect preview used by the shop. */
  homeFrame?: typeof HOME_FRAMES[number];
}) {
  void product;
  const vbh = viewBoxHeight;
  const inset = 30;
  const innerW = 400 - inset * 2;
  const innerH = vbh - inset * 2;
  const radius = 56;

  const outerPath = homeFrame ? buildOuterPath(homeFrame.spec) : null;
  const innerPath = homeFrame ? buildInnerPath(homeFrame.spec) : null;
  const matteColor = homeFrame?.color ?? frameColor;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: C.ink, opacity: 0.6,
      }}>
        {label}
      </div>
      <div style={{
        aspectRatio,
        background: C.softCream,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(42,29,20,0.06)",
      }}>
        <svg viewBox={`0 0 400 ${vbh}`} style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <clipPath id={previewKey}>
              {homeFrame && innerPath
                ? <path d={innerPath} />
                : <rect x={inset} y={inset} width={innerW} height={innerH} rx={radius} ry={radius} />}
            </clipPath>
          </defs>

          {/* Outer scallop matte (only in home-frame mode) */}
          {homeFrame && outerPath && (
            <path d={outerPath} fill={matteColor} />
          )}

          <g clipPath={`url(#${previewKey})`}>
            <rect x="0" y="0" width="400" height={vbh} fill={matteColor} fillOpacity={homeFrame ? 0.32 : 0.18} />
            <PreviewImage url={url} transform={transform} viewBoxHeight={vbh} />
          </g>

          {/* Inner outline only on the rounded-rect (shop) preview */}
          {!homeFrame && (
            <rect
              x={inset} y={inset} width={innerW} height={innerH} rx={radius} ry={radius}
              fill="none" stroke={matteColor} strokeWidth="5"
            />
          )}
        </svg>
      </div>
      <SliderRow
        label="Zoom"
        value={scale}
        min={0.6} max={2} step={0.02}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(scale) => onChange({ scale })}
      />
      <SliderRow
        label="↔ ჰორიზონტ."
        value={x}
        min={-200} max={200} step={2}
        format={(v) => `${v > 0 ? "+" : ""}${v}`}
        onChange={(x) => onChange({ x })}
      />
      <SliderRow
        label="↕ ვერტიკალ."
        value={y}
        min={-200} max={200} step={2}
        format={(v) => `${v > 0 ? "+" : ""}${v}`}
        onChange={(y) => onChange({ y })}
      />
    </div>
  );
}

function PreviewImage({
  url,
  transform,
  viewBoxHeight = 400,
}: {
  url: string;
  transform: string;
  viewBoxHeight?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed ? url : cloudinaryCutout(url);
  return (
    <image
      href={src}
      x="0" y="0" width="400" height={viewBoxHeight}
      preserveAspectRatio="xMidYMin meet"
      transform={transform}
      onError={() => setFailed(true)}
    />
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: SANS, fontSize: 11, fontWeight: 600,
        color: C.ink, opacity: 0.65,
      }}>
        <span>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: C.burnt,
        }}
      />
    </div>
  );
}
