"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BasePagination } from "@/component/base/pagination/BasePagination";
import { Button } from "@/component/ui/button";
import { useDebouncedValue } from "@/composable/useDebouncedValue";
import { useProductColumns } from "@/composable/useProductColumns";
import {
  PRODUCT_CREATE_PATH,
  PRODUCTS_COLLAPSE_DURATION_MS,
  PRODUCTS_DEFAULT_FILTERS,
  PRODUCTS_DEFAULT_LIMIT,
  PRODUCTS_DEFAULT_PAGE,
  PRODUCTS_EXPORT_FILE_NAME,
  PRODUCTS_FILTER_ALL,
  PRODUCTS_LIMIT_OPTIONS,
  PRODUCTS_SEARCH_DEBOUNCE_MS,
  PRODUCTS_SKELETON_ROWS,
} from "@/constants/product/product.constants";
import { ProductDeleteDialog } from "@/features/product/ProductDeleteDialog";
import { ProductsTable } from "@/features/product/ProductsTable";
import { ProductsToolbar } from "@/features/product/ProductsToolbar";
import {
  useDeleteProductMutation,
  useDeleteVariantMutation,
  useProductsQuery,
} from "@/rest/query/product/product.query";
import type {
  ProductBoolFilterValue,
  ProductDeleteTarget,
  ProductFilterKey,
  ProductFilters,
  ProductsQueryParams,
} from "@/types/product.types";
import {
  getProductSelectionKey,
  getVariantSelectionKey,
  pickSelectedProducts,
} from "@/utils/product";
import { buildProductsCsv, downloadCsv } from "@/utils/product-export";

const toId = (value: string) =>
  value === PRODUCTS_FILTER_ALL ? undefined : Number(value);

const toBool = (value: ProductBoolFilterValue) =>
  value === "all" ? undefined : value === "yes";

const withKey = <T,>(set: Set<T>, key: T) => new Set(set).add(key);

const withoutKey = <T,>(set: Set<T>, key: T) => {
  const next = new Set(set);
  next.delete(key);
  return next;
};

