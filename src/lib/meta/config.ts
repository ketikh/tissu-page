// Meta tracking configuration. Read from the environment at call time so the
// same code works in tests, locally and on Railway. All values are optional:
// with no META_PIXEL_ID the pixel is simply not loaded, and without an access
// token the Conversions API sender is a no-op.

export const DEFAULT_GRAPH_API_VERSION = "v26.0";
const DEFAULT_SITE_URL = "https://tissu.ge";

export interface MetaConfig {
  pixelId: string;
  accessToken: string;
  testEventCode: string;
  domainVerification: string;
  graphApiVersion: string;
  siteUrl: string;
}

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getMetaConfig(): MetaConfig {
  return {
    pixelId: env("META_PIXEL_ID"),
    accessToken: env("META_CAPI_ACCESS_TOKEN"),
    testEventCode: env("META_TEST_EVENT_CODE"),
    domainVerification: env("META_DOMAIN_VERIFICATION"),
    graphApiVersion: env("META_GRAPH_API_VERSION") || DEFAULT_GRAPH_API_VERSION,
    siteUrl: (env("SITE_URL") || DEFAULT_SITE_URL).replace(/\/$/, ""),
  };
}

export function isCapiConfigured(config: MetaConfig = getMetaConfig()): boolean {
  return Boolean(config.pixelId && config.accessToken);
}
