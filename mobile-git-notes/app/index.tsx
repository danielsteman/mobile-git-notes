import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { isLoggedIn } from "@/lib/auth";

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

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoggedIn(await isLoggedIn());
      setChecked(true);
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
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${encodeURIComponent(
      `${apiBase}/auth/github/callback`
    )}`;
    await WebBrowser.openBrowserAsync(authorizeUrl);
  }, []);

  if (!checked) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <ThemedText>Checking your session…</ThemedText>
      </View>
    );
  }

  if (loggedIn) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Welcome</ThemedText>
        <ThemedText>You’re signed in with GitHub.</ThemedText>
        <View style={{ height: 12 }} />
        <PrimaryButton
          title="Open Account"
          onPress={() => router.replace("/(tabs)/account")}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign in</ThemedText>
      <ThemedText>Use GitHub to continue.</ThemedText>
      <View style={{ height: 12 }} />
      <PrimaryButton title="Login with GitHub" onPress={handleLogin} />
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
  centered: {
    flex: 1,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
