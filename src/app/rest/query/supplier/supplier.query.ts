"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { supplierService } from "@/rest/service/supplier/supplier.service";
import { normalizeOptions } from "@/utils/lookup";

export const supplierKeys = {
  all: ["supplier"] as const,
};

export function useSuppliersQuery(enabled = true) {
  const authReady = useAuthReady();
  const locale = useAppLocale();

  const query = useQuery({
    queryKey: supplierKeys.all,
    queryFn: () => supplierService.list(),
    enabled: authReady && enabled,
    staleTime: 10 * 60 * 1000,
  });

  const options = useMemo(
    () => normalizeOptions(query.data, locale),
    [query.data, locale],
  );

  return { options, isPending: query.isPending };
}
