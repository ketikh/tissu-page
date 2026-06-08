/**
 * Server-side helpers for the tissu-agent CMS endpoints.
 *
 *   GET  /api/admin/site/{page}                      → list saved sections
 *   PUT  /api/admin/site/{page}/{section}            → upsert one section
 *
 * The agent stores each page as a list of named "sections", each with a
 * free-form JSON payload. We define the field shape on the storefront side
 * (since the schema isn't published over OpenAPI) and let admins fill them in
 * through forms — bilingual fields use `_ka` / `_en` suffixes.
 */

const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/\/$/, "");
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function headers() {
  return {
    "X-API-Key": ADMIN_API_KEY!,
    Accept: "application/json",
  } as Record<string, string>;
}

export interface CMSSection {
  section: string;
  position?: number;
  payload: Record<string, unknown>;
  updated_at?: string;
}

export interface CMSPage {
  page: string;
  sections: CMSSection[];
}

export async function fetchCMSPage(page: string, opts: { revalidate?: number } = {}): Promise<CMSPage | null> {
  if (!ADMIN_API_URL || !ADMIN_API_KEY) return null;
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/admin/site/${encodeURIComponent(page)}`, {
      headers: headers(),
      next: { revalidate: opts.revalidate ?? 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CMSPage;
  } catch {
    return null;
  }
}

/** Convenience: pull one section's payload by name, or null. */
export async function fetchCMSSection<T extends Record<string, unknown>>(
  page: string,
  section: string,
  opts: { revalidate?: number } = {},
): Promise<T | null> {
  const data = await fetchCMSPage(page, opts);
  const found = data?.sections?.find(s => s.section === section);
  return (found?.payload as T) ?? null;
}

export async function putCMSSection(
  page: string,
  section: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; body: string }> {
  if (!ADMIN_API_URL || !ADMIN_API_KEY) {
    return { ok: false, status: 500, body: "Admin API not configured" };
  }
  try {
    const url = `${ADMIN_API_URL}/api/admin/site/${encodeURIComponent(page)}/${encodeURIComponent(section)}`;
    // The agent expects { payload: { ... } } — the upstream error says so:
    // {"detail":"payload must be an object"}.
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: err instanceof Error ? err.message : String(err) };
  }
}
