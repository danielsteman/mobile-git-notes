// Metro configuration for Expo with NativeWind (inlineRem: 16)
// See: https://reactnativereusables.com/docs/installation

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  // Global CSS for NativeWind (web) and design tokens
  input: "./global.css",
  inlineRem: 16,
});
