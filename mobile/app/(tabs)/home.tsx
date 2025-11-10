import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";
import { useUser } from "@/lib/user-context";
import { ListRow } from "@/components/ui/list-row";
import { Button } from "@/components/ui/button";
import { provider } from "@/lib/providers";
import { useNotePrefs } from "@/lib/note-preferences";
import { router } from "expo-router";

type Repo = {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  private: boolean;
  stargazers_count?: number;
  html_url: string;
};

export default function HomeScreen() {
  const { isAuthenticated, refreshUser } = useUser();
  const { setRepo } = useNotePrefs();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await provider.listRepos();
      setRepos(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      await provider.signIn();
      await refreshUser();
    } catch (e: any) {
      Alert.alert("Sign-in failed", e?.message ?? String(e));
    }
  }, [refreshUser]);

  useEffect(() => {
    if (isAuthenticated) void load();
  }, [isAuthenticated, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center" p="$4" gap="$4" bg="$color1">
          <Text fontWeight="700" color="$color11">
            You’re not signed in
          </Text>
          <Text color="$color11" opacity={0.8} ta="center">
            Please sign in to view your repositories and start writing notes.
          </Text>
          <Button title="Login with GitHub" onPress={handleSignIn} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center" p="$4" gap="$2" bg="$color1">
          <ActivityIndicator />
          <Text>Loading repositories…</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack f={1} ai="center" jc="center" p="$4" gap="$4" bg="$color1">
          <Text color="$red10">{error}</Text>
          <Button title="Retry" onPress={load} />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} bg="$color1">
        <FlatList
          data={repos}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <ListRow
              title={item.full_name}
              subtitle={item.description ?? undefined}
              rightText={`★ ${item.stargazers_count ?? 0}`}
              onPress={() => {
                const [owner, name] = item.full_name.split("/");
                Alert.alert("Use this repository?", item.full_name, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Confirm",
                    onPress: async () => {
                      await setRepo({
                        owner,
                        name,
                        fullName: item.full_name,
                      });
                      router.push("/folder-setup");
                    },
                  },
                ]);
              }}
            />
          )}
        />
      </YStack>
    </SafeAreaView>
  );
}
