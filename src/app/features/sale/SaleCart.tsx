"use client";

import { LayoutGrid, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

import { BaseSelect } from "@/component/base/select/BaseSelect";
import { Button } from "@/component/ui/button";
import {
  SALE_ACTIONS,
  SALE_PRICE_MODES,
} from "@/constants/sale/sale.constants";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common.types";
import type { SalePriceMode } from "@/types/sale.types";

type SaleCartProps = {
  currencyId: string;
  currencyOptions: SelectOption[];
  priceMode: SalePriceMode;
  positions: number;
  onCurrencyChange: (value: string) => void;
  onPriceModeChange: (mode: SalePriceMode) => void;
};

export function SaleCart({
  currencyId,
  currencyOptions,
  priceMode,
  positions,
  onCurrencyChange,
  onPriceModeChange,
}: SaleCartProps) {
  const t = useTranslations("sale");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{t("cart")}</span>
              <span className="text-xs text-muted-foreground">
                {t("positions", { count: positions })}
              </span>
            </div>
          </div>

          <Button type="button" variant="outline" className="h-9 gap-2">
            <LayoutGrid />
            {t("posUi")}
          </Button>

          <div className="w-28">
            <BaseSelect
              id="sale-currency"
              label={t("currency")}
              labelClassName="sr-only"
              triggerClassName="data-[size=default]:h-9 py-1 px-2.5"
              value={currencyId}
              options={currencyOptions}
              onChange={onCurrencyChange}
            />
          </div>

          <div
            role="group"
            aria-label={t("priceMode")}
            className="flex items-center gap-1 rounded-lg border p-0.5"
          >
            {SALE_PRICE_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={priceMode === mode}
                className={cn(
                  "h-8 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none",
                  priceMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => onPriceModeChange(mode)}
              >
                {t(`modes.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SALE_ACTIONS.map(({ key, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              className="h-9 gap-2"
            >
              <Icon />
              {t(`actions.${key}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-y-auto p-4 text-center">
        <ShoppingCart className="size-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">{t("emptyTitle")}</p>
        <p className="text-xs text-muted-foreground/80">{t("emptyHint")}</p>
      </div>
    </div>
  );
}
