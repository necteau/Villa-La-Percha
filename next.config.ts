import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/faq",
        destination: "/villa-la-percha/faq",
        permanent: true,
      },
      {
        source: "/experience-the-island",
        destination: "/villa-la-percha/experience-the-island",
        permanent: true,
      },
      {
        source: "/experience-the-island/:path*",
        destination: "/villa-la-percha/experience-the-island/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
