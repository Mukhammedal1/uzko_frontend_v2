"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { BasePagination } from "@/component/base/pagination/BasePagination";
import { Button } from "@/component/ui/button";
import { useDebouncedValue } from "@/composable/useDebouncedValue";
import {
  PURCHASE_CREATE_PATH,
  PURCHASES_DEFAULT_FILTERS,
  PURCHASES_DEFAULT_LIMIT,
  PURCHASES_DEFAULT_PAGE,
  PURCHASES_FILTER_ALL,
  PURCHASES_LIMIT_OPTIONS,
  PURCHASES_SEARCH_DEBOUNCE_MS,
  PURCHASES_SKELETON_ROWS,
} from "@/constants/purchase/purchase.constants";
import { PurchaseDeleteDialog } from "@/features/purchase/PurchaseDeleteDialog";
import { PurchasesTable } from "@/features/purchase/PurchasesTable";
import { PurchasesToolbar } from "@/features/purchase/PurchasesToolbar";
import { DefaultChildTabs } from "@/layouts/default/DefaultChildTabs";
import {
  useDeletePurchaseMutation,
  usePurchasesPageQuery,
} from "@/rest/query/purchase/purchase.query";
import type {
  PurchaseDeleteTarget,
  PurchaseFilters,
  PurchasePaymentMethod,
  PurchasesQueryParams,
} from "@/types/purchase.types";

export function AllPurchases() {
  const t = useTranslations("purchase");
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(PURCHASES_DEFAULT_PAGE);
  const [limit, setLimit] = useState(PURCHASES_DEFAULT_LIMIT);
  const [filters, setFilters] = useState<PurchaseFilters>(
    PURCHASES_DEFAULT_FILTERS,
  );

  const debouncedSearch = useDebouncedValue(
    search.trim(),
    PURCHASES_SEARCH_DEBOUNCE_MS,
  );

  const params = useMemo<PurchasesQueryParams>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      payment_method:
        filters.payment_method === PURCHASES_FILTER_ALL
          ? undefined
          : (filters.payment_method as PurchasePaymentMethod),
      supplier_id:
        filters.supplier_id === PURCHASES_FILTER_ALL
          ? undefined
          : Number(filters.supplier_id),
      from_date: filters.from_date || undefined,
      to_date: filters.to_date || undefined,
    }),
    [page, limit, debouncedSearch, filters],
  );

  const [deleteTarget, setDeleteTarget] = useState<PurchaseDeleteTarget | null>(
    null,
  );

  const purchases = usePurchasesPageQuery(params);
  const deletePurchase = useDeletePurchaseMutation();
  const items = useMemo(() => purchases.data?.items ?? [], [purchases.data]);

  const isInitialLoading = purchases.isPending && !purchases.data;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deletePurchase.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleCloseDelete = () => {
    deletePurchase.reset();
    setDeleteTarget(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <DefaultChildTabs />

        <PurchasesToolbar
          search={search}
          filters={filters}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(PURCHASES_DEFAULT_PAGE);
          }}
          onFilterChange={(key, value) => {
            setFilters((current) => ({ ...current, [key]: value }));
            setPage(PURCHASES_DEFAULT_PAGE);
          }}
          onFiltersReset={() => {
            setFilters(PURCHASES_DEFAULT_FILTERS);
            setPage(PURCHASES_DEFAULT_PAGE);
          }}
          onAdd={() => router.push(PURCHASE_CREATE_PATH)}
        />

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          aria-busy={purchases.isFetching}
        >
          {purchases.isError && !purchases.data ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("loadError")}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => purchases.refetch()}
              >
                {t("retry")}
              </Button>
            </div>
          ) : isInitialLoading ? (
            <ul className="flex flex-col gap-px p-3" aria-label={t("loading")}>
              {Array.from({ length: PURCHASES_SKELETON_ROWS }, (_, index) => (
                <li
                  key={index}
                  className="h-12 animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <PurchasesTable
              purchases={items}
              onDelete={(purchase) => setDeleteTarget({ id: purchase.id })}
            />
          )}
        </div>

        <div className="shrink-0 border-t px-2 py-1">
          <BasePagination
            page={purchases.data?.page ?? page}
            totalPages={purchases.data?.totalPages ?? 1}
            limit={limit}
            limitOptions={PURCHASES_LIMIT_OPTIONS}
            limitLabel={t("limit")}
            previousLabel={t("previous")}
            nextLabel={t("next")}
            pageLabel={t("page")}
            disabled={purchases.isFetching}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(PURCHASES_DEFAULT_PAGE);
            }}
          />
        </div>
      </section>

      <PurchaseDeleteDialog
        target={deleteTarget}
        pending={deletePurchase.isPending}
        failed={deletePurchase.isError}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
