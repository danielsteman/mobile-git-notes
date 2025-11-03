import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { setToken } from "@/lib/auth";
// themed components not used in the styled containers below

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
      <View className="flex-1 justify-center p-4">
        <View className="rounded-2xl border border-red-300 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-neutral-900">
          <Text className="text-xl font-semibold text-red-600 dark:text-red-400">
            Login Error
          </Text>
          <Text className="mt-2 text-base text-neutral-700 dark:text-neutral-300">
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center p-4">
      <View className="items-center rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <ActivityIndicator />
        <Text className="mt-2 text-base">Completing sign-in…</Text>
      </View>
    </View>
  );
}

// styles not needed; using NativeWind classes
