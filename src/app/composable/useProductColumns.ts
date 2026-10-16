"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PRODUCTS_COLUMN_KEYS,
  PRODUCTS_COLUMNS_STORAGE_KEY,
  PRODUCTS_DEFAULT_COLUMNS,
} from "@/constants/product/product.constants";
import type {
  ProductColumnKey,
  ProductColumnVisibility,
} from "@/types/product.types";

const readStored = (): ProductColumnVisibility | null => {
  try {
    const raw = window.localStorage.getItem(PRODUCTS_COLUMNS_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const stored = parsed as Record<string, unknown>;
    return PRODUCTS_COLUMN_KEYS.reduce<ProductColumnVisibility>(
      (result, key) => ({
        ...result,
        [key]:
          typeof stored[key] === "boolean"
            ? stored[key]
            : PRODUCTS_DEFAULT_COLUMNS[key],
      }),
      { ...PRODUCTS_DEFAULT_COLUMNS },
    );
  } catch {
    return null;
  }
};

const writeStored = (value: ProductColumnVisibility) => {
  try {
    window.localStorage.setItem(
      PRODUCTS_COLUMNS_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    return;
  }
};

export function useProductColumns() {
  const [columns, setColumns] = useState<ProductColumnVisibility>(
    PRODUCTS_DEFAULT_COLUMNS,
  );

  useEffect(() => {
    const stored = readStored();
    if (stored) setColumns(stored);
  }, []);

  const setColumn = useCallback((key: ProductColumnKey, checked: boolean) => {
    setColumns((current) => {
      const next = { ...current, [key]: checked };
      writeStored(next);
      return next;
    });
  }, []);

  return { columns, setColumn };
}
