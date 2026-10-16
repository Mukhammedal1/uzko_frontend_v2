"use client";

import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";

import { useThemeMode } from "@/composable/useThemeMode";

export function ToastProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useThemeMode();

  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        theme={resolvedTheme}
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
      />
    </>
  );
}
