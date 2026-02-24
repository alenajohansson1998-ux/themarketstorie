import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
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
