import { useThemeName } from "tamagui";
import { latte, mocha } from "../tamagui.config";

type ThemeColorKey = keyof typeof latte;

/**
 * Hook to get a theme color value based on the active Tamagui theme.
 * Note: This uses a workaround because Tamagui's useTheme() returns base tokens
 * instead of theme values. We use useThemeName() to get the active theme and
 * manually select the correct theme colors.
 * @param colorKey - The color key to retrieve (e.g., "color11", "color1", "blue10")
 * @returns The color value as a string (e.g., "#ffffff")
 */
export function useTamaguiThemeColor(colorKey: ThemeColorKey): string {
  const themeName = useThemeName();
  const theme = themeName === "mocha" ? mocha : latte;
  return theme[colorKey];
}
