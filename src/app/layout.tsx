import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://houra.app",
  ),
  title: {
    default: "HOURA — Zamanın Değeri",
    template: "%s | HOURA",
  },
  description:
    "Para harcamadan hizmet al ve ver. Zamanını takas et, yeteneklerini paylaş ve toplulukla büyü.",
  keywords: [
    "houra",
    "zaman bankası",
    "yetenek takası",
    "beceri paylaşımı",
    "saat kredisi",
    "dayanışma",
  ],
  authors: [{ name: "HOURA Team" }],
  creator: "HOURA",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://houra.app", // Placeholder, update if user has domain
    title: "HOURA — Zamanın Değeri",
    description:
      "Yeteneklerini zamanla takas et. Para harcamadan hizmet almanın en akıllı yolu.",
    siteName: "HOURA",
    images: [
      {
        url: "/og-image.png", // User should add this or I can generate a placeholder info
        width: 1200,
        height: 630,
        alt: "HOURA — Zamanın Değeri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOURA — Zamanın Değeri",
    description: "Yeteneklerini zamanla takas et.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
