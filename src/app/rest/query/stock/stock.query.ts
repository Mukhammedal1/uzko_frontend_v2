"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { stockService } from "@/rest/service/stock/stock.service";
import { normalizeNamedItems, normalizeOptions } from "@/utils/lookup";

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

  const items = useMemo(
    () => normalizeNamedItems(query.data, locale),
    [query.data, locale],
  );

  return { options, items, isPending: query.isPending };
}

export function useCreateStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "created" },
    mutationFn: (name: string) => stockService.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
}

export function useUpdateStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      stockService.update(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
}

export function useDeleteStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "deleted" },
    mutationFn: (id: number) => stockService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
}
