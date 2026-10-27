"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { loadMetaPixel, trackMetaEvent } from "@/lib/meta/pixel-client";
import { contactChannelForHref } from "@/lib/meta/events";

interface MetaPixelProps {
  pixelId: string;
}

/** Loads the Meta Pixel once, fires PageView on every route change and
 *  reports clicks on conversation links (Instagram, Messenger, WhatsApp,
 *  email, phone) as Contact events. Renders nothing visible. */
export function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    loadMetaPixel(pixelId);
  }, [pixelId]);

  useEffect(() => {
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;
    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const href = target?.closest("a[href]")?.getAttribute("href") ?? "";
      const channel = href ? contactChannelForHref(href) : null;
      if (channel) trackMetaEvent("Contact", { content_name: channel });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height={1}
        width={1}
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
