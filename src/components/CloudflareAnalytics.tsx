"use client";

import { useEffect } from "react";

// Cloudflare Web Analytics beacon, injected manually so we can SKIP it for the
// site owner. (Cloudflare's automatic injection can't be filtered by visitor,
// so we switch Web Analytics to "JS Snippet" mode and load the beacon here.)
//
// The public beacon token comes from the env var below — it is not a secret
// (it ships to every browser), so NEXT_PUBLIC_ is correct. When the var is
// absent the component does nothing, so the site is safe before it is set.
const TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

// Owners opt their browser out by visiting any page with ?analytics=off once.
// The choice is remembered in localStorage, so their later visits are never
// counted — on that browser, forever — with no extension to fiddle with.
const OPT_OUT_KEY = "tissu_no_analytics";

export default function CloudflareAnalytics() {
  useEffect(() => {
    if (!TOKEN) return;

    let excluded = false;
    try {
      const flag = new URLSearchParams(window.location.search).get("analytics");
      if (flag === "off") localStorage.setItem(OPT_OUT_KEY, "1");
      if (flag === "on") localStorage.removeItem(OPT_OUT_KEY);
      excluded = localStorage.getItem(OPT_OUT_KEY) === "1";
    } catch {
      // Private mode / blocked storage — fall through and count the visit.
      excluded = false;
    }
    if (excluded) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
