'use client'

import { YStack, H2, Paragraph, Button } from "tamagui";

export default function Home() {
  return (
    <YStack p="$5" gap="$4" bg="$color1" ai="flex-start">
      <H2 color="$color11">Mobile Git Notes</H2>
      <Paragraph color="$color10">
        A fast way to capture repo-linked notes.
      </Paragraph>
      <Button bg="$blue10" color="$color1" br="$3">
        Join the waitlist
      </Button>
    </YStack>
  );
}
