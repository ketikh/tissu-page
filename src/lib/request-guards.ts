/** Small checks shared by the site's public POST endpoints. */

const DEFAULT_SITE_URL = "https://tissu.ge";

/**
 * Browsers always send Origin on a POST. It must be this site, not another
 * page posting on a visitor's behalf. Requests without Origin are not from a
 * browser; they are let through and left to the rate limits.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const siteHost = new URL(process.env.SITE_URL || DEFAULT_SITE_URL).host;
    const ownHosts = [req.headers.get("host"), req.headers.get("x-forwarded-host"), siteHost, `www.${siteHost}`];
    return ownHosts.includes(originHost);
  } catch {
    return false; // Unparseable Origin or SITE_URL: refuse rather than guess.
  }
}

export type BodyProblem = "too_large" | "bad_request";

/** Reads a small JSON object from the request body. */
export async function readJsonObject(req: Request, maxChars: number): Promise<Record<string, unknown> | BodyProblem> {
  const text = await req.text();
  if (text.length > maxChars) return "too_large";
  try {
    const parsed: unknown = JSON.parse(text);
    const isObject = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
    return isObject ? (parsed as Record<string, unknown>) : "bad_request";
  } catch {
    return "bad_request"; // Not JSON.
  }
}
