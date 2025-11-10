import { useCallback, useMemo, useState } from "react";
import { Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text } from "tamagui";
import { Button } from "@/components/ui/button";
import { useNotePrefs } from "@/lib/note-preferences";
import { provider } from "@/lib/providers";
import { Buffer } from "buffer";
import { useTamaguiThemeColor } from "@/hooks/use-tamagui-theme-color";

function generateTimestampFilename(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}-${hh}${mi}${ss}.md`;
}

export default function EditorScreen() {
  const { prefs } = useNotePrefs();
  const [content, setContent] = useState("");
  const [committing, setCommitting] = useState(false);
  const textColor = useTamaguiThemeColor("color11");
  const borderColor = useTamaguiThemeColor("color3");
  const placeholderColor = useTamaguiThemeColor("color9");

  const canCommit = useMemo(() => {
    return Boolean(content.trim()) && Boolean(prefs.repo && prefs.folder);
  }, [content, prefs.repo, prefs.folder]);

  const onCommit = useCallback(async () => {
    if (!prefs.repo || !prefs.folder) {
      Alert.alert("Setup required", "Select a repository and folder first.");
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert("Empty note", "Write something before committing.");
      return;
    }
    const repoOwner = prefs.repo.owner;
    const repoName = prefs.repo.name;
    const folder = prefs.folder;
    const fileName = generateTimestampFilename();
    const path = `${folder}${fileName}`;
    const message = `Add note: ${fileName}`;
    Alert.alert("Commit this note?", fileName, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Commit",
        onPress: async () => {
          try {
            setCommitting(true);
            const contentBase64 = Buffer.from(trimmed, "utf-8").toString(
              "base64"
            );
            await provider.putFile({
              owner: repoOwner,
              repo: repoName,
              path,
              contentBase64,
              message,
            });
            setContent("");
            Alert.alert("Committed", "Your note was committed to Git.");
          } catch (e: any) {
            Alert.alert("Commit failed", e?.message ?? String(e));
          } finally {
            setCommitting(false);
          }
        },
      },
    ]);
  }, [content, prefs.repo, prefs.folder]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} p="$4" gap="$4" bg="$color11">
        <Text fontWeight="700">Editor</Text>
        {!prefs.repo || !prefs.folder ? (
          <YStack gap="$3">
            <Text>Choose a repository and folder to start writing notes.</Text>
          </YStack>
        ) : (
          <>
            <TextInput
              multiline
              placeholder="Write your note in Markdown…"
              placeholderTextColor={placeholderColor}
              value={content}
              onChangeText={setContent}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: borderColor,
                textAlignVertical: "top",
                color: textColor,
              }}
            />
            <Button
              title="Commit"
              onPress={onCommit}
              disabled={!canCommit}
              loading={committing}
            />
          </>
        )}
      </YStack>
    </SafeAreaView>
  );
}
