"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { expenseTypeService } from "@/rest/service/expense-type/expense-type.service";
import { normalizeNamedItems, normalizeOptions } from "@/utils/lookup";

export const expenseTypeKeys = {
  all: ["expense-type"] as const,
};

export function useExpenseTypesQuery(enabled = true) {
  const authReady = useAuthReady();
  const locale = useAppLocale();

  const query = useQuery({
    queryKey: expenseTypeKeys.all,
    queryFn: () => expenseTypeService.list(),
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

export function useCreateExpenseTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "created" },
    mutationFn: (name: string) => expenseTypeService.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseTypeKeys.all }),
  });
}

export function useUpdateExpenseTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      expenseTypeService.update(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseTypeKeys.all }),
  });
}

export function useDeleteExpenseTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "deleted" },
    mutationFn: (id: number) => expenseTypeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseTypeKeys.all }),
  });
}
