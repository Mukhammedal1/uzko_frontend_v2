"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAppLocale } from "@/composable/useAppLocale";
import { useAuthReady } from "@/composable/useAuthReady";
import { unitService } from "@/rest/service/unit/unit.service";
import { normalizeOptions } from "@/utils/lookup";

export const unitKeys = {
  all: ["unit"] as const,
};

export function useUnitsQuery(enabled = true) {
  const authReady = useAuthReady();
  const locale = useAppLocale();

  const query = useQuery({
    queryKey: unitKeys.all,
    queryFn: () => unitService.list(),
    enabled: authReady && enabled,
    staleTime: 10 * 60 * 1000,
  });

  const options = useMemo(
    () => normalizeOptions(query.data, locale),
    [query.data, locale],
  );

  return { options, isPending: query.isPending };
}
