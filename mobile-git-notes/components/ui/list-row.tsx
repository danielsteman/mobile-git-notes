import React from "react";
import { Pressable, View, Text, Image, PressableProps } from "react-native";

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
  className,
  ...props
}: ListRowProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 ${
        className ?? ""
      }`}
      accessibilityRole="button"
      {...props}
    >
      <View className="flex-row items-center gap-3 flex-1 pr-2">
        {leftAvatarUrl ? (
          <Image
            source={{ uri: leftAvatarUrl }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        ) : null}
        <View className="flex-1">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightText ? (
        <Text className="text-xs text-neutral-500">{rightText}</Text>
      ) : null}
    </Pressable>
  );
}
