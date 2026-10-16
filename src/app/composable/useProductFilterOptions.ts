"use client";

import { useMemo } from "react";

import { useShelfNumbersQuery } from "@/rest/query/shelf-number/shelf-number.query";
import { useStocksQuery } from "@/rest/query/stock/stock.query";
import { useSuppliersQuery } from "@/rest/query/supplier/supplier.query";
import { useUnitsQuery } from "@/rest/query/unit/unit.query";
import type { ProductFilterOptions } from "@/types/product.types";

export function useProductFilterOptions(enabled: boolean) {
  const stocks = useStocksQuery(enabled);
  const suppliers = useSuppliersQuery(enabled);
  const units = useUnitsQuery(enabled);
  const shelfNumbers = useShelfNumbersQuery(enabled);

  return useMemo<ProductFilterOptions>(
    () => ({
      stock_id: stocks.options,
      supplier_id: suppliers.options,
      unit_id: units.options,
      shelf_number_id: shelfNumbers.options,
    }),
    [stocks.options, suppliers.options, units.options, shelfNumbers.options],
  );
}
