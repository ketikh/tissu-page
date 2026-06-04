"use client";

import { useState, useRef } from "react";
import { Loader2, Plus, Trash2, AlertCircle, Check, MessageSquare, GripVertical, Upload, X } from "lucide-react";
import { Locale } from "@/i18n/config";
import type { AdminReview } from "@/lib/admin-reviews";
import type { StorefrontProduct } from "@/lib/admin-api";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Deterministic timestamp format used in the list — avoids hydration
 *  mismatches caused by `toLocaleString()` falling back to en-US on the
 *  server when ka-GE locale data isn't available. */
function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Upload a single image File via our admin endpoint and return the URL. */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/uploads/image", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({} as Record<string, string>));
  if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
  if (!data.url) throw new Error("Upload missing URL");
  return data.url as string;
}

const C = {
  ink: "#2a1d14",
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  burnt: "#d56826",
  burntDeep: "#a64a18",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

export default function ReviewsClient({
  lang: _lang,
  initialReviews,
  products,
}: {
  lang: Locale;
  initialReviews: AdminReview[];
  products: StorefrontProduct[];
}) {
  void _lang;
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [productId, setProductId] = useState("");
  const [picker, setPicker] = useState<"none" | "product" | "upload">("none");
  const [uploading, setUploading] = useState(false);
  const productById = new Map(products.map(p => [p.id, p]));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Drag state — local to this session; the new order is persisted on drop.
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Which existing review currently has its inline photo editor open.
  const [editingId, setEditingId] = useState<string | null>(null);
  // Track whether a save is in-flight for the reorder, so we don't double-fire.
  const reorderInFlight = useRef(false);

  async function persistOrder(next: AdminReview[]) {
    if (reorderInFlight.current) return;
    reorderInFlight.current = true;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((r) => r.id) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Save failed (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      reorderInFlight.current = false;
    }
  }

  function onDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    setReviews((prev) => {
      const fromIdx = prev.findIndex((r) => r.id === draggingId);
      const toIdx   = prev.findIndex((r) => r.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      void persistOrder(next);
      return next;
    });
    setDraggingId(null);
    setDragOverId(null);
  }

  async function addReview(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      // If a product was picked, attach its photo automatically.
      const pickedProduct = productId ? productById.get(productId) : undefined;
      const effectivePhotoUrl =
        photoUrl.trim() || (pickedProduct?.image_front ?? "");
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          comment: comment.trim(),
          photoUrl: effectivePhotoUrl,
          productId: productId || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Save failed (${res.status})`);
      }
      const data = (await res.json()) as { review: AdminReview };
      setReviews((prev) => [data.review, ...prev]);
      setName("");
      setComment("");
      setPhotoUrl("");
      setProductId("");
      setPicker("none");
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function patchReview(id: string, patch: Partial<AdminReview>) {
    try {
      const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Save failed (${res.status})`);
      }
      const data = (await res.json()) as { review: AdminReview };
      setReviews((prev) => prev.map((r) => (r.id === id ? data.review : r)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      return false;
    }
  }

  async function removeReview(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Delete failed (${res.status})`);
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontFamily: FRAUNCES, fontWeight: 700,
          fontSize: "clamp(24px, 3vw, 32px)",
          color: C.ink, margin: 0, letterSpacing: "-0.01em",
        }}>
          შეფასებები
        </h1>
        <p style={{
          fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.6,
          margin: "6px 0 0",
        }}>
          დაამატე მომხმარებლის შეფასებები — სახელი (ან ინიციალები) და კომენტარი.
          მთავარი გვერდის Reviews სექციაში გამოჩნდება.
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={addReview}
        style={{
          background: "white",
          border: "1.5px solid rgba(42,29,20,0.10)",
          borderRadius: 16,
          padding: 18,
          display: "flex", flexDirection: "column", gap: 14,
          boxShadow: "0 2px 0 rgba(42,29,20,0.06)",
        }}
      >
        <div style={{
          fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Plus size={16} color={C.burnt} />
          ახალი შეფასება
        </div>

        <Field label="სახელი ან ინიციალები">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="მაგ. Nino K. ან ნ. ხ."
            required
            style={inputStyle}
          />
        </Field>

        <Field label="კომენტარი">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="რა ეწერა მომხმარებელს ჩანთის შესახებ..."
            rows={3}
            required
            style={{ ...inputStyle, height: "auto", padding: "12px 14px", lineHeight: 1.55, resize: "vertical", minHeight: 80 }}
          />
        </Field>

        {/* Photo / product picker — optional. The selected product's image
         *  is used as the review's photo on the home page. */}
        <Field label="ფოტო (არასავალდებულო)">
          <PhotoPicker
            products={products}
            productById={productById}
            productId={productId}
            photoUrl={photoUrl}
            picker={picker}
            uploading={uploading}
            setUploading={setUploading}
            setProductId={setProductId}
            setPhotoUrl={setPhotoUrl}
            setPicker={setPicker}
            onError={(msg) => setError(msg)}
          />
        </Field>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
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
              <Check size={12} /> დაემატა
            </span>
          )}
          <button
            type="submit"
            disabled={saving || !name.trim() || !comment.trim()}
            style={{
              fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
              color: "white",
              background: !name.trim() || !comment.trim() ? "rgba(42,29,20,0.25)" : C.burnt,
              padding: "10px 20px", borderRadius: 12, border: "none",
              cursor: saving || !name.trim() || !comment.trim() ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            დამატება
          </button>
        </div>
      </form>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.ink, opacity: 0.55,
        }}>
          {reviews.length === 0 ? "ჯერ არ არის შეფასებები" : `შენახული შეფასებები · ${reviews.length}`}
        </div>

        {reviews.length > 1 && (
          <p style={{
            fontFamily: SANS, fontSize: 11, color: C.ink, opacity: 0.5,
            margin: "-4px 4px 0",
          }}>
            გადააადგილე გადათრევით ▲▼ — შენახვა ავტომატურია.
          </p>
        )}
        {reviews.map((r) => {
          const reviewPicked = r.productId ? productById.get(r.productId) : undefined;
          const previewSrc = r.photoUrl || reviewPicked?.image_front || "";
          return (
          <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            draggable
            onDragStart={(e) => {
              setDraggingId(r.id);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", r.id);
            }}
            onDragOver={(e) => {
              if (!draggingId || draggingId === r.id) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverId !== r.id) setDragOverId(r.id);
            }}
            onDragLeave={() => {
              if (dragOverId === r.id) setDragOverId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(r.id);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setDragOverId(null);
            }}
            style={{
              background: "white",
              border: dragOverId === r.id
                ? `1.5px dashed ${C.burnt}`
                : "1.5px solid rgba(42,29,20,0.10)",
              borderRadius: 14,
              padding: 14,
              display: "flex", gap: 12, alignItems: "flex-start",
              boxShadow: "0 2px 0 rgba(42,29,20,0.05)",
              position: "relative",
              cursor: "grab",
              opacity: draggingId === r.id ? 0.45 : 1,
              transition: "opacity 0.15s, border-color 0.15s",
            }}
          >
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                title="გადათრევით გადააადგილე"
                style={{
                  width: 56, height: 56,
                  objectFit: "cover",
                  borderRadius: 12,
                  background: C.softCream,
                  flexShrink: 0,
                  border: "1px solid rgba(42,29,20,0.10)",
                }}
              />
            ) : (
              <span
                aria-hidden="true"
                title="გადათრევით გადააადგილე"
                style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `${C.burnt}1f`, color: C.burnt,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <MessageSquare size={18} />
                <GripVertical
                  size={12}
                  style={{
                    position: "absolute", bottom: -4, right: -4,
                    background: "white",
                    borderRadius: 4,
                    padding: 1,
                    color: C.ink,
                    opacity: 0.45,
                  }}
                />
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.ink,
              }}>
                {r.name}
              </div>
              <p style={{
                fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.75,
                margin: "4px 0 0", lineHeight: 1.6, whiteSpace: "pre-line",
              }}>
                {r.comment}
              </p>
              <div
                style={{
                  fontFamily: SANS, fontSize: 11, color: C.ink, opacity: 0.45,
                  marginTop: 6,
                }}
                // Locale name formatting differs between Node and the browser
                // (server falls back to en-US when ka-GE data is missing),
                // which causes a React hydration mismatch. We pre-format with
                // a deterministic string so both sides agree.
              >
                {formatStamp(r.createdAt)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                type="button"
                onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                aria-label="ფოტოს რედაქტირება"
                title="ფოტოს ცვლა / ატვირთვა"
                style={{
                  background: editingId === r.id ? `${C.burnt}1f` : "transparent",
                  border: "none",
                  color: editingId === r.id ? C.burnt : C.ink,
                  opacity: editingId === r.id ? 1 : 0.55,
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                }}
              >
                {previewSrc ? <Upload size={14} /> : <Plus size={14} />}
              </button>
              <button
                type="button"
                onClick={() => removeReview(r.id)}
                disabled={deletingId === r.id}
                aria-label="წაშლა"
                title="წაშლა"
                style={{
                  background: "transparent", border: "none",
                  color: C.ink, opacity: 0.55,
                  cursor: deletingId === r.id ? "wait" : "pointer",
                  padding: 6,
                }}
              >
                {deletingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>

          {editingId === r.id && (
            <ReviewPhotoEditor
              review={r}
              products={products}
              productById={productById}
              onSave={async (patch) => {
                const ok = await patchReview(r.id, patch);
                if (ok) setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
              onError={setError}
            />
          )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: C.ink, opacity: 0.55,
      }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14, color: C.ink,
  width: "100%", height: 42, padding: "0 14px",
  background: "white",
  border: "1.5px solid rgba(42,29,20,0.14)",
  borderRadius: 12,
  outline: "none",
};

function PhotoPicker({
  products,
  productById,
  productId,
  photoUrl,
  picker,
  uploading,
  setUploading,
  setProductId,
  setPhotoUrl,
  setPicker,
  onError,
}: {
  products: StorefrontProduct[];
  productById: Map<string, StorefrontProduct>;
  productId: string;
  photoUrl: string;
  picker: "none" | "product" | "upload";
  uploading: boolean;
  setUploading: (v: boolean) => void;
  setProductId: (id: string) => void;
  setPhotoUrl: (url: string) => void;
  setPicker: (p: "none" | "product" | "upload") => void;
  onError: (msg: string) => void;
}) {
  const picked = productId ? productById.get(productId) : undefined;
  const previewSrc = photoUrl.trim() || picked?.image_front || "";
  const fileRef = useRef<HTMLInputElement>(null);

  function clear() {
    setProductId("");
    setPhotoUrl("");
    setPicker("none");
  }

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPhotoUrl(url);
      setProductId("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Mode chooser */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ModeChip
          active={picker === "upload"}
          onClick={() => {
            const next = picker === "upload" ? "none" : "upload";
            setPicker(next);
            if (next === "upload") setTimeout(() => fileRef.current?.click(), 50);
          }}
        >
          {uploading ? <><Loader2 size={12} className="animate-spin" /> იტვირთება…</> : <><Upload size={12} /> ფოტოს ატვირთვა</>}
        </ModeChip>
        <ModeChip
          active={picker === "product"}
          onClick={() => setPicker(picker === "product" ? "none" : "product")}
        >
          პროდუქტიდან არჩევა
        </ModeChip>
        {(previewSrc || productId) && (
          <button
            type="button"
            onClick={clear}
            style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              color: C.ink, opacity: 0.6,
              background: "transparent", border: "none",
              cursor: "pointer", padding: "8px 10px",
            }}
          >
            მოშორება
          </button>
        )}
      </div>

      {/* Hidden file input — opened by the "Upload" chip */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // reset so the same file can be picked again later
          e.currentTarget.value = "";
        }}
      />

      {picker === "product" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: 8,
            maxHeight: 240,
            overflowY: "auto",
            padding: 8,
            background: C.softCream,
            border: "1px dashed rgba(42,29,20,0.18)",
            borderRadius: 12,
          }}
        >
          {products
            .filter((p) => Boolean(p.image_front))
            .map((p) => {
              const active = productId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProductId(p.id);
                    setPhotoUrl("");
                  }}
                  title={p.name || p.code}
                  style={{
                    aspectRatio: "1 / 1",
                    background: "white",
                    border: active ? `2.5px solid ${C.burnt}` : "1.5px solid rgba(42,29,20,0.10)",
                    borderRadius: 10,
                    padding: 0,
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_front}
                    alt={p.name || p.code}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              );
            })}
        </div>
      )}

      {previewSrc && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt=""
            style={{
              width: 64, height: 64,
              objectFit: "cover", borderRadius: 10,
              border: "1px solid rgba(42,29,20,0.10)",
              background: C.softCream,
            }}
          />
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.65 }}>
            {picked ? `[${picked.code}] ${picked.name || ""}` : "ატვირთული"}
          </span>
        </div>
      )}
    </div>
  );
}

function ReviewPhotoEditor({
  review,
  products,
  productById,
  onSave,
  onCancel,
  onError,
}: {
  review: AdminReview;
  products: StorefrontProduct[];
  productById: Map<string, StorefrontProduct>;
  onSave: (patch: Partial<AdminReview>) => Promise<void>;
  onCancel: () => void;
  onError: (msg: string) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState<string>(review.photoUrl ?? "");
  const [productId, setProductId] = useState<string>(review.productId ?? "");
  const [picker, setPicker] = useState<"none" | "product" | "upload">("none");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      // If a product was picked, use its image; else use the uploaded URL; else clear.
      const picked = productId ? productById.get(productId) : undefined;
      const effectiveUrl = photoUrl.trim() || (picked?.image_front ?? "");
      await onSave({
        photoUrl: effectiveUrl,
        productId: productId || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      await onSave({ photoUrl: "", productId: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: C.softCream,
        border: "1px solid rgba(42,29,20,0.10)",
        borderRadius: 12,
        padding: 14,
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: C.ink, opacity: 0.6,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{review.photoUrl || review.productId ? "ფოტოს ცვლა" : "ფოტოს დამატება"}</span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="დახურვა"
          style={{
            background: "transparent", border: "none",
            color: C.ink, opacity: 0.55,
            cursor: "pointer", padding: 4,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <PhotoPicker
        products={products}
        productById={productById}
        productId={productId}
        photoUrl={photoUrl}
        picker={picker}
        uploading={uploading}
        setUploading={setUploading}
        setProductId={setProductId}
        setPhotoUrl={setPhotoUrl}
        setPicker={setPicker}
        onError={onError}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
        {(review.photoUrl || review.productId) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={saving}
            style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              color: C.ink, opacity: 0.7,
              background: "transparent",
              border: "1.5px solid rgba(42,29,20,0.14)",
              borderRadius: 10,
              padding: "8px 14px",
              cursor: saving ? "wait" : "pointer",
            }}
          >
            ფოტოს მოშორება
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          style={{
            fontFamily: FRAUNCES, fontWeight: 700, fontSize: 13,
            color: "white",
            background: C.burnt,
            padding: "9px 18px", borderRadius: 10, border: "none",
            cursor: saving || uploading ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          შენახვა
        </button>
      </div>
    </div>
  );
}

function ModeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: SANS, fontSize: 12, fontWeight: 600,
        padding: "8px 14px",
        borderRadius: 999,
        background: active ? C.burnt : "white",
        color: active ? "white" : C.ink,
        border: active ? `1.5px solid ${C.burntDeep}` : "1.5px solid rgba(42,29,20,0.14)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
