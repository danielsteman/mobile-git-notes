import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { View } from "react-native";
import { PortalHost } from "@rn-primitives/portal";

// color scheme hook not needed while defaulting to dark

import { UserProvider } from "@/lib/user-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <UserProvider>
        <View className="dark flex-1">
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
          <StatusBar style="light" />
        </View>
      </UserProvider>
    </ThemeProvider>
  );
}
