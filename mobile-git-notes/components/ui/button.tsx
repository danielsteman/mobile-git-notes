/* eslint-disable import/no-unresolved */
import React from "react";
import { ActivityIndicator } from "react-native";
import { Button as TButton, styled } from "tamagui";

type Variant = "primary" | "secondary" | "destructive";

type ButtonProps = React.ComponentProps<typeof TButton> & {
  title: string;
  loading?: boolean;
  variant?: Variant;
};

const BaseButton = styled(TButton, {
  borderRadius: 12,
  px: "$4",
  py: "$3",
  variants: {
    variant: {
      primary: { bg: "$blue10", color: "$color1" },
      secondary: { bg: "$color2", color: "$color11" },
      destructive: { bg: "$red10", color: "$color1" },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export function Button({
  title,
  loading,
  disabled,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      accessibilityRole="button"
      variant={variant}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? "#4c4f69" : "#eff1f5"}
        />
      ) : (
        title
      )}
    </BaseButton>
  );
}
