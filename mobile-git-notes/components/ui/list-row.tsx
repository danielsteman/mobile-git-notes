/* eslint-disable import/no-unresolved */
import React from "react";
import { Pressable, Image, PressableProps } from "react-native";
import { XStack, YStack, Text } from "tamagui";

type ListRowProps = PressableProps & {
  title: string;
  subtitle?: string | null;
  leftAvatarUrl?: string | null;
  rightText?: string;
  className?: string;
};

export function ListRow({
  title,
  subtitle,
  leftAvatarUrl,
  rightText,
  className: _className,
  ...props
}: ListRowProps) {
  return (
    <Pressable accessibilityRole="button" {...props}>
      <XStack
        ai="center"
        jc="space-between"
        bg="$color1"
        br={12}
        p="$4"
        bw={1}
        boc="$color3"
      >
        <XStack ai="center" gap="$3" f={1} pr="$2">
          {leftAvatarUrl ? (
            <Image
              source={{ uri: leftAvatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          ) : null}
          <YStack f={1}>
            <Text numberOfLines={1} fontWeight="700">
              {title}
            </Text>
            {subtitle ? (
              <Text numberOfLines={2} color="$color11" opacity={0.7}>
                {subtitle}
              </Text>
            ) : null}
          </YStack>
        </XStack>
        {rightText ? (
          <Text size="$2" color="$color11" opacity={0.6}>
            {rightText}
          </Text>
        ) : null}
      </XStack>
    </Pressable>
  );
}
