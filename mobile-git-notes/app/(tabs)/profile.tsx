import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Alert, Image, View, Text } from "react-native";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useUser();

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

  const handleLogout = useCallback(async () => {
    await logout();
    Alert.alert("Logged out");
  }, [logout]);

  return (
    <View className="flex-1 justify-center p-4">
      <View className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Text className="text-2xl font-bold">Profile</Text>
        <Text className="mt-1 text-base text-neutral-600 dark:text-neutral-400">
          Status:{" "}
          <Text className="font-semibold">
            {isAuthenticated ? "Logged in" : "Logged out"}
          </Text>
        </Text>

        {isAuthenticated && user && (
          <View className="mt-4 flex-row items-center gap-3">
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={{ width: 56, height: 56, borderRadius: 28 }}
              />
            ) : null}
            <View>
              <Text className="text-lg font-medium">{user.login}</Text>
            </View>
          </View>
        )}

        <View className="mt-6 flex-row gap-3">
          {isAuthenticated ? (
            <Button title="Logout" onPress={handleLogout} />
          ) : (
            <Button title="Login with GitHub" onPress={handleLogin} />
          )}
        </View>
      </View>
    </View>
  );
}
