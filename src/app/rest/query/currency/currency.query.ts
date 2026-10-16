"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthReady } from "@/composable/useAuthReady";
import { currencyService } from "@/rest/service/currency/currency.service";
import { normalizeCurrencies, pickMainCurrency } from "@/utils/currency";

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

  return { mainCurrency, isPending: query.isPending };
}
