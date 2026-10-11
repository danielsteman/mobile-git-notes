import type { NextConfig } from "next";
import { withTamagui } from "@tamagui/next-plugin";

const baseConfig: NextConfig = {
  experimental: { externalDir: true },
  turbopack: {
    root: __dirname,
  },
  transpilePackages: ["tamagui", "react-native-web", "react-native-svg"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-native$": "react-native-web",
    };
    return config;
  },
};

const tamagui = withTamagui({
  config: "./tamagui.config.ts",
  components: ["tamagui"],
  outputCSS: process.env.NODE_ENV === "production" ? "./public/tamagui.css" : null,
  disableExtraction: process.env.NODE_ENV === "development",
});

export default tamagui(baseConfig);
