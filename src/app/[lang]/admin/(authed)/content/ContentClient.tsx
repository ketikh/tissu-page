"use client";

import { useEffect, useState, useTransition } from "react";
import { Locale } from "@/i18n/config";
import { CMS_PAGES, findPageSchema, type CMSSectionSchema, type CMSField } from "@/lib/cms-schema";
import { Loader2, Save, Check, AlertCircle, ImageIcon } from "lucide-react";

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

export default function ContentClient({
  lang: _lang,
  initialPage,
  initialPayloads,
}: {
  lang: Locale;
  initialPage: string;
  initialPayloads: Record<string, Record<string, unknown>>;
}) {
  void _lang;
  const [pageId, setPageId] = useState(initialPage);
  const [payloads, setPayloads] = useState(initialPayloads);
  const [loading, setLoading] = useState(false);
  const [pending] = useTransition();

  const schema = findPageSchema(pageId);

  useEffect(() => {
    if (pageId === initialPage) return;
    setLoading(true);
    fetch(`/api/admin/content?page=${encodeURIComponent(pageId)}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : { sections: [] })
      .then((data) => {
        const next: Record<string, Record<string, unknown>> = {};
        for (const s of data?.sections ?? []) next[s.section] = s.payload || {};
        setPayloads(next);
      })
      .catch(() => setPayloads({}))
      .finally(() => setLoading(false));
  }, [pageId, initialPage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: "clamp(24px, 3vw, 32px)", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>
          Content
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6, margin: "6px 0 0" }}>
          საიტის ტექსტებისა და ფოტოების მართვა. ცვლილებები ცოცხალია 30 წამში.
        </p>
      </div>

      {/* Page tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {CMS_PAGES.map(p => {
          const active = pageId === p.page;
          return (
            <button
              key={p.page}
              type="button"
              onClick={() => setPageId(p.page)}
              style={{
                fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
                padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                background: active ? C.burnt : "white",
                color: active ? "white" : C.ink,
                border: `1.5px solid ${active ? C.burnt : "rgba(42,29,20,0.12)"}`,
                transition: "background 0.18s ease, color 0.18s ease",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {loading || pending ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.ink, opacity: 0.55, fontFamily: SANS, fontSize: 13 }}>
          <Loader2 size={14} className="animate-spin" /> იტვირთება...
        </div>
      ) : !schema ? (
        <p style={{ fontFamily: SANS, fontSize: 14, color: C.ink, opacity: 0.6 }}>გვერდი ვერ მოიძებნა.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {schema.sections.map(s => (
            <SectionEditor
              key={s.section}
              page={pageId}
              schema={s}
              initial={payloads[s.section] || {}}
              onSaved={(payload) => setPayloads(prev => ({ ...prev, [s.section]: payload }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  page,
  schema,
  initial,
  onSaved,
}: {
  page: string;
  schema: CMSSectionSchema;
  initial: Record<string, unknown>;
  onSaved: (payload: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => normalize(initial, schema));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function normalize(payload: Record<string, unknown>, sch: CMSSectionSchema): Record<string, string> {
    const out: Record<string, string> = {};
    for (const f of sch.fields) out[f.key] = String(payload?.[f.key] ?? "");
    return out;
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, section: schema.section, payload: values }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.detail || d?.error || "Save failed");
      }
      onSaved(values);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // Pair _ka / _en fields so they sit on the same row.
  type RowField = { kind: "single"; field: CMSField } | { kind: "pair"; ka: CMSField; en: CMSField };
  const rows: RowField[] = [];
  const taken = new Set<string>();
  for (const f of schema.fields) {
    if (taken.has(f.key)) continue;
    if (f.key.endsWith("_ka")) {
      const enKey = f.key.replace(/_ka$/, "_en");
      const en = schema.fields.find(x => x.key === enKey);
      if (en) {
        rows.push({ kind: "pair", ka: f, en });
        taken.add(f.key); taken.add(enKey);
        continue;
      }
    }
    if (f.key.endsWith("_en")) {
      const kaKey = f.key.replace(/_en$/, "_ka");
      if (schema.fields.find(x => x.key === kaKey)) {
        // already added via _ka path
        continue;
      }
    }
    rows.push({ kind: "single", field: f });
  }

  return (
    <div style={{
      background: "white",
      border: `1px solid rgba(42,29,20,0.10)`,
      borderRadius: 18,
      padding: 22,
      position: "relative",
      overflow: "hidden",
    }}>
      <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.burnt }} />

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: FRAUNCES, fontWeight: 700, fontSize: 18, color: C.ink, margin: 0, letterSpacing: "-0.005em" }}>
          {schema.label}
        </h2>
        {schema.description && (
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, opacity: 0.6, margin: "6px 0 0", lineHeight: 1.55 }}>
            {schema.description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, idx) => {
          if (r.kind === "pair") {
            return (
              <div key={idx} className="grid sm:grid-cols-2 gap-3">
                <FieldInput field={r.ka} value={values[r.ka.key]} onChange={(v) => setValues({ ...values, [r.ka.key]: v })} />
                <FieldInput field={r.en} value={values[r.en.key]} onChange={(v) => setValues({ ...values, [r.en.key]: v })} />
              </div>
            );
          }
          return <FieldInput key={idx} field={r.field} value={values[r.field.key]} onChange={(v) => setValues({ ...values, [r.field.key]: v })} />;
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 18 }}>
        {error && (
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.rose, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <AlertCircle size={12} /> {error}
          </span>
        )}
        {savedAt && (
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.green, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Check size={12} /> შენახულია
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            fontFamily: FRAUNCES, fontWeight: 600, fontSize: 13,
            color: "white",
            background: C.burnt,
            opacity: saving ? 0.7 : 1,
            padding: "10px 20px", borderRadius: 12, border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            transition: "background 0.18s ease",
          }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          შენახვა
        </button>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CMSField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <FieldShell field={field}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          style={{ ...inputStyle, height: "auto", padding: "12px 14px", lineHeight: 1.55, resize: "vertical", minHeight: 80 }}
        />
      </FieldShell>
    );
  }
  if (field.type === "image") {
    return (
      <FieldShell field={field}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || "https://..."}
            style={inputStyle}
          />
          {value && /^https?:\/\//.test(value) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: C.softCream, border: "1px solid rgba(42,29,20,0.10)" }} />
          )}
          {!value && (
            <span style={{ width: 44, height: 44, borderRadius: 8, background: C.softCream, color: C.ink, opacity: 0.4, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <ImageIcon size={18} />
            </span>
          )}
        </div>
      </FieldShell>
    );
  }
  return (
    <FieldShell field={field}>
      <input
        type={field.type === "url" ? "url" : "text"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={inputStyle}
      />
    </FieldShell>
  );
}

function FieldShell({ field, children }: { field: CMSField; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink, opacity: 0.55 }}>
        {field.label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: SANS, fontSize: 14, color: C.ink,
  width: "100%", height: 42, padding: "0 14px",
  background: "white",
  border: `1.5px solid rgba(42,29,20,0.14)`,
  borderRadius: 12,
  outline: "none",
};
