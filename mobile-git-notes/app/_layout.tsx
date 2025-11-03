import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect } from "react";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { UserProvider } from "@/lib/user-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useNativewindColorScheme();

  useEffect(() => {
    setColorScheme(colorScheme ?? "light");
  }, [colorScheme, setColorScheme]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </UserProvider>
    </ThemeProvider>
  );
}
