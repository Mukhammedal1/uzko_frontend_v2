"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseButtonEdit } from "@/component/base/button/BaseButtonEdit";
import { BaseImagePreview } from "@/component/base/image/BaseImagePreview";
import { BaseTableColumnsMenu } from "@/component/base/table/BaseTableColumnsMenu";
import {
  BaseTableBody,
  BaseTableCell,
  BaseTableCol,
  BaseTableColGroup,
  BaseTableHead,
  BaseTableHeadCell,
  BaseTableRoot,
  BaseTableRow,
} from "@/component/base/table/BaseTableParts";
import { Checkbox } from "@/component/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";
import {
  SUPPLIERS_ACTIONS_COLUMN_WIDTH,
  SUPPLIERS_COLUMN_WEIGHTS,
  SUPPLIERS_SELECT_COLUMN_WIDTH,
  SUPPLIERS_TABLE_COLUMN_KEYS,
  SUPPLIERS_TOGGLE_COLUMN_KEYS,
} from "@/constants/supplier/supplier.constants";
import { cn } from "@/lib/utils";
import type { ColumnVisibility } from "@/types/common.types";
import type { SupplierMoney, SupplierRow } from "@/types/supplier.types";
import { formatNumber } from "@/utils/format";
import { pickSupplierMoney } from "@/utils/supplier";

