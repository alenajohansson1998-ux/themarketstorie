import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "../components/LayoutShell";

const siteUrl = "https://themarketstories.com";
const defaultTitle = "The Market Stories | Financial News, Analysis & Market Insights";
const defaultDesc = "Stay ahead with The Market Stories – live market news, stock analysis, crypto, commodities, and investment tools. Trusted by traders and investors worldwide.";
const defaultImage = `${siteUrl}/logos/header-2.PNG`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | The Market Stories",
  },
  description: defaultDesc,
  keywords: [
    "financial news", "stock market", "market analysis", "investment", "brokers",
    "trading tools", "economic calendar", "global markets", "finance blog", "crypto news",
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: defaultTitle,
    description: defaultDesc,
    url: siteUrl,
    siteName: "The Market Stories",
    type: "website",
    locale: "en_US",
    images: [{ url: defaultImage, width: 1200, height: 630, alt: "The Market Stories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDesc,
    images: [defaultImage],
  },
  icons: { icon: "/favicon.png" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Inter font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="The Market Stories — RSS Feed" href="/feed.xml" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-20P43DVGXK"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-20P43DVGXK');
            `,
          }}
        />
      </head>
      <body className="layout-flex antialiased pt-24 sm:pt-28 md:pt-34" suppressHydrationWarning={true}>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
