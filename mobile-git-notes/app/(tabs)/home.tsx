/* eslint-disable import/no-unresolved */
import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { YStack, Text } from "tamagui";
import { api } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { ListRow } from "@/components/ui/list-row";
import { Button } from "@/components/ui/button";

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
  const { isAuthenticated } = useUser();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<Repo[]>("/github/repos");
      setRepos(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, []);

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
      <YStack f={1} ai="center" jc="center" p="$4">
        <Text>Please sign in to view your repositories.</Text>
      </YStack>
    );
  }

  if (loading) {
    return (
      <YStack f={1} ai="center" jc="center" p="$4" gap="$2">
        <ActivityIndicator />
        <Text>Loading repositories…</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack f={1} ai="center" jc="center" p="$4" gap="$4">
        <Text color="$red10">{error}</Text>
        <Button title="Retry" onPress={load} />
      </YStack>
    );
  }

  return (
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
        />
      )}
    />
  );
}
