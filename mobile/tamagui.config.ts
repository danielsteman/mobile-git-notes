import { createTamagui, createTheme } from "tamagui";

// Catppuccin palettes (subset mapped to Tamagui tokens)
export const latte = {
  color1: "#eff1f5", // base
  color2: "#e6e9ef",
  color3: "#ccd0da",
  color4: "#bcc0cc",
  color5: "#acb0be",
  color6: "#9ca0b0",
  color7: "#8c8fa1",
  color8: "#7c7f93",
  color9: "#6c6f85",
  color10: "#5c5f77",
  color11: "#4c4f69", // text
  color12: "#4c4f69",
  blue10: "#1e66f5",
  red10: "#d20f39",
  // Additional accent/neutral tokens to align with web
  green10: "#40A02B",
  orange10: "#FE640B",
  purple10: "#8839EF",
  gray10: "#9ca0b0",
};

export const mocha = {
  color1: "#1e1e2e", // base
  color2: "#181825",
  color3: "#11111b",
  color4: "#313244",
  color5: "#45475a",
  color6: "#585b70",
  color7: "#6c7086",
  color8: "#7f849c",
  color9: "#9399b2",
  color10: "#a6adc8",
  color11: "#ffffff", // text
  color12: "#cdd6f4",
  blue10: "#89b4fa",
  red10: "#f38ba8",
  // Additional accent/neutral tokens to align with web
  green10: "#A6E3A1",
  orange10: "#FAB387",
  purple10: "#CBA6F7",
  gray10: "#6c7086",
};

const config = createTamagui({
  fonts: {
    body: {
      family: "System",
      size: { 4: 14, 5: 16, 6: 20 },
      lineHeight: { 4: 20, 5: 22, 6: 28 },
      weight: { 4: "400", 6: "700" },
      letterSpacing: { 4: 0, 5: 0, 6: 0 },
    },
  },
  tokens: {
    color: {
      ...latte, // base tokens; theme overrides for dark
    },
    space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, true: 16 },
    size: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, true: 16 },
    radius: { 1: 6, 2: 8, 3: 12 },
    zIndex: { 0: 0, 1: 10, 2: 20, 3: 30 },
  },
  themes: {
    latte: createTheme(latte),
    mocha: createTheme(mocha),
  },
  selectionStyles: (theme: { blue10: string; color1: string }) => ({
    backgroundColor: theme.blue10,
    color: theme.color1,
  }),
});

export default config;
