import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { clearToken, isLoggedIn } from "@/lib/auth";

export default function AccountScreen() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      setLoggedIn(await isLoggedIn());
    })();
  }, []);

  const handleLogin = useCallback(async () => {
    const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
    const apiBase = process.env.EXPO_PUBLIC_API_BASE;
    if (!clientId || !apiBase) {
      Alert.alert(
        "Missing configuration",
        "Set EXPO_PUBLIC_* env vars and rebuild."
      );
      return;
    }
    const returnTo = Linking.createURL("/oauth");
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      `${apiBase}/auth/github/callback?return_to=${encodeURIComponent(
        returnTo
      )}`
    )}`;
    await WebBrowser.openBrowserAsync(authorizeUrl);
  }, []);

  const handleLogout = useCallback(async () => {
    await clearToken();
    setLoggedIn(false);
    Alert.alert("Logged out");
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} p="$4" jc="center" gap="$4" bg="$color1">
        <Text fontWeight="700">Account</Text>
        <XStack ai="center" gap="$2">
          <Text>Status:</Text>
          <Text fontWeight="600">{loggedIn ? "Logged in" : "Logged out"}</Text>
        </XStack>
        {loggedIn ? (
          <Button title="Logout" onPress={handleLogout} />
        ) : (
          <Button title="Login with GitHub" onPress={handleLogin} />
        )}
      </YStack>
    </SafeAreaView>
  );
}
