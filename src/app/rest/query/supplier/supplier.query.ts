"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import { supplierService } from "@/rest/service/supplier/supplier.service";
import type {
  SupplierCreatePayload,
  SupplierUpdatePayload,
  SuppliersQueryParams,
} from "@/types/supplier.types";
import { normalizeOptions } from "@/utils/lookup";
import {
  normalizeSuppliersPage,
  normalizeSupplierDebts,
} from "@/utils/supplier";

export const supplierKeys = {
  all: ["supplier"] as const,
  page: (params: SuppliersQueryParams) => ["supplier", "page", params] as const,
  detail: (id: number) => ["supplier", "detail", id] as const,
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

export function useSupplierDebtsQuery(supplierId: string) {
  const authReady = useAuthReady();
  const { businessCurrencies } = useMainCurrencyQuery();
  const id = Number(supplierId);

  const currencyCodes = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        businessCurrencies.map((currency) => [
          currency.businessId,
          currency.code,
        ]),
      ),
    [businessCurrencies],
  );

  const query = useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => supplierService.get(id),
    enabled: authReady && id > 0,
  });

  const debts = useMemo(
    () =>
      query.data === undefined
        ? []
        : normalizeSupplierDebts(query.data, currencyCodes),
    [query.data, currencyCodes],
  );

  return { debts, isPending: query.isPending, isError: query.isError };
}

export function useSuppliersPageQuery(params: SuppliersQueryParams) {
  const authReady = useAuthReady();
  const { businessCurrencies } = useMainCurrencyQuery();

  const currencyCodes = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        businessCurrencies.map((currency) => [
          currency.businessId,
          currency.code,
        ]),
      ),
    [businessCurrencies],
  );

  const summaryCodes = useMemo<Record<number, string>>(
    () =>
      Object.fromEntries(
        businessCurrencies.map((currency) => [currency.id, currency.code]),
      ),
    [businessCurrencies],
  );

  const query = useQuery({
    queryKey: supplierKeys.page(params),
    queryFn: () => supplierService.page(params),
    placeholderData: keepPreviousData,
    enabled: authReady,
  });

  const data = useMemo(
    () =>
      query.data === undefined
        ? undefined
        : normalizeSuppliersPage(query.data, {
            page: params.page,
            limit: params.limit,
            currencyCodes,
            summaryCodes,
          }),
    [query.data, params.page, params.limit, currencyCodes, summaryCodes],
  );

  return {
    data,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "created" },
    mutationFn: (payload: SupplierCreatePayload) =>
      supplierService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

export function useUpdateSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SupplierUpdatePayload;
    }) => supplierService.update(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

export function useDeleteSuppliersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "deleted" },
    mutationFn: (ids: number[]) =>
      Promise.all(ids.map((id) => supplierService.remove(id))),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}
