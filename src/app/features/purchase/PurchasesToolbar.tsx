"use client";

import { Filter, PackagePlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { BaseInputSearch } from "@/component/base/input/BaseInputSearch";
import { BaseSelect } from "@/component/base/select/BaseSelect";
import { Button } from "@/component/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";
import {
  PURCHASE_PAYMENT_METHODS,
  PURCHASES_FILTER_ALL,
} from "@/constants/purchase/purchase.constants";
import { BaseInputText } from "@/component/base/input/BaseInputText";
import { useSuppliersQuery } from "@/rest/query/supplier/supplier.query";
import type {
  PurchaseFilterKey,
  PurchaseFilters,
} from "@/types/purchase.types";

type PurchasesToolbarProps = {
  search: string;
  filters: PurchaseFilters;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: PurchaseFilterKey, value: string) => void;
  onFiltersReset: () => void;
  onAdd: () => void;
};

export function PurchasesToolbar({
  search,
  filters,
  onSearchChange,
  onFilterChange,
  onFiltersReset,
  onAdd,
}: PurchasesToolbarProps) {
  const t = useTranslations("purchase");
  const tCommon = useTranslations("common");

  const suppliers = useSuppliersQuery();

  const activeCount = [
    filters.payment_method !== PURCHASES_FILTER_ALL,
    filters.supplier_id !== PURCHASES_FILTER_ALL,
    filters.from_date !== "",
    filters.to_date !== "",
  ].filter(Boolean).length;
  const active = activeCount > 0;

  const supplierOptions = [
    { value: PURCHASES_FILTER_ALL, label: t("filterAll") },
    ...suppliers.options,
  ];

  const methodOptions = [
    { value: PURCHASES_FILTER_ALL, label: t("filterAll") },
    ...PURCHASE_PAYMENT_METHODS.map((method) => ({
      value: method,
      label: t(`paymentMethods.${method}`),
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b p-2">
      <div className="min-w-48 flex-1">
        <BaseInputSearch
          id="purchases-search"
          value={search}
          placeholder={t("searchPlaceholder")}
          clearLabel={tCommon("clear")}
          onChange={onSearchChange}
        />
      </div>

      <Popover>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" className="h-10 gap-2" />
          }
        >
          <Filter />
          {t("filter")}
          {active ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeCount}
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3">
          <div className="flex flex-col gap-3">
            <BaseSelect
              id="purchases-filter-payment-method"
              label={t("paymentMethod")}
              value={filters.payment_method}
              active={filters.payment_method !== PURCHASES_FILTER_ALL}
              options={methodOptions}
              onChange={(value) => onFilterChange("payment_method", value)}
            />
            <BaseSelect
              id="purchases-filter-supplier"
              label={t("supplier")}
              value={filters.supplier_id}
              active={filters.supplier_id !== PURCHASES_FILTER_ALL}
              options={supplierOptions}
              onChange={(value) => onFilterChange("supplier_id", value)}
            />
            <BaseInputText
              id="purchases-filter-from-date"
              label={t("fromDate")}
              type="date"
              value={filters.from_date}
              onChange={(value) => onFilterChange("from_date", value)}
            />
            <BaseInputText
              id="purchases-filter-to-date"
              label={t("toDate")}
              type="date"
              value={filters.to_date}
              onChange={(value) => onFilterChange("to_date", value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!active}
              onClick={onFiltersReset}
            >
              {t("filtersReset")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button type="button" className="h-10 gap-2" onClick={onAdd}>
        <PackagePlus />
        {t("add")}
      </Button>
    </div>
  );
}
