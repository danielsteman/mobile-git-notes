module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      [
        "module:@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          // Disable static extraction in development to avoid TypeScript parsing errors
          disableExtraction: process.env.NODE_ENV !== "production",
        },
      ],
    ],
  };
};
