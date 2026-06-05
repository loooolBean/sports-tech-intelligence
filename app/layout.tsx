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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-bg font-sans text-body text-text-primary antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
