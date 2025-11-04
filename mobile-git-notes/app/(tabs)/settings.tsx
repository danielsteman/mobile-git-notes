/* eslint-disable import/no-unresolved */
import { YStack, XStack, Text } from "tamagui";
import { Button } from "@/components/ui/button";
import { useThemePref } from "@/lib/theme-preference";

export default function SettingsScreen() {
  const { pref, setPref } = useThemePref();
  const opts: ("system" | "latte" | "mocha")[] = ["system", "latte", "mocha"];
  return (
    <YStack f={1} p="$4" gap="$4">
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
    </YStack>
  );
}
