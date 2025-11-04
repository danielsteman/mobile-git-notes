import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";
import { router } from "expo-router";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";

export default function Index() {
  const { isAuthenticated, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isLoading, isAuthenticated]);

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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center" p="$4" gap="$2" bg="$color1">
          <ActivityIndicator />
          <Text>Checking your session…</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} jc="center" gap="$4" p="$4" bg="$color1">
        <Text fontWeight="700">Sign in</Text>
        <Text>Use GitHub to continue.</Text>
        <Button title="Login with GitHub" onPress={handleLogin} />
      </YStack>
    </SafeAreaView>
  );
}
