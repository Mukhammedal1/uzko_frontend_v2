"use client";

import { Download, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BaseInputSearch } from "@/component/base/input/BaseInputSearch";
import { Button } from "@/component/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";
import { BaseSelect } from "@/component/base/select/BaseSelect";
import { ProductsAddMenu } from "@/features/product/ProductsAddMenu";
import { useProductFilterOptions } from "@/composable/useProductFilterOptions";
import {
  PRODUCTS_BOOL_FILTER_KEYS,
  PRODUCTS_BOOL_FILTER_VALUES,
  PRODUCTS_FILTER_ALL,
  PRODUCTS_SELECT_FILTER_KEYS,
} from "@/constants/product/product.constants";

import type {
  ProductBoolFilterKey,
  ProductFilterKey,
  ProductFilters,
  ProductSelectFilterKey,
} from "@/types/product.types";
import { formatNumber } from "@/utils/format";

type ProductsToolbarProps = {
  search: string;
  filters: ProductFilters;
  total: number;
  costTotals: { currency: string; amount: number }[];
  exportCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: ProductFilterKey, value: string) => void;
  onFiltersReset: () => void;
  onExport: () => void;
  onAddManual: () => void;
  onAddImport: () => void;
  onAddTemplate: () => void;
};

export function ProductsToolbar({
  search,
  filters,
  total,
  costTotals,
  exportCount,
  onSearchChange,
  onFilterChange,
  onFiltersReset,
  onExport,
  onAddManual,
  onAddImport,
  onAddTemplate,
}: ProductsToolbarProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");

  const [filterOpen, setFilterOpen] = useState(false);
  const options = useProductFilterOptions(filterOpen);

  const activeCount = [
    ...PRODUCTS_SELECT_FILTER_KEYS,
    ...PRODUCTS_BOOL_FILTER_KEYS,
  ].filter((key) => filters[key] !== PRODUCTS_FILTER_ALL).length;

  const selectOptions = (key: ProductSelectFilterKey) => [
    { value: PRODUCTS_FILTER_ALL, label: t(`filtersAll.${key}`) },
    ...options[key],
  ];

  const boolOptions = PRODUCTS_BOOL_FILTER_VALUES.map((value) => ({
    value,
    label: t(`filterValues.${value}`),
  }));

  const boolLabel = (key: ProductBoolFilterKey) => t(`filters.${key}`);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b p-2 sm:gap-2">
      <div className="min-w-48 flex-1">
        <BaseInputSearch
          id="products-search"
          value={search}
          placeholder={t("searchPlaceholder")}
          clearLabel={tCommon("clear")}
          onChange={onSearchChange}
        />
      </div>

      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" className="h-10 gap-2" />
          }
        >
          <Filter />
          {t("filter")}
          {activeCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeCount}
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 p-3"
        >
          <div className="flex max-h-[min(70vh,28rem)] flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PRODUCTS_SELECT_FILTER_KEYS.map((key) => (
              <BaseSelect
                key={key}
                id={`products-filter-${key}`}
                label={t(`filters.${key}`)}
                value={filters[key]}
                active={filters[key] !== PRODUCTS_FILTER_ALL}
                options={selectOptions(key)}
                onChange={(value) => onFilterChange(key, value)}
              />
            ))}
            {PRODUCTS_BOOL_FILTER_KEYS.map((key) => (
              <BaseSelect
                key={key}
                id={`products-filter-${key}`}
                label={boolLabel(key)}
                value={filters[key]}
                active={filters[key] !== PRODUCTS_FILTER_ALL}
                options={boolOptions}
                onChange={(value) => onFilterChange(key, value)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={activeCount === 0}
              onClick={onFiltersReset}
            >
              {t("filtersReset")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ProductsAddMenu
        onManual={onAddManual}
        onImport={onAddImport}
        onTemplate={onAddTemplate}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10"
        disabled={exportCount === 0}
        aria-label={t("export")}
        title={t("export")}
        onClick={onExport}
      >
        <Download />
      </Button>

      <dl className="flex items-stretch divide-x rounded-lg border">
        <div className="flex min-w-16 flex-col items-end justify-center px-3 py-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("totalCount")}
          </dt>
          <dd className="text-sm font-semibold tabular-nums leading-tight">
            {formatNumber(total)}
          </dd>
        </div>
        <div className="flex min-w-24 flex-col items-end justify-center px-3 py-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("totalCost")}
          </dt>
          <dd className="text-sm font-semibold tabular-nums leading-tight">
            {costTotals.length === 0
              ? "0"
              : costTotals
                  .map(
                    (item) =>
                      `${formatNumber(item.amount)} ${item.currency}`.trim(),
                  )
                  .join(" + ")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
