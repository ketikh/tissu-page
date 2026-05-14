"use client";

/**
 * Tiny admin-edit chrome that lives on the storefront. When the current
 * request carries a valid admin session cookie:
 *   - a floating toolbar appears in the bottom-right corner with an
 *     "Edit page" toggle
 *   - any text wrapped in <EditableText> picks up a hover halo + pencil
 *     handle that opens an inline editor; on blur it saves the new value
 *     through /api/admin/content
 *
 * This is intentionally minimal — we don't push the whole site through a
 * CMS, only the texts the developer explicitly opts into.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Check, X, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react";

const FRAUNCES = "var(--font-alk-life), var(--font-fraunces), 'Fraunces', Georgia, serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";

const C = {
  cream: "#fef0d6",
  softCream: "#f9f4eb",
  ink: "#2a1d14",
  burnt: "#d56826",
  mustard: "#f3b62b",
  green: "#3f6f56",
  rose: "#c4849a",
};

type EditState = {
  isAdmin: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
  saveField: (page: string, section: string, key: string, value: string) => Promise<{ ok: boolean; error?: string }>;
};

const ctx = createContext<EditState>({
  isAdmin: false,
  editMode: false,
  toggleEditMode: () => {},
  saveField: async () => ({ ok: false, error: "no-op" }),
});

export function useAdminEdit() {
  return useContext(ctx);
}

export function AdminEditProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Cache the section payloads we've already loaded so multiple fields on
  // the same section share one PUT — avoids the agent overwriting siblings.
  const cache = useRef<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    fetch("/api/admin/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(r => r.ok ? r.json() : { admin: false })
      .then(d => setIsAdmin(Boolean(d?.admin)))
      .catch(() => setIsAdmin(false));
  }, []);

  const saveField = useCallback(
    async (page: string, section: string, key: string, value: string) => {
      const cacheKey = `${page}::${section}`;
      try {
        let payload = cache.current[cacheKey];
        if (!payload) {
          // Pull the current full section payload so we don't accidentally
          // wipe sibling fields when PUT-ing.
          const r = await fetch(`/api/admin/content?page=${encodeURIComponent(page)}`, { cache: "no-store" });
          const data = await r.json().catch(() => ({}));
          const found = (data?.sections || []).find((s: { section: string }) => s.section === section);
          payload = (found?.payload as Record<string, unknown>) || {};
          cache.current[cacheKey] = payload;
        }
        const next = { ...payload, [key]: value };
        cache.current[cacheKey] = next;

        const res = await fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page, section, payload: next }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          return { ok: false, error: d?.detail || d?.error || "Save failed" };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
      }
    },
    [],
  );

  const value = useMemo<EditState>(() => ({
    isAdmin,
    editMode,
    toggleEditMode: () => setEditMode(v => !v),
    saveField,
  }), [isAdmin, editMode, saveField]);

  return (
    <ctx.Provider value={value}>
      {children}
      {isAdmin && <AdminToolbar editMode={editMode} onToggle={() => setEditMode(v => !v)} />}
    </ctx.Provider>
  );
}

function AdminToolbar({ editMode, onToggle }: { editMode: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20, right: 20,
        zIndex: 9999,
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px",
        background: editMode ? C.burnt : "white",
        color: editMode ? C.cream : C.ink,
        border: `1.5px solid ${editMode ? C.burnt : "rgba(42,29,20,0.18)"}`,
        borderRadius: 999,
        boxShadow: "0 10px 30px rgba(42,29,20,0.18)",
        fontFamily: FRAUNCES, fontSize: 13, fontWeight: 600,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 10px",
          background: "transparent", color: "inherit",
          border: "none", borderRadius: 999, cursor: "pointer",
          fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
        }}
        title={editMode ? "Stop editing" : "Edit page"}
      >
        {editMode ? <EyeOff size={14} /> : <Eye size={14} />}
        {editMode ? "Editing" : "Edit page"}
      </button>
      <span style={{ width: 1, height: 18, background: editMode ? "rgba(254,240,214,0.4)" : "rgba(42,29,20,0.18)" }} />
      <a
        href="/ka/admin"
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "6px 10px",
          color: "inherit", textDecoration: "none",
          opacity: 0.8,
        }}
        className="hover:opacity-100"
        title="Open admin"
      >
        Admin <ExternalLink size={12} />
      </a>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * EditableText — wrap any string with this. When not in edit mode (or the
 * viewer is not an admin) it renders plain text. When the admin toggles
 * editing on, the text gets a dotted halo + pencil handle; clicking starts
 * an inline editor that saves on Enter / blur.
 * ─────────────────────────────────────────────────────────────────────────── */

