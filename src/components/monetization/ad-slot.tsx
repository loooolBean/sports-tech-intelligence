"use client";

import { useRef } from "react";
import Script from "next/script";

declare global { interface Window { adsbygoogle?: Record<string, unknown>[] } }

export function AdSlot({ client, slot }: { client: string; slot: string }) {
  const requested = useRef(false);
  if (!client || !slot) return null;
  return <aside aria-label="Advertisement" className="my-8 border-y border-border py-4">
    <p className="mb-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Advertisement</p>
    <ins className="adsbygoogle block" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    <Script src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`} strategy="lazyOnload" crossOrigin="anonymous" onReady={() => {
      if (requested.current) return;
      requested.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }} />
  </aside>;
}
