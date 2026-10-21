import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The source repository is public; publish browser maps so PageSpeed and production errors are traceable.
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.pexels.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  async rewrites() {
    return [
      // Category pages
      {
        source: '/category/:slug',
        destination: '/blog/category/:slug',
      },

      // Tag pages
      {
        source: '/tag/:slug',
        destination: '/blog/tag/:slug',
      },
    ];
  },

  async redirects() {
    return [
      {
        // Redirect www → non-www (except robots.txt)
        source: '/((?!robots\\.txt$).*)',
        has: [
          {
            type: 'host',
            value: 'www.themarketstories.com',
          },
        ],
        destination: 'https://themarketstories.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
