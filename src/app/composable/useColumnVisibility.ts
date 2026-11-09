"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { ColumnVisibility } from "@/types/common.types";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const readRaw = (storageKey: string) => {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
};

const parse = (
  raw: string | null,
  defaults: ColumnVisibility,
): ColumnVisibility => {
  if (!raw) return defaults;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaults;

    const stored = parsed as Record<string, unknown>;
    return Object.keys(defaults).reduce<ColumnVisibility>(
      (result, key) => ({
        ...result,
        [key]: typeof stored[key] === "boolean" ? stored[key] : defaults[key],
      }),
      {},
    );
  } catch {
    return defaults;
  }
};

export function useColumnVisibility(
  storageKey: string,
  defaults: ColumnVisibility,
) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(storageKey),
    () => null,
  );

  const visibility = useMemo(() => parse(raw, defaults), [raw, defaults]);

  const setColumn = useCallback(
    (key: string, checked: boolean) => {
      const next = {
        ...parse(readRaw(storageKey), defaults),
        [key]: checked,
      };

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        return;
      }
      listeners.forEach((listener) => listener());
    },
    [storageKey, defaults],
  );

  return { visibility, setColumn };
}
