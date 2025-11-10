import { useCallback, useState } from "react";
import { Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";
import { Button } from "@/components/ui/button";
import { useNotePrefs, normalizeFolder } from "@/lib/note-preferences";
import { router } from "expo-router";
import { useTamaguiThemeColor } from "@/hooks/use-tamagui-theme-color";

export default function FolderSetupScreen() {
  const { prefs, setFolder } = useNotePrefs();
  const [value, setValue] = useState<string>(
    prefs.folder ? `/${prefs.folder}` : "/notes/"
  );
  const [saving, setSaving] = useState(false);
  const textColor = useTamaguiThemeColor("color11");
  const borderColor = useTamaguiThemeColor("color3");
  const placeholderColor = useTamaguiThemeColor("color9");

  const onSave = useCallback(async () => {
    try {
      setSaving(true);
      const normalized = normalizeFolder(value);
      await setFolder(normalized);
      router.replace("/(tabs)/editor");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [value, setFolder]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} p="$4" gap="$4" bg="$color1">
        <Text fontWeight="700">Default Notes Folder</Text>
        <Text>Choose where notes should be stored in the repository.</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="/notes/"
          placeholderTextColor={placeholderColor}
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: borderColor,
            color: textColor,
          }}
        />
        <Button title="Save" onPress={onSave} loading={saving} />
      </YStack>
    </SafeAreaView>
  );
}
