import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, View, Text } from "react-native";
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
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      `${apiBase}/auth/github/callback`
    )}`;
    await WebBrowser.openBrowserAsync(authorizeUrl);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <ActivityIndicator />
        <Text className="mt-2 text-base">Checking your session…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center p-4">
      <View className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Text className="text-2xl font-bold">Sign in</Text>
        <Text className="mt-1 text-base text-neutral-600 dark:text-neutral-400">
          Use GitHub to continue.
        </Text>
        <Button
          title="Login with GitHub"
          onPress={handleLogin}
          className="mt-4"
        />
      </View>
    </View>
  );
}
