"use client";

import { ScanBarcode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BaseInputSearch } from "@/component/base/input/BaseInputSearch";
import { Button } from "@/component/ui/button";
import { useColumnVisibility } from "@/composable/useColumnVisibility";
import { useDebouncedValue } from "@/composable/useDebouncedValue";
import {
  SALE_COLLAPSE_DURATION_MS,
  SALE_COLUMNS_STORAGE_KEY,
  SALE_DEFAULT_COLUMNS,
  SALE_PRODUCTS_LIMIT,
  SALE_SEARCH_DEBOUNCE_MS,
  SALE_SKELETON_ROWS,
} from "@/constants/sale/sale.constants";
import { SaleCart } from "@/features/sale/SaleCart";
import { SaleProductsTable } from "@/features/sale/SaleProductsTable";
import { SaleSummary } from "@/features/sale/SaleSummary";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import { useProductsQuery } from "@/rest/query/product/product.query";
import type { ProductsQueryParams } from "@/types/product.types";
import type { SalePriceMode } from "@/types/sale.types";

const withKey = (source: Set<number>, id: number) => new Set(source).add(id);

const withoutKey = (source: Set<number>, id: number) => {
  const next = new Set(source);
  next.delete(id);
  return next;
};

export function CreateSale() {
  const t = useTranslations("sale");

  const { mainCurrency, currencyOptions } = useMainCurrencyQuery();
  const { visibility, setColumn } = useColumnVisibility(
    SALE_COLUMNS_STORAGE_KEY,
    SALE_DEFAULT_COLUMNS,
  );

  const [search, setSearch] = useState("");
  const [priceMode, setPriceMode] = useState<SalePriceMode>("retail");
  const [pickedCurrency, setPickedCurrency] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [closing, setClosing] = useState<Set<number>>(new Set());
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const currencyId =
    pickedCurrency || (mainCurrency ? String(mainCurrency.id) : "");
  const currencyCode =
    currencyOptions.find((option) => option.value === currencyId)?.label ?? "";

  const debouncedSearch = useDebouncedValue(
    search.trim(),
    SALE_SEARCH_DEBOUNCE_MS,
  );

  const params = useMemo<ProductsQueryParams>(
    () => ({
      page: 1,
      limit: SALE_PRODUCTS_LIMIT,
      search: debouncedSearch || undefined,
    }),
    [debouncedSearch],
  );

  const products = useProductsQuery(params);
  const items = useMemo(() => products.data?.items ?? [], [products.data]);
  const isInitialLoading = products.isPending && !products.data;

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
      }, SALE_COLLAPSE_DURATION_MS);
      timers.current.push(timer);
    },
    [closing, expanded],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <div className="flex min-h-0 flex-[2] flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <SaleCart
            currencyId={currencyId}
            currencyOptions={currencyOptions}
            priceMode={priceMode}
            positions={0}
            onCurrencyChange={setPickedCurrency}
            onPriceModeChange={setPriceMode}
          />
          <SaleSummary currencyCode={currencyCode} subtotal={0} total={0} />
        </div>

        <div className="flex min-h-0 flex-[3] flex-col border-t">
          <div className="flex shrink-0 items-center gap-2 border-b p-2">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={t("scan")}
              title={t("scan")}
            >
              <ScanBarcode />
            </Button>
            <div className="min-w-0 flex-1">
              <BaseInputSearch
                id="sale-products-search"
                value={search}
                placeholder={t("searchPlaceholder")}
                clearLabel={t("clear")}
                onChange={setSearch}
              />
            </div>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            aria-busy={products.isFetching}
          >
            {products.isError && !products.data ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("loadError")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => products.refetch()}
                >
                  {t("retry")}
                </Button>
              </div>
            ) : isInitialLoading ? (
              <ul
                className="flex flex-col gap-px p-3"
                aria-label={t("loading")}
              >
                {Array.from({ length: SALE_SKELETON_ROWS }, (_, index) => (
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
              <SaleProductsTable
                products={items}
                visibility={visibility}
                expanded={expanded}
                closing={closing}
                onToggleExpand={handleToggleExpand}
                onColumnChange={setColumn}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
