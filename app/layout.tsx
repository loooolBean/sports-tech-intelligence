import type { ReactNode } from "react";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata = {
  title: "Sports Technology Intelligence",
  description:
    "Daily news, research, and applied insight across wearables, athlete monitoring, performance analytics, and sports science technology.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate" type="application/rss+xml" title="Sports Tech Intelligence" href="/feed.xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");document.documentElement.classList.remove("light")}}catch(e){}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-bg font-sans text-body text-text-primary antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
