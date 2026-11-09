"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { SupplierMoney, SupplierStats } from "@/types/supplier.types";
import { formatNumber } from "@/utils/format";

type SuppliersStatsProps = {
  stats: SupplierStats;
};

const moneyLines = (items: SupplierMoney[]) =>
  items.map((item) => `${formatNumber(item.amount)} ${item.currency}`);

export function SuppliersStats({ stats }: SuppliersStatsProps) {
  const t = useTranslations("supplier");

  const items = [
    {
      key: "count",
      label: t("stats.count"),
      lines: [`${formatNumber(stats.count)} ${t("stats.countUnit")}`],
      accent: false,
    },
    {
      key: "debt",
      label: t("stats.debt"),
      lines: moneyLines(stats.debt),
      accent: false,
    },
    {
      key: "paid",
      label: t("stats.paid"),
      lines: moneyLines(stats.paid),
      accent: false,
    },
    {
      key: "turnover",
      label: t("stats.turnover"),
      lines: moneyLines(stats.turnover),
      accent: true,
    },
  ];

  return (
    <dl className="grid shrink-0 grid-cols-1 gap-1 border-b p-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            "flex min-w-0 flex-col gap-2 rounded-lg border bg-muted/50 px-4 py-3",
            item.accent && "border-primary/30 bg-primary/10 text-primary",
          )}
        >
          <dt
            className={cn(
              "truncate text-xs uppercase tracking-wide text-muted-foreground",
              item.accent && "text-primary/80",
            )}
            title={item.label}
          >
            {item.label}
          </dt>
          <dd className="flex min-w-0 items-center gap-4 overflow-x-auto text-xl font-semibold tabular-nums [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {item.lines.length === 0 ? (
              <span>0</span>
            ) : (
              item.lines.map((line) => (
                <span key={line} className="shrink-0 whitespace-nowrap">
                  {line}
                </span>
              ))
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
