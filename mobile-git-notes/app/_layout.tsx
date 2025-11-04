/* eslint-disable import/no-unresolved */
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { UserProvider } from "@/lib/user-context";
import { TamaguiProvider, Theme } from "tamagui";
import config from "../tamagui.config";
import { ThemePrefProvider, useThemePref } from "@/lib/theme-preference";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppThemeWrapper({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const { pref } = useThemePref();
  const isDark = pref === "system" ? system === "dark" : pref === "mocha";

  const NavLight = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#eff1f5",
      card: "#eff1f5",
      border: "#e6e9ef",
      text: "#4c4f69",
    },
  } as const;
  const NavDark = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#1e1e2e",
      card: "#1e1e2e",
      border: "#181825",
      text: "#cdd6f4",
    },
  } as const;

  return (
    <ThemeProvider value={isDark ? NavDark : NavLight}>
      <Theme name={isDark ? "mocha" : "latte"}>{children}</Theme>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <ThemePrefProvider>
        <UserProvider>
          <AppThemeWrapper>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </AppThemeWrapper>
        </UserProvider>
      </ThemePrefProvider>
    </TamaguiProvider>
  );
}
