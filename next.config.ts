import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Hide the floating "N" / dev indicator at the bottom of the page so the
  // bottom-right corner stays clean during development.
  devIndicators: false,
  images: {
    remotePatterns: [
      // Cloudinary — product photos served by the tissu-agent admin.
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
