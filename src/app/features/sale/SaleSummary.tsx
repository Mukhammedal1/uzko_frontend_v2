"use client";

import { Check, Percent, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/component/ui/button";
import { formatNumber } from "@/utils/format";

type SaleSummaryProps = {
  currencyCode: string;
  subtotal: number;
  total: number;
};

export function SaleSummary({
  currencyCode,
  subtotal,
  total,
}: SaleSummaryProps) {
  const t = useTranslations("sale");

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 border-t p-3 lg:w-72 lg:border-t-0 lg:border-l">
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">{t("subtotal")}:</span>
          <span className="font-medium tabular-nums">
            {formatNumber(subtotal)} {currencyCode}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold uppercase">{t("total")}:</span>
          <span className="text-xl font-bold tabular-nums">
            {formatNumber(total)} {currencyCode}
          </span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="h-9 gap-2">
          <Percent />
          {t("discount")}
        </Button>
        <Button type="button" variant="outline" className="h-9 gap-2">
          <ReceiptText />
          {t("demo")}
        </Button>
        <Button type="button" className="h-9 flex-1 gap-2">
          <Check />
          {t("finish")}
        </Button>
      </div>
    </aside>
  );
}
