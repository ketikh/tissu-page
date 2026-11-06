/**
 * "Follow us" step before a game winner may ask for their code.
 *
 * A website cannot check whether someone really follows a page: Instagram and
 * Facebook do not share that. So this is an honour system: the winner has to
 * tap both buttons (each opens the shop's page) before the code button works.
 */

export type FollowId = "instagram" | "facebook";

export interface FollowLink {
  readonly id: FollowId;
  readonly label: string;
  readonly url: string;
}

interface Platform {
  readonly id: FollowId;
  readonly label: string;
  /** The address must be on this site (or a subdomain such as www. or m.). */
  readonly domain: string;
  /** Used when the shop admin has no address saved. Same pages as the site footer. */
  readonly fallbackUrl: string;
}

const PLATFORMS: readonly Platform[] = [
  { id: "instagram", label: "Instagram", domain: "instagram.com", fallbackUrl: "https://instagram.com/thetissushop" },
  { id: "facebook", label: "Facebook", domain: "facebook.com", fallbackUrl: "https://facebook.com/thetissushop" },
];

export const FOLLOW_IDS: readonly FollowId[] = PLATFORMS.map((platform) => platform.id);

/** Accepts only an https address on the platform's own domain. */
function trustedUrl(value: unknown, domain: string): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    const isOnDomain = url.hostname === domain || url.hostname.endsWith(`.${domain}`);
    return url.protocol === "https:" && isOnDomain ? value.trim() : null;
  } catch {
    return null; // Not an address at all.
  }
}

/** Builds the follow buttons from the addresses saved in the shop admin. */
export function buildFollowLinks(saved: Partial<Record<FollowId, unknown>>): FollowLink[] {
  return PLATFORMS.map((platform) => ({
    id: platform.id,
    label: platform.label,
    url: trustedUrl(saved[platform.id], platform.domain) ?? platform.fallbackUrl,
  }));
}
