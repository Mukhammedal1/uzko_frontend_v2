"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/component/ui/button";
import { Checkbox } from "@/component/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import {
  SUPPLIER_EXPORT_COLUMNS,
  SUPPLIER_EXPORT_FORMATS,
} from "@/constants/supplier/supplier.constants";
import type {
  SupplierExportColumn,
  SupplierExportColumnKey,
  SupplierExportFormat,
} from "@/types/supplier.types";

type SupplierExportDialogProps = {
  open: boolean;
  count: number;
  onConfirm: (
    format: SupplierExportFormat,
    columns: SupplierExportColumn[],
  ) => void;
  onClose: () => void;
};

type SupplierExportFormProps = Omit<SupplierExportDialogProps, "open">;

const FORMAT_ICONS = {
  xlsx: FileSpreadsheet,
  pdf: FileText,
} as const;

function SupplierExportForm({
  count,
  onConfirm,
  onClose,
}: SupplierExportFormProps) {
  const t = useTranslations("supplier");
  const tCommon = useTranslations("common");

  const [format, setFormat] = useState<SupplierExportFormat>("xlsx");
  const [keys, setKeys] = useState<Set<SupplierExportColumnKey>>(
    () => new Set(SUPPLIER_EXPORT_COLUMNS.map((column) => column.key)),
  );

  const toggle = (key: SupplierExportColumnKey, checked: boolean) => {
    setKeys((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleConfirm = () => {
    const columns = SUPPLIER_EXPORT_COLUMNS.filter((column) =>
      keys.has(column.key),
    ).map((column) => ({
      key: column.key,
      label: t(column.labelKey as Parameters<typeof t>[0]),
    }));

    onConfirm(format, columns);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Download className="size-5 shrink-0" />
          {t("export.title")}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <p className="rounded-lg border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          {t("export.selected", { count })}
        </p>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("export.format")}</span>
          <div className="grid grid-cols-2 gap-2">
            {SUPPLIER_EXPORT_FORMATS.map((value) => {
              const Icon = FORMAT_ICONS[value];

              return (
                <Button
                  key={value}
                  type="button"
                  variant={format === value ? "default" : "outline"}
                  className="h-10 gap-2"
                  aria-pressed={format === value}
                  onClick={() => setFormat(value)}
                >
                  <Icon />
                  {t(`export.formats.${value}`)}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("export.columns")}</span>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-lg border p-3 sm:grid-cols-2">
            {SUPPLIER_EXPORT_COLUMNS.map((column) => (
              <label
                key={column.key}
                className="flex min-w-0 items-center gap-2 text-sm leading-tight"
              >
                <Checkbox
                  checked={keys.has(column.key)}
                  onCheckedChange={(checked) =>
                    toggle(column.key, Boolean(checked))
                  }
                />
                <span className="min-w-0 break-words">
                  {t(column.labelKey as Parameters<typeof t>[0])}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <Button
          type="button"
          className="gap-2"
          disabled={keys.size === 0}
          onClick={handleConfirm}
        >
          <Download />
          {t("export.download")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function SupplierExportDialog({
  open,
  count,
  onConfirm,
  onClose,
}: SupplierExportDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        {open ? (
          <SupplierExportForm
            count={count}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
