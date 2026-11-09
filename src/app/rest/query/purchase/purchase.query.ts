"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthReady } from "@/composable/useAuthReady";
import { PURCHASE_PRODUCT_SEARCH_LIMIT } from "@/constants/purchase/purchase.constants";
import { productKeys } from "@/rest/query/product/product.query";
import { supplierKeys } from "@/rest/query/supplier/supplier.query";
import { productService } from "@/rest/service/product/product.service";
import { purchaseService } from "@/rest/service/purchase/purchase.service";
import type {
  PurchaseCreatePayload,
  PurchaseDetail,
  PurchaseEditLogRow,
  PurchasesQueryParams,
  PurchaseUpdatePayload,
} from "@/types/purchase.types";
import {
  normalizePurchaseProducts,
  normalizePurchaseDetail,
  normalizePurchaseEdit,
  normalizePurchaseHistory,
  purchaseProductIds,
  normalizePurchasesPage,
} from "@/utils/purchase";

export const purchaseKeys = {
  all: ["purchases"] as const,
  list: (params: PurchasesQueryParams) =>
    ["purchases", "list", params] as const,
  history: (id: number) => ["purchases", "history", id] as const,
  detail: (id: number) => ["purchases", "detail", id] as const,
  products: (search: string) => ["purchases", "products", search] as const,
};

export function usePurchasesPageQuery(params: PurchasesQueryParams) {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: purchaseKeys.list(params),
    queryFn: () => purchaseService.list(params),
    placeholderData: keepPreviousData,
    enabled: authReady,
  });

  const data = useMemo(
    () =>
      query.data === undefined
        ? undefined
        : normalizePurchasesPage(query.data, {
            page: params.page,
            limit: params.limit,
          }),
    [query.data, params.page, params.limit],
  );

  return {
    data,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function usePurchaseProductSearchQuery(
  search: string,
  enabled: boolean,
) {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: purchaseKeys.products(search),
    queryFn: () =>
      productService.list({
        page: 1,
        limit: PURCHASE_PRODUCT_SEARCH_LIMIT,
        search: search || undefined,
      }),
    placeholderData: keepPreviousData,
    enabled: authReady && enabled,
    staleTime: 30 * 1000,
  });

  const options = useMemo(
    () => normalizePurchaseProducts(query.data),
    [query.data],
  );

  return { options, isFetching: query.isFetching };
}

export function useCreatePurchaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "created" },
    mutationFn: (payload: PurchaseCreatePayload) =>
      purchaseService.create(payload),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
      ]),
  });
}

export function useUpdatePurchaseMutation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "updated" },
    mutationFn: (payload: PurchaseUpdatePayload) =>
      purchaseService.update(id, payload),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
      ]),
  });
}

export function usePurchaseEditQuery(id: number, defaultCurrencyId: string) {
  const authReady = useAuthReady();

  const purchase = useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => purchaseService.get(id),
    enabled: authReady && id > 0,
    gcTime: 0,
  });

  const productIds = useMemo(
    () => purchaseProductIds(purchase.data),
    [purchase.data],
  );

  const products = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: ["purchases", "edit-product", productId] as const,
      queryFn: () => productService.detail(productId),
      enabled: authReady,
    })),
  });

  const productsReady = products.every((query) => query.isSuccess);
  const productsData = products.map((query) => query.data);

  const data =
    purchase.data === undefined || !productsReady
      ? undefined
      : normalizePurchaseEdit(
          purchase.data,
          productIds.map((productId, index) => ({
            id: productId,
            raw: productsData[index],
          })),
          defaultCurrencyId,
        );

  return {
    data,
    isError: purchase.isError || products.some((query) => query.isError),
    refetch: purchase.refetch,
  };
}

export function usePurchaseHistoryQuery(id: number) {
  const authReady = useAuthReady();

  const query = useQuery({
    queryKey: purchaseKeys.history(id),
    queryFn: () => purchaseService.history(id),
    enabled: authReady && id > 0,
  });

  const rows = useMemo(
    () =>
      query.data === undefined
        ? undefined
        : normalizePurchaseHistory(query.data),
    [query.data],
  );

  return { rows, isError: query.isError, refetch: query.refetch };
}

export function usePurchaseEditLogQuery(limit: number) {
  const purchases = usePurchasesPageQuery({ page: 1, limit });

  const edited = useMemo(
    () =>
      (purchases.data?.items ?? []).filter(
        (purchase) =>
          purchase.updatedAt !== "" &&
          purchase.updatedAt !== purchase.createdAt,
      ),
    [purchases.data],
  );

  const histories = useQueries({
    queries: edited.map((purchase) => ({
      queryKey: purchaseKeys.history(purchase.id),
      queryFn: () => purchaseService.history(purchase.id),
      enabled: true,
    })),
  });

  const ready = histories.every((query) => query.isSuccess);
  const failed = histories.some((query) => query.isError);
  const dataKey = histories.map((query) => query.dataUpdatedAt).join(",");

  const rows = useMemo<PurchaseEditLogRow[]>(
    () =>
      edited
        .flatMap((purchase, index) =>
          normalizePurchaseHistory(histories[index]?.data).map((row) => ({
            ...row,
            purchaseId: purchase.id,
            supplier: purchase.supplier,
          })),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edited, dataKey],
  );

  return {
    rows,
    isPending: purchases.isPending || (edited.length > 0 && !ready && !failed),
    isError: purchases.isError || failed,
    refetch: purchases.refetch,
  };
}

export function useDeletePurchaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toast: "deleted" },
    mutationFn: (id: number) => purchaseService.remove(id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
      ]),
  });
}

export function usePurchaseDetailsQuery(ids: number[]) {
  const authReady = useAuthReady();

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: purchaseKeys.detail(id),
      queryFn: () => purchaseService.get(id),
      enabled: authReady,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const details: Record<number, PurchaseDetail | undefined> = {};
  ids.forEach((id, index) => {
    const data = results[index]?.data;
    if (data !== undefined) details[id] = normalizePurchaseDetail(data);
  });

  return details;
}
