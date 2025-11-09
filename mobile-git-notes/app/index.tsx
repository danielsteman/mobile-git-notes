import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";
import { router } from "expo-router";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { provider } from "@/lib/providers";
import { useNotePrefs } from "@/lib/note-preferences";

export default function Index() {
  const { isAuthenticated, isLoading, refreshUser } = useUser();
  const { prefs, isReady } = useNotePrefs();

  useEffect(() => {
    if (!isLoading && isAuthenticated && isReady) {
      if (prefs.repo && prefs.folder) {
        router.replace("/(tabs)/editor");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }, [isLoading, isAuthenticated, isReady, prefs.repo, prefs.folder]);

  const handleLogin = useCallback(async () => {
    try {
      const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
      if (!clientId) {
        Alert.alert(
          "Missing configuration",
          "Set EXPO_PUBLIC_GITHUB_CLIENT_ID and rebuild."
        );
        return;
      }
      await provider.signIn();
      await refreshUser();
      if (prefs.repo && prefs.folder) {
        router.replace("/(tabs)/editor");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      Alert.alert("Sign-in failed", e?.message ?? String(e));
    }
  }, [refreshUser, prefs.repo, prefs.folder]);

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
