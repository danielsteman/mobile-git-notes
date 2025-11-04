import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
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
    const returnTo = Linking.createURL("/oauth");
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      `${apiBase}/auth/github/callback?return_to=${encodeURIComponent(
        returnTo
      )}`
    )}`;
    await WebBrowser.openBrowserAsync(authorizeUrl);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    Alert.alert("Logged out");
  }, [logout]);

  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Text className="text-2xl font-bold">Profile</Text>
      <Text className="text-base">
        Status:{" "}
        <Text className="font-semibold">
          {isAuthenticated ? "Logged in" : "Logged out"}
        </Text>
      </Text>
      {isAuthenticated && user && (
        <View className="mt-2 flex-row items-center gap-3">
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : null}
          <Text className="text-lg font-medium">{user.login}</Text>
        </View>
      )}

      <View className="h-3" />

      {isAuthenticated ? (
        <Button title="Logout" onPress={handleLogout} />
      ) : (
        <Button title="Login with GitHub" onPress={handleLogin} />
      )}
    </View>
  );
}
