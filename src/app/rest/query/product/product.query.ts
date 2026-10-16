"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthReady } from "@/composable/useAuthReady";
import { useCurrenciesQuery } from "@/rest/query/currency/currency.query";
import { productService } from "@/rest/service/product/product.service";
import type {
  CreateProductsPayload,
  ProductsQueryParams,
} from "@/types/product.types";
import { normalizeProductsPage } from "@/utils/product";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductsQueryParams) =>
    ["products", "list", params] as const,
};

export function useProductsQuery(params: ProductsQueryParams) {
  const authReady = useAuthReady();
  const { currencies } = useCurrenciesQuery();

  const query = useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
    placeholderData: keepPreviousData,
    enabled: authReady,
  });

  const data = useMemo(
    () =>
      query.data === undefined
        ? undefined
        : normalizeProductsPage(query.data, {
            currencies,
            page: params.page,
            limit: params.limit,
          }),
    [query.data, currencies, params.page, params.limit],
  );

  return {
    data,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.removeVariant(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useCreateProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductsPayload) =>
      productService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
