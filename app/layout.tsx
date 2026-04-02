import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LiveTicker from "../components/LiveTicker";

export const metadata: Metadata = {
  title: "The Market Stories | Financial News, Analysis & Tools",
  description: "Stay ahead with The Market Stories – your source for financial news, market analysis, stock tools, and expert opinions. Explore markets, brokers, and investment insights for smarter trading.",
  keywords: [
    "financial news",
    "stock market",
    "market analysis",
    "investment",
    "brokers",
    "trading tools",
    "economic calendar",
    "global markets",
    "finance blog",
    "market stories"
  ],
  openGraph: {
    title: "The Market Stories | Financial News, Analysis & Tools",
    description: "Stay ahead with The Market Stories – your source for financial news, market analysis, stock tools, and expert opinions.",
    url: "https://themarketstories.com/",
    siteName: "The Market Stories",
    type: "website",
    images: [
      {
        url: "/logos/header-2.PNG",
        width: 512,
        height: 128,
        alt: "The Market Stories Logo"
      }
    ]
  },
  icons: {
    icon: "/favicon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use Next.js segment for admin check
  const isAdmin = typeof window === "undefined"
    ? false // SSR: can't check, always show header/footer
    : window.location.pathname.startsWith("/admin");
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Inter font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
        {/* SEO Meta Tags */}
        <meta name="keywords" content="financial news, stock market, market analysis, investment, brokers, trading tools, economic calendar, global markets, finance blog, market stories" />
        <meta property="og:title" content="The Market Stories | Financial News, Analysis & Tools" />
        <meta property="og:description" content="Stay ahead with The Market Stories – your source for financial news, market analysis, stock tools, and expert opinions." />
        <meta property="og:image" content="/logos/header-2.PNG" />
        <meta property="og:url" content="https://themarketstories.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Market Stories | Financial News, Analysis & Tools" />
        <meta name="twitter:description" content="Stay ahead with The Market Stories – your source for financial news, market analysis, stock tools, and expert opinions." />
        <meta name="twitter:image" content="/logos/header-2.PNG" />
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
          {!isAdmin && <Header />}
          {!isAdmin && <LiveTicker />}
          <main className="main-flex">{children}</main>
          {!isAdmin && <Footer className="footer-sticky" />}
        </Providers>
      </body>
    </html>
  );
}
