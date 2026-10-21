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
  PRODUCT_BULK_EDIT_QUERY,
  PRODUCT_CREATE_PATH,
  PRODUCT_EDIT_PATH,
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
  useDeleteProductsMutation,
  useProductsQuery,
} from "@/rest/query/product/product.query";
import type {
  BulkDeletePayload,
  ProductBoolFilterValue,
  ProductDeleteTarget,
  ProductFilterKey,
  ProductFilters,
  ProductRow,
  ProductsQueryParams,
} from "@/types/product.types";
import {
  buildBulkEditQuery,
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
  const deleteProducts = useDeleteProductsMutation();

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

  const getProductKeys = (product: ProductRow) => [
    getProductSelectionKey(product.id),
    ...product.variants.map((variant) => getVariantSelectionKey(variant.id)),
  ];

  const handleToggleProduct = (product: ProductRow) =>
    setSelected((current) => {
      const next = new Set(current);
      const select = !current.has(getProductSelectionKey(product.id));
      getProductKeys(product).forEach((key) =>
        select ? next.add(key) : next.delete(key),
      );
      return next;
    });

  const handleToggleVariant = (product: ProductRow, variantId: number) =>
    setSelected((current) => {
      const next = new Set(current);
      const key = getVariantSelectionKey(variantId);
      if (next.has(key)) next.delete(key);
      else next.add(key);

      const productKey = getProductSelectionKey(product.id);
      const every = product.variants.every((variant) =>
        next.has(getVariantSelectionKey(variant.id)),
      );
      if (every) next.add(productKey);
      else next.delete(productKey);
      return next;
    });

  const handleToggleAll = (checked: boolean) =>
    setSelected(
      checked ? new Set(items.flatMap(getProductKeys)) : new Set(),
    );

  const handleBulkEdit = () => {
    const targets = pickSelectedProducts(items, selected);
    if (targets.length === 0) return;

    router.push({
      pathname: PRODUCT_EDIT_PATH,
      query: { [PRODUCT_BULK_EDIT_QUERY]: buildBulkEditQuery(targets) },
    });
  };

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

  const selectedVariantCount =
    selected.size > 0
      ? exportItems.reduce((sum, product) => sum + product.variants.length, 0)
      : 0;

  const handleBulkDelete = () => {
    const productIds: number[] = [];
    const variantIds: number[] = [];

    items.forEach((product) => {
      if (selected.has(getProductSelectionKey(product.id))) {
        productIds.push(product.id);
        return;
      }
      product.variants.forEach((variant) => {
        if (selected.has(getVariantSelectionKey(variant.id))) {
          variantIds.push(variant.id);
        }
      });
    });

    if (productIds.length === 0 && variantIds.length === 0) return;

    setDeleteTarget({
      kind: "bulk",
      productIds,
      variantIds,
      count: selectedVariantCount,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const payload: BulkDeletePayload =
      deleteTarget.kind === "bulk"
        ? {
            ...(deleteTarget.productIds.length > 0
              ? { product_ids: deleteTarget.productIds }
              : {}),
            ...(deleteTarget.variantIds.length > 0
              ? { variant_ids: deleteTarget.variantIds }
              : {}),
          }
        : deleteTarget.kind === "variant"
          ? { variant_ids: [deleteTarget.id] }
          : { product_ids: [deleteTarget.id] };

    deleteProducts.mutate(payload, {
      onSuccess: () => {
        setSelected(new Set());
        setDeleteTarget(null);
      },
    });
  };

  const handleCloseDelete = () => {
    deleteProducts.reset();
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
          selectedCount={selectedVariantCount}
          onBulkEdit={handleBulkEdit}
          onBulkMerge={handleComingSoon}
          onBulkDiscount={handleComingSoon}
          onBulkWriteOff={handleComingSoon}
          onBulkDelete={handleBulkDelete}
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
              onToggleProduct={handleToggleProduct}
              onToggleVariant={handleToggleVariant}
              onToggleAll={handleToggleAll}
              onToggleExpand={handleToggleExpand}
              onEdit={(productId, variantId) =>
                router.push(
                  variantId === undefined
                    ? `${PRODUCT_EDIT_PATH}/${productId}`
                    : `${PRODUCT_EDIT_PATH}/${productId}?variant=${variantId}`,
                )
              }
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
        pending={deleteProducts.isPending}
        failed={deleteProducts.isError}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
