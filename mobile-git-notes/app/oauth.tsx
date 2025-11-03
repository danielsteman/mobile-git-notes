import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { setToken } from "@/lib/auth";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function OAuthCapture() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function persist() {
      try {
        if (!token || typeof token !== "string") {
          setError("Missing token in deep link.");
          return;
        }
        await setToken(token);
        router.replace("/(tabs)/home");
      } catch (e: any) {
        setError(e?.message ?? "Failed to store token");
      }
    }
    void persist();
  }, [token]);

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Login Error</ThemedText>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <ThemedText>Completing sign-in…</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
