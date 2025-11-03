import React from "react";
import {
  Pressable,
  PressableProps,
  Text,
  ActivityIndicator,
  ViewStyle,
} from "react-native";

type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
  className?: string;
  style?: ViewStyle | ViewStyle[];
};

export function Button({
  title,
  loading,
  variant = "primary",
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const base = "items-center rounded-xl px-4 py-3";
  const variants: Record<typeof variant, string> = {
    primary: "bg-blue-600",
    secondary: "bg-neutral-200 dark:bg-neutral-800",
    destructive: "bg-red-600",
  } as const;
  const opacity = disabled || loading ? " opacity-50" : "";

  return (
    <Pressable
      accessibilityRole="button"
      className={`${base} ${variants[variant]}${opacity} ${className ?? ""}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          className={
            variant === "secondary" ? "text-base" : "text-base text-white"
          }
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
