/* eslint-disable import/no-unresolved */
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useCallback } from "react";
import { Alert, Image } from "react-native";
import { YStack, XStack, Text } from "tamagui";
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
    <YStack f={1} jc="center" gap="$4" p="$4">
      <Text fontWeight="700">Profile</Text>
      <Text>
        Status:{" "}
        <Text fontWeight="600">
          {isAuthenticated ? "Logged in" : "Logged out"}
        </Text>
      </Text>
      {isAuthenticated && user && (
        <XStack ai="center" gap="$3">
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : null}
          <Text fontWeight="600">{user.login}</Text>
        </XStack>
      )}

      {isAuthenticated ? (
        <Button title="Logout" onPress={handleLogout} />
      ) : (
        <Button title="Login with GitHub" onPress={handleLogin} />
      )}
    </YStack>
  );
}
