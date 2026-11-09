"use client";

import { useTranslations } from "next-intl";

import { BaseTable } from "@/component/base/table/BaseTable";
import { Button } from "@/component/ui/button";
import { PURCHASE_EDIT_LOG_LIMIT } from "@/constants/purchase/purchase.constants";
import { DefaultChildTabs } from "@/layouts/default/DefaultChildTabs";
import { cn } from "@/lib/utils";
import { usePurchaseEditLogQuery } from "@/rest/query/purchase/purchase.query";
import type { BaseTableColumn } from "@/types/common.types";
import type { PurchaseEditLogRow } from "@/types/purchase.types";
import { formatDateTime, formatNumber } from "@/utils/format";

export function PurchaseEditHistory() {
  const t = useTranslations("purchase.history");
  const { rows, isPending, isError, refetch } = usePurchaseEditLogQuery(
    PURCHASE_EDIT_LOG_LIMIT,
  );

  const money = (value: number, currency: string) =>
    `${value > 0 ? "+" : ""}${formatNumber(value)} ${currency}`.trim();

  const columns: BaseTableColumn<PurchaseEditLogRow>[] = [
    {
      key: "purchase",
      header: t("purchase"),
      headerClassName: "w-1 whitespace-nowrap text-center",
      cellClassName:
        "w-1 whitespace-nowrap text-center font-medium tabular-nums",
      cell: (row) => row.purchaseId,
    },
    {
      key: "supplier",
      header: t("supplier"),
      headerClassName: "text-center",
      cellClassName: "text-center",
      cell: (row) => row.supplier || "—",
    },
    {
      key: "date",
      header: t("date"),
      headerClassName: "text-center",
      cellClassName: "whitespace-nowrap text-center tabular-nums",
      cell: (row) => (row.createdAt ? formatDateTime(row.createdAt) : "—"),
    },
    {
      key: "user",
      header: t("user"),
      headerClassName: "text-center",
      cellClassName: "text-center",
      cell: (row) => row.user || "—",
    },
    {
      key: "note",
      header: t("note"),
      headerClassName: "text-center",
      cellClassName: "text-center",
      cell: (row) => row.note || "—",
    },
    {
      key: "debt",
      header: t("debt"),
      headerClassName: "text-center",
      cellClassName: "whitespace-nowrap text-center tabular-nums",
      cell: (row) => (
        <span
          className={cn(
            row.debtDelta > 0 && "font-medium text-destructive",
            row.debtDelta === 0 && "text-muted-foreground",
          )}
        >
          {money(row.debtDelta, row.currency)}
        </span>
      ),
    },
    {
      key: "paid",
      header: t("paid"),
      headerClassName: "text-center",
      cellClassName: "whitespace-nowrap text-center tabular-nums",
      cell: (row) => (
        <span className={cn(row.paidDelta === 0 && "text-muted-foreground")}>
          {money(row.paidDelta, row.currency)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <DefaultChildTabs />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isError && rows.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("loadError")}</p>
              <Button type="button" variant="outline" onClick={() => refetch()}>
                {t("retry")}
              </Button>
            </div>
          ) : isPending ? (
            <ul className="flex flex-col gap-px p-3" aria-label={t("loading")}>
              {Array.from({ length: 8 }, (_, index) => (
                <li
                  key={index}
                  className="h-12 animate-pulse rounded-md bg-muted/60 motion-reduce:animate-none"
                />
              ))}
            </ul>
          ) : rows.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <BaseTable
              columns={columns}
              rows={rows}
              getRowKey={(row) => `${row.purchaseId}-${row.id}`}
              minWidthClassName="min-w-3xl"
              className="rounded-none border-0"
            />
          )}
        </div>
      </section>
    </div>
  );
}
