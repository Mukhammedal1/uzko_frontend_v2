"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthReady } from "@/composable/useAuthReady";
import { useCurrenciesQuery } from "@/rest/query/currency/currency.query";
import { productService } from "@/rest/service/product/product.service";
import type {
  BulkDeletePayload,
  CreateProductsPayload,
  ProductEditSubmit,
  ProductsQueryParams,
  UpsertVariantItem,
} from "@/types/product.types";
import { normalizeProductsPage } from "@/utils/product";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductsQueryParams) =>
    ["products", "list", params] as const,
  detail: (id: number) => ["products", "detail", id] as const,
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

export function useDeleteProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "deleted" },
    mutationFn: (payload: BulkDeletePayload) => productService.remove(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useCreateProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "created" },
    mutationFn: (payload: CreateProductsPayload) =>
      productService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useProductDetailQuery(id: number) {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.detail(id),
    enabled: authReady && Number.isFinite(id) && id > 0,
    staleTime: 0,
  });

  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
  };
}

const combineDetails = (results: UseQueryResult<unknown>[]) => ({
  data: results.map((result) => result.data),
  isPending: results.some((result) => result.isPending),
  isError: results.some((result) => result.isError),
});

export function useProductDetailsQuery(ids: number[]) {
  const authReady = useAuthReady();

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: productKeys.detail(id),
      queryFn: () => productService.detail(id),
      enabled: authReady && Number.isFinite(id) && id > 0,
      staleTime: 0,
    })),
    combine: combineDetails,
  });
}

const submitProductEdits = async (submits: ProductEditSubmit[]) => {
  const products = submits.flatMap(
    ({ productId, product, updates, creates }) => {
      const variants: UpsertVariantItem[] = [
        ...updates.map(({ id, payload }) => ({ ...payload, id })),
        ...creates,
      ];
      if (!product && variants.length === 0) return [];

      return [
        {
          id: productId,
          ...product,
          ...(variants.length > 0 ? { variants } : {}),
        },
      ];
    },
  );

  if (products.length > 0) await productService.update({ products });
};

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: (submit: ProductEditSubmit) => submitProductEdits([submit]),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: submitProductEdits,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
