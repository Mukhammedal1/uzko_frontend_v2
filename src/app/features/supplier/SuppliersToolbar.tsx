"use client";

import { Download, Filter, Plus } from "lucide-react";
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
  SUPPLIERS_DEBT_FILTER_VALUES,
  SUPPLIERS_FILTER_ALL,
  SUPPLIERS_FILTER_KEYS,
} from "@/constants/supplier/supplier.constants";
import type {
  SupplierFilterKey,
  SupplierFilters,
} from "@/types/supplier.types";

type SuppliersToolbarProps = {
  search: string;
  filters: SupplierFilters;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: SupplierFilterKey, value: string) => void;
  onFiltersReset: () => void;
  onExport: () => void;
  onAdd: () => void;
};

export function SuppliersToolbar({
  search,
  filters,
  selectedCount,
  onSearchChange,
  onFilterChange,
  onFiltersReset,
  onExport,
  onAdd,
}: SuppliersToolbarProps) {
  const t = useTranslations("supplier");
  const tCommon = useTranslations("common");

  const activeCount = Object.values(filters).filter(
    (value) => value !== SUPPLIERS_FILTER_ALL,
  ).length;

  const debtOptions = SUPPLIERS_DEBT_FILTER_VALUES.map((value) => ({
    value,
    label: t(`filterValues.${value}`),
  }));

  return (
    <div className="flex flex-wrap items-center gap-2 border-b p-2">
      <div className="min-w-48 flex-1">
        <BaseInputSearch
          id="suppliers-search"
          value={search}
          placeholder={t("searchPlaceholder")}
          clearLabel={tCommon("clear")}
          onChange={onSearchChange}
        />
      </div>

      {selectedCount > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2"
          onClick={onExport}
        >
          <Download />
          {t("export.download")}
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {selectedCount}
          </span>
        </Button>
      ) : null}

      <Popover>
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
        <PopoverContent align="end" className="w-72 p-3">
          <div className="flex flex-col gap-3">
            {SUPPLIERS_FILTER_KEYS.map((key) => (
              <BaseSelect
                key={key}
                id={`suppliers-filter-${key}`}
                label={t(`filters.${key}`)}
                value={filters[key]}
                active={filters[key] !== SUPPLIERS_FILTER_ALL}
                options={debtOptions}
                onChange={(value) => onFilterChange(key, value)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={activeCount === 0}
              onClick={onFiltersReset}
            >
              {t("filtersReset")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button type="button" className="h-10 gap-2" onClick={onAdd}>
        <Plus />
        {t("add")}
      </Button>
    </div>
  );
}