export function EditableText({
  page,
  section,
  fieldKey,
  defaultValue,
  multiline = false,
  as = "span",
  className,
  style,
}: {
  page: string;
  section: string;
  fieldKey: string;
  defaultValue: string;
  multiline?: boolean;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  className?: string;
  style?: React.CSSProperties;
}) {
  const { isAdmin, editMode, saveField } = useAdminEdit();
  const [value, setValue] = useState(defaultValue);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep our copy in sync if the page rehydrates with new defaultValue.
  useEffect(() => { setValue(defaultValue); setDraft(defaultValue); }, [defaultValue]);

  if (!isAdmin || !editMode) {
    const Tag = as as React.ElementType;
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  if (drafting) {
    return (
      <span style={{ display: "inline-flex", alignItems: "stretch", gap: 6, verticalAlign: "baseline", ...style }} className={className}>
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={Math.max(2, draft.split("\n").length)}
            style={{
              fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
              color: "inherit", background: "white",
              border: `2px solid ${C.burnt}`,
              borderRadius: 8, padding: "4px 8px", outline: "none",
              minWidth: 200, resize: "vertical",
            }}
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
              if (e.key === "Escape") { e.preventDefault(); cancel(); }
            }}
            style={{
              fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
              color: "inherit", background: "white",
              border: `2px solid ${C.burnt}`,
              borderRadius: 8, padding: "2px 8px", outline: "none",
              minWidth: 200,
            }}
          />
        )}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={commit}
            disabled={saving}
            aria-label="Save"
            style={iconBtn(C.green)}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            aria-label="Cancel"
            style={iconBtn(C.rose)}
          >
            <X size={12} />
          </button>
        </span>
        {error && <span style={{ fontFamily: SANS, fontSize: 11, color: C.rose, marginLeft: 4 }}>{error}</span>}
      </span>
    );
  }

  const Tag = as as React.ElementType;
  return (
    <Tag
      className={className}
      style={{
        ...style,
        position: "relative",
        outline: `2px dashed ${C.burnt}66`,
        outlineOffset: 4,
        borderRadius: 4,
        cursor: "text",
      }}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        setDraft(value);
        setDrafting(true);
      }}
      title="Click to edit"
    >
      {value || <em style={{ opacity: 0.4 }}>empty — click to add</em>}
      <span style={{
        position: "absolute", top: -10, right: -10,
        width: 20, height: 20, borderRadius: "50%",
        background: C.burnt, color: C.cream,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <Pencil size={11} />
      </span>
    </Tag>
  );

  async function commit() {
    setSaving(true);
    setError(null);
    const next = draft.trim();
    const result = await saveField(page, section, fieldKey, next);
    setSaving(false);
    if (!result.ok) {
      setError(result.error || "Save failed");
      return;
    }
    setValue(next);
    setDrafting(false);
  }
  function cancel() {
    setDraft(value);
    setDrafting(false);
    setError(null);
  }
}

function iconBtn(color: string): React.CSSProperties {
  return {
    width: 22, height: 22, borderRadius: "50%",
    border: "none",
    background: `${color}1f`, color,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  };
}