export function AllProducts() {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { columns, setColumn } = useProductColumns();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(PRODUCTS_DEFAULT_PAGE);
  const [limit, setLimit] = useState(PRODUCTS_DEFAULT_LIMIT);
  const [filters, setFilters] = useState<ProductFilters>(
    PRODUCTS_DEFAULT_FILTERS,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [closing, setClosing] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ProductDeleteTarget | null>(
    null,
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const debouncedSearch = useDebouncedValue(
    search.trim(),
    PRODUCTS_SEARCH_DEBOUNCE_MS,
  );

  const params = useMemo<ProductsQueryParams>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      stock_id: toId(filters.stock_id),
      supplier_id: toId(filters.supplier_id),
      unit_id: toId(filters.unit_id),
      shelf_number_id: toId(filters.shelf_number_id),
      in_stock: toBool(filters.in_stock),
      available_limit: toBool(filters.available_limit),
      available_image: toBool(filters.available_image),
      available_barcode: toBool(filters.available_barcode),
    }),
    [page, limit, debouncedSearch, filters],
  );

  const products = useProductsQuery(params);
  const deleteProduct = useDeleteProductMutation();
  const deleteVariant = useDeleteVariantMutation();

  const items = useMemo(() => products.data?.items ?? [], [products.data]);

  const costTotals = useMemo(() => {
    const totals = new Map<string, number>();
    items.forEach((product) =>
      product.variants.forEach((variant) => {
        const amount = variant.purchasePrice * variant.quantity;
        if (amount > 0) {
          totals.set(
            variant.purchaseCurrency,
            (totals.get(variant.purchaseCurrency) ?? 0) + amount,
          );
        }
      }),
    );
    return [...totals].map(([currency, amount]) => ({ currency, amount }));
  }, [items]);

  const exportItems = useMemo(
    () =>
      selected.size > 0 ? pickSelectedProducts(items, selected) : items,
    [items, selected],
  );

  const resetPage = () => {
    setPage(PRODUCTS_DEFAULT_PAGE);
    setSelected(new Set());
    setExpanded(new Set());
    setClosing(new Set());
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleFilter = (key: ProductFilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }) as ProductFilters);
    resetPage();
  };

  const handleFiltersReset = () => {
    setFilters(PRODUCTS_DEFAULT_FILTERS);
    resetPage();
  };

  const handleComingSoon = () => toast.info(tCommon("comingSoon"));

  const handleLimit = (value: number) => {
    setLimit(value);
    resetPage();
  };

  const handleToggleSelect = (key: string) =>
    setSelected((current) =>
      current.has(key) ? withoutKey(current, key) : withKey(current, key),
    );

  const handleToggleAll = (checked: boolean) =>
    setSelected(
      checked
        ? new Set(items.map((product) => getProductSelectionKey(product.id)))
        : new Set(),
    );

  const handleToggleExpand = useCallback(
    (id: number) => {
      if (closing.has(id)) return;

      if (!expanded.has(id)) {
        setExpanded((current) => withKey(current, id));
        return;
      }

      setClosing((current) => withKey(current, id));
      const timer = window.setTimeout(() => {
        setExpanded((current) => withoutKey(current, id));
        setClosing((current) => withoutKey(current, id));
      }, PRODUCTS_COLLAPSE_DURATION_MS);
      timers.current.push(timer);
    },
    [closing, expanded],
  );

  const handleExport = () => {
    const headers = [
      t("columns.product"),
      t("columns.limit"),
      t("columns.cost"),
      t("columns.wholesale"),
      t("columns.retail"),
      t("columns.article"),
      t("columns.quantity"),
      t("columns.unit"),
      t("columns.shelf"),
      t("columns.stock"),
      t("columns.supplier"),
    ];
    downloadCsv(
      buildProductsCsv(exportItems, headers),
      PRODUCTS_EXPORT_FILE_NAME,
    );
  };

  const mutation =
    deleteTarget?.kind === "variant" ? deleteVariant : deleteProduct;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const key =
      deleteTarget.kind === "variant"
        ? getVariantSelectionKey(deleteTarget.id)
        : getProductSelectionKey(deleteTarget.id);

    mutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setSelected((current) => withoutKey(current, key));
        setDeleteTarget(null);
      },
    });
  };

  const handleCloseDelete = () => {
    deleteProduct.reset();
    deleteVariant.reset();
    setDeleteTarget(null);
  };

  const isInitialLoading = products.isPending && !products.data;

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <ProductsToolbar
          search={search}
          filters={filters}
          total={products.data?.total ?? 0}
          costTotals={costTotals}
          exportCount={exportItems.length}
          onSearchChange={handleSearch}
          onFilterChange={handleFilter}
          onFiltersReset={handleFiltersReset}
          onExport={handleExport}
          onAddManual={() => router.push(PRODUCT_CREATE_PATH)}
          onAddImport={handleComingSoon}
          onAddTemplate={handleComingSoon}
        />

        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          aria-busy={products.isFetching}
        >
          {products.isError && !products.data ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("loadError")}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => products.refetch()}
              >
                {t("retry")}
              </Button>
            </div>
          ) : isInitialLoading ? (
            <ul className="flex flex-col gap-px p-3" aria-label={t("loading")}>
              {Array.from({ length: PRODUCTS_SKELETON_ROWS }, (_, index) => (
                <li
                  key={index}
                  className="h-14 animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <ProductsTable
              products={items}
              selected={selected}
              expanded={expanded}
              closing={closing}
              columns={columns}
              onColumnChange={setColumn}
              onToggleSelect={handleToggleSelect}
              onToggleAll={handleToggleAll}
              onToggleExpand={handleToggleExpand}
              onDelete={setDeleteTarget}
            />
          )}
        </div>

        <div className="shrink-0 border-t p-2">
          <BasePagination
            page={products.data?.page ?? page}
            totalPages={products.data?.totalPages ?? 1}
            limit={limit}
            limitOptions={PRODUCTS_LIMIT_OPTIONS}
            limitLabel={t("limit")}
            previousLabel={t("previous")}
            nextLabel={t("next")}
            pageLabel={t("page")}
            disabled={products.isFetching}
            onPageChange={(value) => {
              setPage(value);
              setSelected(new Set());
              setExpanded(new Set());
              setClosing(new Set());
            }}
            onLimitChange={handleLimit}
          />
        </div>
      </section>

      <ProductDeleteDialog
        target={deleteTarget}
        pending={mutation.isPending}
        failed={mutation.isError}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
