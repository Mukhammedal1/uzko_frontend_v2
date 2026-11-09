"use client";

import { History } from "lucide-react";
import { useTranslations } from "next-intl";

import { BaseTable } from "@/component/base/table/BaseTable";
import { cn } from "@/lib/utils";
import { usePurchaseHistoryQuery } from "@/rest/query/purchase/purchase.query";
import type { BaseTableColumn } from "@/types/common.types";
import type { PurchaseHistoryRow } from "@/types/purchase.types";
import { formatDateTime, formatNumber } from "@/utils/format";

type PurchaseHistoryProps = {
  purchaseId: number;
};

export function PurchaseHistory({ purchaseId }: PurchaseHistoryProps) {
  const t = useTranslations("purchase.history");
  const { rows, isError } = usePurchaseHistoryQuery(purchaseId);

  const money = (value: number, currency: string) =>
    `${value > 0 ? "+" : ""}${formatNumber(value)} ${currency}`.trim();

  const columns: BaseTableColumn<PurchaseHistoryRow>[] = [
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
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <History className="size-4 text-primary" />
        {t("title")}
      </h2>
      <div className="overflow-hidden rounded-lg border">
        <BaseTable
          columns={columns}
          rows={rows ?? []}
          getRowKey={(row) => row.id}
          minWidthClassName="min-w-xl"
          loading={rows === undefined && !isError}
          emptyLabel={isError ? t("loadError") : t("empty")}
          className="max-h-72 rounded-none border-0"
        />
      </div>
    </section>
  );
}
