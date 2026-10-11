"use client";

import { ReactNode, useMemo } from "react";
import { StyleSheet } from "react-native";
import { useServerInsertedHTML } from "next/navigation";
import { NextThemeProvider, useRootTheme } from "@tamagui/next-theme";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "../tamagui.config";

export function NextTamaguiProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useRootTheme();

  // Map NextTheme light/dark to our config themes
  const mappedTheme = theme === "dark" ? "mocha" : "latte";

  // Avoid re-render of children on theme changes
  const contents = useMemo(() => children, [children]);

  useServerInsertedHTML(() => {
    // @ts-expect-error React Native types not in web runtime
    const rnwStyle = StyleSheet.getSheet();
    return (
      <>
        {/* When outputCSS is enabled in next.config.ts (production),
            this file will be written and used for optimized themes */}
        <link rel="stylesheet" href="/tamagui.css" />
        <style
          id={rnwStyle.id}
          dangerouslySetInnerHTML={{ __html: rnwStyle.textContent }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: tamaguiConfig.getCSS(),
          }}
        />
      </>
    );
  });

  return (
    <NextThemeProvider
      skipNextHead
      onChangeTheme={(name) => {
        setTheme(name as any);
      }}
    >
      <TamaguiProvider
        config={tamaguiConfig}
        disableRootThemeClass
        defaultTheme={mappedTheme}
      >
        {contents}
      </TamaguiProvider>
    </NextThemeProvider>
  );
}
