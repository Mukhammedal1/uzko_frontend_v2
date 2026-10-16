"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { stockService } from "@/rest/service/stock/stock.service";
import { normalizeOptions } from "@/utils/lookup";

export const stockKeys = {
  all: ["stock"] as const,
};

export function useStocksQuery(enabled = true) {
  const authReady = useAuthReady();
  const locale = useAppLocale();

  const query = useQuery({
    queryKey: stockKeys.all,
    queryFn: () => stockService.list(),
    enabled: authReady && enabled,
    staleTime: 10 * 60 * 1000,
  });

  const options = useMemo(
    () => normalizeOptions(query.data, locale),
    [query.data, locale],
  );

  return { options, isPending: query.isPending };
}
