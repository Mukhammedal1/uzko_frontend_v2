"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { shelfNumberService } from "@/rest/service/shelf-number/shelf-number.service";
import { normalizeOptions } from "@/utils/lookup";

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

  return { options, isPending: query.isPending };
}
