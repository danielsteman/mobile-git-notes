import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { externalDir: true },
  // Silence Next.js 16 Turbopack + webpack warning and set correct workspace root
  turbopack: {
    root: __dirname,
  },
  // Empty turbopack config silences Turbopack + webpack warning if you switch back later
  // turbopack: {},
  transpilePackages: ["tamagui", "react-native-web", "react-native-svg"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-native$": "react-native-web",
    };
    return config;
  },
};

export default nextConfig;
