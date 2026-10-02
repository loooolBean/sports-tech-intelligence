import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import { getAdSenseConfig } from "@/src/lib/monetization";

export const metadata = {
  title: "Sports Tech Intelligence | Daily Sports Technology News & Insights",
  description:
    "Daily intelligence on sports technology, performance technology, AI, wearables, sports science and the companies shaping the industry.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = <ClientLayout>{children}</ClientLayout>;
  const clerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_");
  const adSenseClient = getAdSenseConfig().client;
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate" type="application/rss+xml" title="Sports Tech Intelligence" href="/feed.xml" />
        {adSenseClient && <meta name="google-adsense-account" content={adSenseClient} />}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.classList.toggle("light",!d)}catch(e){}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-bg font-sans text-body text-text-primary antialiased">
        {clerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
