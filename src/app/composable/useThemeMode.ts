"use client";

import { useTheme } from "next-themes";

import type { ThemeMode } from "@/types/theme.types";

export function useThemeMode() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return {
    theme: (theme ?? "system") as ThemeMode,
    resolvedTheme: (resolvedTheme ?? "light") as Exclude<ThemeMode, "system">,
    setTheme: (value: ThemeMode) => setTheme(value),
  };
}
