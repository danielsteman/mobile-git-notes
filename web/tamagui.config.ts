import { createTamagui } from "tamagui";
import { latte, mocha } from "../mobile-git-notes/tamagui.config";

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
      ...latte,
    },
    space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, true: 16 },
    size: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, true: 16 },
    radius: { 1: 6, 2: 8, 3: 12 },
    zIndex: { 0: 0, 1: 10, 2: 20, 3: 30 },
  },
  themes: {
    latte,
    mocha,
  },
  selectionStyles: (theme: Record<string, string>) => ({
    backgroundColor: theme.blue10,
    color: theme.color1,
  }),
});

export default config;
