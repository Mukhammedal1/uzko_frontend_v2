"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { cn } from "@/lib/utils";

import { useColumnVisibility } from "@/composable/useColumnVisibility";
import {
  PURCHASE_EDIT_PATH,
  PURCHASES_COLUMNS_STORAGE_KEY,
  PURCHASES_DEFAULT_COLUMNS,
} from "@/constants/purchase/purchase.constants";
import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseButtonEdit } from "@/component/base/button/BaseButtonEdit";
import { BaseTable } from "@/component/base/table/BaseTable";
import { usePurchaseDetailsQuery } from "@/rest/query/purchase/purchase.query";
import type { BaseTableColumn } from "@/types/common.types";
import type { PurchaseRow } from "@/types/purchase.types";
import { formatDateTime, formatNumber } from "@/utils/format";

type PurchasesTableProps = {
  purchases: PurchaseRow[];
  onDelete: (purchase: PurchaseRow) => void;
};

export function PurchasesTable({ purchases, onDelete }: PurchasesTableProps) {
  const t = useTranslations("purchase");
  const router = useRouter();
  const details = usePurchaseDetailsQuery(
    purchases.map((purchase) => purchase.id),
  );
  const { visibility, setColumn } = useColumnVisibility(
    PURCHASES_COLUMNS_STORAGE_KEY,
    PURCHASES_DEFAULT_COLUMNS,
  );

  const dash = <span className="text-muted-foreground">—</span>;

  const baseColumns: BaseTableColumn<PurchaseRow>[] = [
    {
      key: "id",
      header: t("columns.number"),
      toggleable: false,
      headerClassName: "w-1 whitespace-nowrap text-center",
      cellClassName: "w-1 whitespace-nowrap text-center",
      cell: (purchase) => (
        <span className="font-medium tabular-nums">{purchase.id}</span>
      ),
    },
    {
      key: "supplier",
      header: t("columns.supplier"),
      cell: (purchase) => purchase.supplier || dash,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "stock",
      header: t("columns.stock"),
      cell: (purchase) => {
        const names = details[purchase.id]?.stocks;
        if (names === undefined)
          return (
            <span className="mx-auto block h-4 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          );
        return names.length > 0 ? names.join(", ") : dash;
      },
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "total",
      header: t("columns.total"),
      cell: (purchase) => {
        const totals = details[purchase.id]?.totals ?? [];
        if (totals.length > 1)
          return (
            <div className="flex flex-col items-center">
              {totals.map((item) => (
                <span key={item.currency}>
                  {formatNumber(item.amount)} {item.currency}
                </span>
              ))}
            </div>
          );
        return `${formatNumber(purchase.totalPrice)} ${totals[0]?.currency ?? ""}`.trim();
      },
      headerClassName: "text-center",
      cellClassName: "text-center font-medium tabular-nums",
    },
    {
      key: "paid",
      header: t("columns.paid"),
      cell: (purchase) => {
        const currencies = details[purchase.id]?.currencies ?? [];
        return `${formatNumber(purchase.paidAmount)} ${currencies.length === 1 ? currencies[0] : ""}`.trim();
      },
      headerClassName: "text-center",
      cellClassName: "text-center tabular-nums",
    },
    {
      key: "method",
      header: t("columns.method"),
      cell: (purchase) =>
        purchase.paymentMethod
          ? t(
              `paymentMethods.${purchase.paymentMethod}` as Parameters<
                typeof t
              >[0],
            )
          : dash,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "user",
      header: t("columns.user"),
      cell: (purchase) => purchase.user || dash,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "date",
      header: t("columns.date"),
      cell: (purchase) =>
        purchase.createdAt ? formatDateTime(purchase.createdAt) : dash,
      headerClassName: "text-center",
      cellClassName: "whitespace-nowrap text-center tabular-nums",
    },
    {
      key: "actions",
      header: t("columns.actions"),
      toggleable: false,
      headerClassName: "text-center",
      cellClassName: "text-center",
      cell: (purchase) => {
        const remaining = details[purchase.id]?.remainingQuantity;
        const soldOut =
          remaining !== null && remaining !== undefined && remaining <= 0;
        return (
          <div className="flex justify-center gap-1.5">
            <BaseButtonEdit
              label={t("edit")}
              title={soldOut ? t("editSoldOut") : t("edit")}
              disabled={soldOut}
              onClick={() =>
                router.push(`${PURCHASE_EDIT_PATH}/${purchase.id}`)
              }
            />
            <BaseButtonDelete
              label={t("delete")}
              onClick={() => onDelete(purchase)}
            />
          </div>
        );
      },
    },
  ];

  const columns = baseColumns.map((column) => ({
    ...column,
    cellClassName: cn("py-2.5", column.cellClassName),
  }));

  return (
    <BaseTable
      columns={columns}
      rows={purchases}
      getRowKey={(purchase) => purchase.id}
      minWidthClassName="min-w-3xl"
      className="rounded-none border-0"
      columnVisibility={visibility}
      columnsLabel={t("columnsSettings")}
      onColumnVisibilityChange={setColumn}
    />
  );
}
