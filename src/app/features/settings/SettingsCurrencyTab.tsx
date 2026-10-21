"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BaseButtonEdit } from "@/component/base/button/BaseButtonEdit";
import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseTable } from "@/component/base/table/BaseTable";
import { Button } from "@/component/ui/button";
import { SETTINGS_FIXED_RATE_CURRENCY } from "@/constants/settings/settings.constants";
import {
  useBusinessCurrencyRowsQuery,
  useSaveCurrencyRateMutation,
  useSetMainCurrencyMutation,
} from "@/rest/query/currency/currency.query";
import type { BaseTableColumn } from "@/types/common.types";
import type { BusinessCurrencyRow } from "@/types/settings.types";
import { formatNumeric } from "@/utils/number-input";
import { parseNumber } from "@/utils/product-create";

export function SettingsCurrencyTab() {
  const t = useTranslations("settingsGeneral");
  const tCommon = useTranslations("common");

  const { rows, isPending } = useBusinessCurrencyRowsQuery();
  const saveRate = useSaveCurrencyRateMutation();
  const setMain = useSetMainCurrencyMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [rate, setRate] = useState("");

  const isRateFixed = (row: BusinessCurrencyRow) =>
    row.name.trim().toUpperCase() === SETTINGS_FIXED_RATE_CURRENCY;

  const startEdit = (row: BusinessCurrencyRow) => {
    setEditingId(row.id);
    setRate(String(row.rate));
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (row: BusinessCurrencyRow) => {
    const value = parseNumber(rate);
    if (value <= 0) return;

    saveRate.mutate({ id: row.id, rate: value }, { onSuccess: cancelEdit });
  };

  const columns: BaseTableColumn<BusinessCurrencyRow>[] = [
    {
      key: "id",
      header: t("columns.id"),
      headerClassName: "w-20",
      cellClassName: "tabular-nums",
      cell: (row) => row.id,
    },
    { key: "name", header: t("columns.name"), cell: (row) => row.name },
    { key: "symbol", header: t("columns.symbol"), cell: (row) => row.symbol },
    {
      key: "rate",
      header: t("columns.rate"),
      cellClassName: "tabular-nums",
      cell: (row) =>
        editingId === row.id ? (
          <div className="max-w-40">
            <BaseInputAddon
              id={`currency-rate-${row.id}`}
              value={rate}
              numeric={{ decimals: 2 }}
              onChange={setRate}
            />
          </div>
        ) : (
          formatNumeric(String(row.rate), { decimals: 2 })
        ),
    },
    {
      key: "main",
      header: t("columns.main"),
      cell: (row) => (
        <input
          type="radio"
          name="main-currency"
          aria-label={t("columns.main")}
          checked={row.isMain}
          disabled={setMain.isPending}
          className="size-4 cursor-pointer accent-primary"
          onChange={() => setMain.mutate(row.id)}
        />
      ),
    },
    {
      key: "actions",
      header: t("columns.actions"),
      headerClassName: "w-32 text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {editingId === row.id ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={tCommon("save")}
                title={tCommon("save")}
                disabled={saveRate.isPending || parseNumber(rate) <= 0}
                onClick={() => saveEdit(row)}
              >
                <Check />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={tCommon("cancel")}
                title={tCommon("cancel")}
                disabled={saveRate.isPending}
                onClick={cancelEdit}
              >
                <X />
              </Button>
            </>
          ) : isRateFixed(row) ? null : (
            <BaseButtonEdit
              label={tCommon("edit")}
              onClick={() => startEdit(row)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t("currency.description")}
      </p>

      <BaseTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        loading={isPending}
        emptyLabel={t("empty")}
        minWidthClassName="min-w-2xl"
      />
    </div>
  );
}
