import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "../components/LayoutShell";
import Footer from "../components/Footer";
import { getHeaderCategories } from "@/lib/server/content";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const GA_ID = "G-20P43DVGXK";

// Section links in the header are read from the database at most once an hour.
export const revalidate = 3600;

// No canonical here: each route declares its own, so no page inherits the homepage's.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: SITE_LOCALE,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MarketStorie",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    types: { "application/rss+xml": [{ url: `${SITE_URL}/feed.xml`, title: `${SITE_NAME} RSS feed` }] },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getHeaderCategories();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning={true}>
      <head>
        <link rel="ai-catalog" href="/ai-catalog.json" type="application/ai-catalog+json" />
        <link rel="ard" href="/.well-known/ard.json" type="application/ld+json" />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          <LayoutShell footer={<Footer />} initialCategories={categories}>
            {children}
          </LayoutShell>
        </Providers>
        {/* Google Analytics, loaded when the browser is idle */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
        <Script id="ga-init" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
