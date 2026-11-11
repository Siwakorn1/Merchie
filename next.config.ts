import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // keeps the phone view clean; errors still show
  // Dev only: let phones on the same Wi-Fi load dev assets (otherwise the app never hydrates there)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  cacheComponents: true,
  experimental: {
    // Dev-only: the on-disk Turbopack cache kept serving stale globals.css / Tailwind output
    // after edits. Builds still cache.
    turbopackFileSystemCacheForDev: false,
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
