import { useRef } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ProductCreateFormValues } from "@/types/product.types";
import {
  parseNumber,
  percentFromPrice,
  roundPrice,
} from "@/utils/product-create";

type UseRoundPricesOptions = {
  form: UseFormReturn<ProductCreateFormValues>;
  defaultCurrencyId: string;
  currencyRates: Record<string, number>;
  include?: (rowIndex: number, variantIndex: number) => boolean;
};

export function useRoundPrices({
  form,
  defaultCurrencyId,
  currencyRates,
  include,
}: UseRoundPricesOptions) {
  const unroundedRef = useRef(
    new Map<string, { price: string; percent: string; rounded: string }>(),
  );

  const rateOf = (id: string) => currencyRates[id || defaultCurrencyId] ?? 1;

  const handleRoundChange = (checked: boolean) => {
    form.setValue("roundPrices", checked, { shouldDirty: true });

    form.getValues("rows").forEach((row, rowIndex) => {
      row.variants.forEach((variant, variantIndex) => {
        if (include && !include(rowIndex, variantIndex)) return;

        const path = `rows.${rowIndex}.variants.${variantIndex}` as const;
        const costRate = rateOf(variant.purchaseCurrencyId);
        const prices = [
          {
            price: "wholesalePrice",
            percent: "wholesalePercent",
            rate: rateOf(variant.wholesaleCurrencyId),
          },
          {
            price: "retailPrice",
            percent: "retailPercent",
            rate: rateOf(variant.retailCurrencyId),
          },
        ] as const;

        prices.forEach(({ price, percent, rate }) => {
          const key = `${path}.${price}`;
          const current = variant[price];

          if (!checked) {
            const saved = unroundedRef.current.get(key);
            if (saved && saved.rounded === current) {
              form.setValue(`${path}.${price}`, saved.price, {
                shouldDirty: true,
              });
              form.setValue(`${path}.${percent}`, saved.percent, {
                shouldDirty: true,
              });
            }
            unroundedRef.current.delete(key);
            return;
          }

          if (current.trim() === "") return;

          const rounded = String(roundPrice(parseNumber(current), rate));
          unroundedRef.current.set(key, {
            price: current,
            percent: variant[percent],
            rounded,
          });
          form.setValue(`${path}.${price}`, rounded, { shouldDirty: true });
          form.setValue(
            `${path}.${percent}`,
            percentFromPrice(variant.purchasePrice, rounded, costRate, rate),
            { shouldDirty: true },
          );
        });
      });
    });
  };

  return { handleRoundChange };
}
