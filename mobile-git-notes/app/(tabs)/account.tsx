import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { clearToken, isLoggedIn } from "@/lib/auth";

function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={styles.button}
      onPress={onPress}
    >
      <ThemedText style={styles.buttonText}>{title}</ThemedText>
    </Pressable>
  );
}

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
    <ThemedView style={styles.container}>
      <ThemedText type="title">Account</ThemedText>
      <ThemedText>
        Status:{" "}
        <ThemedText type="defaultSemiBold">
          {loggedIn ? "Logged in" : "Logged out"}
        </ThemedText>
      </ThemedText>
      <View style={{ height: 12 }} />
      {loggedIn ? (
        <PrimaryButton title="Logout" onPress={handleLogout} />
      ) : (
        <PrimaryButton title="Login with GitHub" onPress={handleLogin} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    gap: 12,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