type SuppliersTableProps = {
  suppliers: SupplierRow[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (supplier: SupplierRow) => void;
  onDelete: (supplier: SupplierRow) => void;
  visibility: ColumnVisibility;
  onColumnChange: (key: string, checked: boolean) => void;
};

const headCell =
  "sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap border-b bg-card px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide text-muted-foreground";

const cell = "overflow-hidden px-2 py-2 text-center align-middle text-sm";

const dash = <span className="text-muted-foreground">—</span>;

const textCell = (value: string) =>
  value ? (
    <span className="block truncate" title={value}>
      {value}
    </span>
  ) : (
    dash
  );

function MoneyLine({ item }: { item: SupplierMoney }) {
  return (
    <span className="font-medium">
      {formatNumber(item.amount)}{" "}
      <span className="text-sm font-normal text-muted-foreground">
        {item.currency}
      </span>
    </span>
  );
}

function Money({ items, label }: { items: SupplierMoney[]; label: string }) {
  if (items.length === 0) return dash;

  if (items.length === 1) {
    return (
      <div className="flex flex-col items-center leading-tight tabular-nums">
        <MoneyLine item={items[0]} />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        title={label}
        className="mx-auto flex max-w-full cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 leading-tight tabular-nums outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MoneyLine item={items[0]} />
        <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
          +{items.length - 1}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-auto min-w-44 gap-1 border border-border p-2 shadow-lg"
      >
        {items.map((item) => (
          <div
            key={item.currency}
            className="flex items-center justify-end tabular-nums"
          >
            <MoneyLine item={item} />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function SuppliersTable({
  suppliers,
  selected,
  onToggle,
  onToggleAll,
  onEdit,
  onDelete,
  visibility,
  onColumnChange,
}: SuppliersTableProps) {
  const t = useTranslations("supplier");
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(
    null,
  );

  const columnKeys = SUPPLIERS_TABLE_COLUMN_KEYS.filter(
    (key) => key === "fullname" || visibility[key] !== false,
  );
  const visibleKeys = new Set<string>(columnKeys);
  const weightSum = columnKeys.reduce(
    (sum, key) => sum + SUPPLIERS_COLUMN_WEIGHTS[key],
    0,
  );
  const flexibleWidth =
    100 - SUPPLIERS_SELECT_COLUMN_WIDTH - SUPPLIERS_ACTIONS_COLUMN_WIDTH;
  const toWidth = (weight: number) =>
    `${(weight / weightSum) * flexibleWidth}%`;
  const menuItems = SUPPLIERS_TOGGLE_COLUMN_KEYS.map((key) => ({
    key,
    label: t(`columns.${key}`),
  }));

  const allSelected =
    suppliers.length > 0 && suppliers.every((item) => selected.has(item.id));
  const someSelected =
    !allSelected && suppliers.some((item) => selected.has(item.id));

  const avatarBox =
    "mx-auto flex size-10 items-center justify-center overflow-hidden rounded-full border bg-muted text-muted-foreground";

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto">
        <BaseTableRoot className="w-full min-w-300 table-fixed border-collapse">
          <BaseTableColGroup>
            <BaseTableCol
              style={{ width: `${SUPPLIERS_SELECT_COLUMN_WIDTH}%` }}
            />
            {columnKeys.map((key) => (
              <BaseTableCol
                key={key}
                style={{ width: toWidth(SUPPLIERS_COLUMN_WEIGHTS[key]) }}
              />
            ))}
            <BaseTableCol
              style={{ width: `${SUPPLIERS_ACTIONS_COLUMN_WIDTH}%` }}
            />
          </BaseTableColGroup>
          <BaseTableHead>
            <BaseTableRow>
              <BaseTableHeadCell className={cn(headCell, "px-0 text-center")}>
                <Checkbox
                  className="mx-auto"
                  checked={allSelected}
                  indeterminate={someSelected}
                  aria-label={t("selectAll")}
                  onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
                />
              </BaseTableHeadCell>
              {columnKeys.map((key) => {
                const label = t(`columns.${key}`);

                return (
                  <BaseTableHeadCell
                    key={key}
                    title={label}
                    className={cn(
                      headCell,
                      key !== "fullname" && "text-center",
                    )}
                  >
                    {label}
                  </BaseTableHeadCell>
                );
              })}
              <BaseTableHeadCell className={cn(headCell, "text-center")}>
                <span className="flex items-center justify-center gap-1">
                  <span className="truncate">{t("columns.actions")}</span>
                  <BaseTableColumnsMenu
                    items={menuItems}
                    visibility={visibility}
                    label={t("columnsSettings")}
                    onChange={onColumnChange}
                  />
                </span>
              </BaseTableHeadCell>
            </BaseTableRow>
          </BaseTableHead>
          <BaseTableBody>
            {suppliers.map((supplier) => (
              <BaseTableRow
                key={supplier.id}
                className={cn(
                  "h-14 border-b transition-colors hover:bg-muted/50",
                  selected.has(supplier.id) && "bg-muted/60",
                )}
              >
                <BaseTableCell className={cn(cell, "px-0 text-center")}>
                  <Checkbox
                    className="mx-auto"
                    checked={selected.has(supplier.id)}
                    aria-label={t("selectRow")}
                    onCheckedChange={() => onToggle(supplier.id)}
                  />
                </BaseTableCell>
                {visibleKeys.has("image") ? (
                  <BaseTableCell className={cell}>
                    {supplier.imageUrl ? (
                      <button
                        type="button"
                        aria-label={supplier.fullname}
                        className={cn(
                          avatarBox,
                          "cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        )}
                        onClick={() =>
                          setPreview({
                            src: supplier.imageUrl as string,
                            label: supplier.fullname,
                          })
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={supplier.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </button>
                    ) : (
                      <span className={avatarBox}>
                        <User className="size-4" />
                      </span>
                    )}
                  </BaseTableCell>
                ) : null}
                <BaseTableCell className={cell}>
                  <div className="flex min-w-0 flex-col text-left leading-tight">
                    <span
                      className="truncate text-base font-medium"
                      title={supplier.fullname}
                    >
                      {supplier.fullname}
                    </span>
                    {supplier.phoneNumber ? (
                      <span
                        className="truncate text-xs leading-4 text-muted-foreground"
                        title={supplier.phoneNumber}
                      >
                        {supplier.phoneNumber}
                      </span>
                    ) : null}
                  </div>
                </BaseTableCell>
                {visibleKeys.has("organization") ? (
                  <BaseTableCell className={cell}>
                    {textCell(supplier.organizationName)}
                  </BaseTableCell>
                ) : null}
                {visibleKeys.has("inn") ? (
                  <BaseTableCell className={cn(cell, "tabular-nums")}>
                    {textCell(supplier.organizationInn)}
                  </BaseTableCell>
                ) : null}
                {visibleKeys.has("account") ? (
                  <BaseTableCell className={cn(cell, "tabular-nums")}>
                    {textCell(supplier.bankAccountNumber)}
                  </BaseTableCell>
                ) : null}
                {visibleKeys.has("address") ? (
                  <BaseTableCell className={cell}>
                    {textCell(supplier.address)}
                  </BaseTableCell>
                ) : null}
                {visibleKeys.has("note") ? (
                  <BaseTableCell className={cell}>
                    {textCell(supplier.note)}
                  </BaseTableCell>
                ) : null}
                {visibleKeys.has("debt") ? (
                  <BaseTableCell className={cell}>
                    <Money
                      items={pickSupplierMoney(supplier, "debt")}
                      label={t("showAllDebts")}
                    />
                  </BaseTableCell>
                ) : null}
                {visibleKeys.has("payment") ? (
                  <BaseTableCell className={cell}>
                    <Money
                      items={pickSupplierMoney(supplier, "paid")}
                      label={t("showAllPaid")}
                    />
                  </BaseTableCell>
                ) : null}
                <BaseTableCell className={cell}>
                  <div className="flex justify-center gap-1.5">
                    <BaseButtonEdit
                      label={t("edit")}
                      onClick={() => onEdit(supplier)}
                    />
                    <BaseButtonDelete
                      label={t("delete")}
                      onClick={() => onDelete(supplier)}
                    />
                  </div>
                </BaseTableCell>
              </BaseTableRow>
            ))}
          </BaseTableBody>
        </BaseTableRoot>
      </div>
      <BaseImagePreview
        open={preview !== null}
        src={preview?.src ?? null}
        title={preview?.label ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
