"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/i18n/config";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  ink: "#2a1d14",
  softCream: "#f9f4eb",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

interface PromoCode {
  id: number;
  code: string;
  description?: string;
  discount_percent: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function PromoClient({ lang }: { lang: Locale }) {
  const isKa = lang === "ka";
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("10");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/promo-codes", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setCodes(Array.isArray(data?.promo_codes) ? data.promo_codes : []);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!newCode.trim()) return;
    setCreating(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discount_percent: Math.max(0, Math.min(100, Number(newDiscount) || 0)),
          active: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || d?.error || "Create failed");
      }
      setNewCode("");
      setNewDiscount("10");
      await load();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(c: PromoCode) {
    setBusyId(c.id);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || d?.error || "Update failed");
      }
      setCodes(prev => prev.map(p => p.id === c.id ? { ...p, active: !c.active } : p));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function setDiscount(c: PromoCode, value: number) {
    setBusyId(c.id);
    setErrorMessage(null);
    try {
      const v = Math.max(0, Math.min(100, value));
      const res = await fetch("/api/admin/promo-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, discount_percent: v }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || d?.error || "Update failed");
      }
      setCodes(prev => prev.map(p => p.id === c.id ? { ...p, discount_percent: v } : p));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(c: PromoCode) {
    if (!confirm(isKa ? `წავშალოთ ${c.code}?` : `Delete ${c.code}?`)) return;
    setBusyId(c.id);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/promo-codes?id=${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || d?.error || "Delete failed");
      }
      setCodes(prev => prev.filter(p => p.id !== c.id));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>
          Promo codes
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "6px 0 0" }}>
          აქტიური კოდი ერთბაშად ჩნდება საიტზე (~30 წამში cache-ის გავლით).
        </p>
      </div>

      {errorMessage && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.rose, background: `${C.rose}14`, border: `1px solid ${C.rose}33`, padding: "10px 12px", borderRadius: 10, margin: 0 }}>
          {errorMessage}
        </p>
      )}

      {/* New code */}
      <div style={{
        background: "white",
        border: `1px solid rgba(42,29,20,0.10)`,
        borderRadius: 18, padding: 18,
        position: "relative", overflow: "hidden",
      }}>
        <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.green }} />
        <h2 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.ink, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={14} style={{ color: C.green }} /> ახალი კოდი
        </h2>
        <div className="grid sm:grid-cols-[1fr_120px_auto] gap-3 items-end">
          <Field label={isKa ? "კოდი" : "Code"}>
            <input
              type="text"
              placeholder="WELCOME10"
              value={newCode}
              onChange={e => setNewCode(e.target.value.toUpperCase())}
              style={inputStyle}
            />
          </Field>
          <Field label={isKa ? "ფასდაკლება %" : "Discount %"}>
            <input
              type="number"
              min={0}
              max={100}
              value={newDiscount}
              onChange={e => setNewDiscount(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <button
            type="button"
            onClick={create}
            disabled={creating || !newCode.trim()}
            style={{
              height: 40, padding: "0 18px",
              fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
              color: "white", background: C.burnt,
              border: "none", borderRadius: 12,
              cursor: creating || !newCode.trim() ? "not-allowed" : "pointer",
              opacity: creating || !newCode.trim() ? 0.7 : 1,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {isKa ? "შექმნა" : "Create"}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.ink, opacity: 0.55, fontFamily: SANS, fontSize: 13 }}>
          <Loader2 size={14} className="animate-spin" /> {isKa ? "იტვირთება..." : "Loading..."}
        </div>
      ) : codes.length === 0 ? (
        <div style={{ background: "white", border: `1px solid rgba(42,29,20,0.10)`, borderRadius: 18, padding: 36, textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.55, margin: 0 }}>
            ჯერ არცერთი კოდი არ შექმნილა.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {codes.map(c => {
            const busy = busyId === c.id;
            return (
              <div key={c.id} style={{
                position: "relative",
                background: "white",
                border: `1px solid rgba(42,29,20,0.10)`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                overflow: "hidden",
              }}>
                <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: c.active ? C.green : C.rose }} />
                <span style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${c.active ? C.green : C.rose}1a`,
                  color: c.active ? C.green : C.rose,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Tag size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 16, color: C.ink, letterSpacing: "0.03em" }}>
                    {c.code}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, opacity: 0.55 }}>
                    {c.active ? (isKa ? "აქტიური" : "Active") : (isKa ? "გათიშული" : "Disabled")}
                    {c.updated_at && ` · ${new Date(c.updated_at).toLocaleDateString(isKa ? "ka-GE" : "en-US")}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={c.discount_percent}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== c.discount_percent) setDiscount(c, v);
                    }}
                    style={{ ...inputStyle, width: 70, height: 36, textAlign: "center" }}
                  />
                  <span style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 14, color: C.burnt }}>%</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(c)}
                  disabled={busy}
                  style={{
                    fontFamily: FRAUNCES, fontWeight: 600, fontSize: 12,
                    padding: "8px 14px", borderRadius: 999, cursor: busy ? "not-allowed" : "pointer",
                    background: c.active ? `${C.rose}14` : `${C.green}14`,
                    color: c.active ? C.rose : C.green,
                    border: `1.5px solid ${c.active ? C.rose : C.green}`,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {c.active ? (isKa ? "გათიშე" : "Disable") : (isKa ? "ჩართე" : "Enable")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  disabled={busy}
                  aria-label="Delete"
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "transparent", color: C.rose,
                    border: `1px solid rgba(42,29,20,0.10)`,
                    cursor: busy ? "not-allowed" : "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    opacity: busy ? 0.6 : 1,
                  }}
                  className="hover:bg-[rgba(196,132,154,0.08)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14, color: C.ink,
  width: "100%", height: 40, padding: "0 14px",
  background: "white",
  border: `1.5px solid rgba(42,29,20,0.14)`,
  borderRadius: 12,
  outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink, opacity: 0.55 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
