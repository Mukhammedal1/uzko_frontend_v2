"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { shelfNumberService } from "@/rest/service/shelf-number/shelf-number.service";
import { normalizeNamedItems, normalizeOptions } from "@/utils/lookup";

export const shelfNumberKeys = {
  all: ["shelf-number"] as const,
};

export function useShelfNumbersQuery(enabled = true) {
  const authReady = useAuthReady();
  const locale = useAppLocale();

  const query = useQuery({
    queryKey: shelfNumberKeys.all,
    queryFn: () => shelfNumberService.list(),
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

export function useCreateShelfNumberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "created" },
    mutationFn: (name: string) => shelfNumberService.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shelfNumberKeys.all }),
  });
}

export function useUpdateShelfNumberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      shelfNumberService.update(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shelfNumberKeys.all }),
  });
}

export function useDeleteShelfNumberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "deleted" },
    mutationFn: (id: number) => shelfNumberService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shelfNumberKeys.all }),
  });
}
