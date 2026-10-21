"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthReady } from "@/composable/useAuthReady";
import { currencyService } from "@/rest/service/currency/currency.service";
import type { SelectOption } from "@/types/common.types";
import {
  normalizeCurrencies,
  pickBusinessCurrencies,
  pickBusinessCurrencyRows,
  pickMainCurrency,
} from "@/utils/currency";

export const currencyKeys = {
  all: ["currency"] as const,
  business: ["currency", "business"] as const,
};

export function useCurrenciesQuery() {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: currencyKeys.all,
    queryFn: () => currencyService.list(),
    enabled: authReady,
    staleTime: 10 * 60 * 1000,
  });

  const currencies = useMemo(
    () => normalizeCurrencies(query.data),
    [query.data],
  );

  return { currencies, isPending: query.isPending };
}

export function useMainCurrencyQuery() {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: currencyKeys.business,
    queryFn: () => currencyService.business(),
    enabled: authReady,
    staleTime: 10 * 60 * 1000,
  });

  const mainCurrency = useMemo(
    () => pickMainCurrency(query.data),
    [query.data],
  );

  const businessCurrencies = useMemo(() => {
    const list = pickBusinessCurrencies(query.data);
    const mainId = pickMainCurrency(query.data)?.id;

    return [...list].sort(
      (a, b) => Number(b.id === mainId) - Number(a.id === mainId),
    );
  }, [query.data]);

  const currencyOptions = useMemo<SelectOption[]>(
    () =>
      businessCurrencies.map((currency) => ({
        value: String(currency.id),
        label: currency.code,
      })),
    [businessCurrencies],
  );

  const currencyRates = useMemo<Record<string, number>>(
    () =>
      Object.fromEntries(
        businessCurrencies.map((currency) => [String(currency.id), currency.rate]),
      ),
    [businessCurrencies],
  );

  return {
    mainCurrency,
    currencyOptions,
    currencyRates,
    isPending: query.isPending,
  };
}

export function useBusinessCurrencyRowsQuery() {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: currencyKeys.business,
    queryFn: () => currencyService.business(),
    enabled: authReady,
    staleTime: 10 * 60 * 1000,
  });

  const rows = useMemo(
    () => pickBusinessCurrencyRows(query.data),
    [query.data],
  );

  return { rows, isPending: query.isPending };
}

export function useSaveCurrencyRateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: ({ id, rate }: { id: number; rate: number }) =>
      currencyService.saveRate(id, rate),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: currencyKeys.business }),
  });
}

export function useSetMainCurrencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: (id: number) => currencyService.setMain(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: currencyKeys.business }),
  });
}
