import { YStack, XStack, Text } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { useThemePref } from "@/lib/theme-preference";
import { useNotePrefs } from "@/lib/note-preferences";
import { router } from "expo-router";
import { useUser } from "@/lib/user-context";
import { useCallback } from "react";
import { Alert, Image } from "react-native";
import { provider } from "@/lib/providers";

export default function SettingsScreen() {
  const { pref, setPref } = useThemePref();
  const { prefs } = useNotePrefs();
  const { user, isAuthenticated, refreshUser, logout } = useUser();
  const opts: ("system" | "latte" | "mocha")[] = ["system", "latte", "mocha"];
  const handleLogin = useCallback(async () => {
    try {
      await provider.signIn();
      await refreshUser();
    } catch (e: any) {
      Alert.alert("Sign-in failed", e?.message ?? String(e));
    }
  }, [refreshUser]);
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      Alert.alert("Logged out");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? String(e));
    }
  }, [logout]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} p="$4" gap="$4" bg="$color1">
        <Text fontWeight="700">Account</Text>
        <YStack gap="$3">
          <XStack ai="center" gap="$3">
            {isAuthenticated && user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : null}
            <YStack>
              <Text>
                Status:{" "}
                <Text fontWeight="700">
                  {isAuthenticated ? "Logged in" : "Logged out"}
                </Text>
              </Text>
              {isAuthenticated && user?.login ? (
                <Text opacity={0.8}>@{user.login}</Text>
              ) : null}
            </YStack>
          </XStack>
          <XStack gap="$2">
            {isAuthenticated ? (
              <Button
                title="Logout"
                variant="secondary"
                onPress={handleLogout}
              />
            ) : (
              <Button title="Login with GitHub" onPress={handleLogin} />
            )}
          </XStack>
        </YStack>
        <Text fontWeight="700">Appearance</Text>
        <XStack gap="$2">
          {opts.map((o) => (
            <Button
              key={o}
              variant={pref === o ? "primary" : "secondary"}
              title={o}
              onPress={() => setPref(o)}
            />
          ))}
        </XStack>
        <YStack gap="$2">
          <Text fontWeight="700">Notes</Text>
          <Text>
            Repository: {prefs.repo ? prefs.repo.fullName : "Not set"}
          </Text>
          <Text>Folder: {prefs.folder ? `/${prefs.folder}` : "Not set"}</Text>
          <XStack gap="$2" mt="$2">
            <Button
              title="Change repository"
              variant="secondary"
              onPress={() => router.push("/(tabs)/home")}
            />
            <Button
              title="Change folder"
              variant="secondary"
              onPress={() => router.push("/folder-setup")}
            />
          </XStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
