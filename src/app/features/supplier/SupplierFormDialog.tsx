"use client";

import { FileText, Plus, Wallet, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";

import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseInputFile } from "@/component/base/input/BaseInputFile";
import { BaseInputText } from "@/component/base/input/BaseInputText";
import { Button } from "@/component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import { Label } from "@/component/ui/label";
import { Textarea } from "@/component/ui/textarea";
import {
  SUPPLIER_FIELD_ICONS,
  SUPPLIER_FORM_DEFAULTS,
  SUPPLIER_TEXT_FIELDS,
} from "@/constants/supplier/supplier.constants";
import { useZodForm } from "@/plugins/react-hook-form";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import { useUploadFileMutation } from "@/rest/query/file/file.query";
import type { SupplierPayload, SupplierRow } from "@/types/supplier.types";
import {
  buildSupplierPayload,
  emptyDebtRow,
  supplierToFormValues,
} from "@/utils/supplier";
import { supplierFormSchema } from "@/validate/supplier/createOrUpdate.zod";

type SupplierFormDialogProps = {
  open: boolean;
  supplier: SupplierRow | null;
  pending: boolean;
  onSubmit: (payload: SupplierPayload) => void;
  onClose: () => void;
};

type SupplierFormProps = Omit<SupplierFormDialogProps, "open">;

function SupplierForm({
  supplier,
  pending,
  onSubmit,
  onClose,
}: SupplierFormProps) {
  const t = useTranslations("supplier");
  const tAll = useTranslations();
  const tCommon = useTranslations("common");

  const { mainCurrency, businessCurrencies } = useMainCurrencyQuery();
  const defaultCurrencyId = mainCurrency ? String(mainCurrency.businessId) : "";
  const currencyOptions = businessCurrencies.map((currency) => ({
    value: String(currency.businessId),
    label: currency.code,
  }));

  const form = useZodForm(supplierFormSchema, {
    defaultValues: supplier
      ? supplierToFormValues(supplier, defaultCurrencyId)
      : {
          ...SUPPLIER_FORM_DEFAULTS,
          debts: [emptyDebtRow(defaultCurrencyId)],
        },
  });
  const debtRows = useFieldArray({ control: form.control, name: "debts" });
  const [initialDebtRows] = useState(debtRows.fields.length);
  const debts = form.watch("debts");
  const usedCurrencies = debts.map(
    (item) => item.currency_id || defaultCurrencyId,
  );
  const freeCurrency = currencyOptions.find(
    (option) => !usedCurrencies.includes(option.value),
  );
  const upload = useUploadFileMutation();

  const [fileId, setFileId] = useState<number | null>(
    supplier?.imageId ?? null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    supplier?.imageUrl ?? null,
  );
  const [fileName, setFileName] = useState("");

  const handleSelect = (file: File) => {
    upload.mutate(file, {
      onSuccess: (uploaded) => {
        setFileId(uploaded.id);
        setFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));
      },
    });
  };

  const handleClear = () => {
    setFileId(null);
    setFileName("");
    setPreviewUrl(null);
  };

  const handleSubmit = form.handleSubmit((values) =>
    onSubmit(
      buildSupplierPayload(
        values,
        fileId,
        defaultCurrencyId,
        supplier !== null,
        Boolean(supplier?.imageId),
      ),
    ),
  );

  const errorText = (message?: string) =>
    message ? tAll(message as Parameters<typeof tAll>[0]) : undefined;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {supplier ? t("form.editTitle") : t("form.createTitle")}
        </DialogTitle>
      </DialogHeader>

      <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <BaseInputFile
          id="supplier-image"
          round
          label={t("form.image")}
          placeholder={t("form.imagePlaceholder")}
          accept="image/*"
          fileName={fileName}
          previewUrl={previewUrl ?? undefined}
          loading={upload.isPending}
          clearLabel={tCommon("clear")}
          onSelect={handleSelect}
          onClear={handleClear}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SUPPLIER_TEXT_FIELDS.map((name) => {
            const Icon = SUPPLIER_FIELD_ICONS[name];

            return (
              <Controller
                key={name}
                control={form.control}
                name={name}
                render={({ field, fieldState }) => (
                  <BaseInputText
                    id={`supplier-${name}`}
                    label={t(`form.${name}`)}
                    required={name === "fullname"}
                    icon={<Icon />}
                    value={field.value}
                    error={errorText(fieldState.error?.message)}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {debtRows.fields.map((row, index) => {
            const own = usedCurrencies[index];
            const options = currencyOptions.filter(
              (option) =>
                option.value === own || !usedCurrencies.includes(option.value),
            );

            return (
              <div
                key={row.id}
                className={
                  index >= initialDebtRows ? "animate-expand" : undefined
                }
              >
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Controller
                      control={form.control}
                      name={`debts.${index}.amount`}
                      render={({ field, fieldState }) => (
                        <BaseInputAddon
                          id={`supplier-debt-${index}`}
                          label={
                            index === 0
                              ? t("form.total_debt_amount")
                              : undefined
                          }
                          icon={<Wallet />}
                          value={field.value}
                          numeric={{ decimals: 2 }}
                          suffixOptions={options}
                          suffixValue={own}
                          error={errorText(fieldState.error?.message)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          onSuffixChange={(value) =>
                            form.setValue(`debts.${index}.currency_id`, value)
                          }
                        />
                      )}
                    />
                  </div>
                  {debtRows.fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      aria-label={t("form.removeDebt")}
                      title={t("form.removeDebt")}
                      onClick={() => debtRows.remove(index)}
                    >
                      <X />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            disabled={!freeCurrency}
            onClick={() =>
              freeCurrency && debtRows.append(emptyDebtRow(freeCurrency.value))
            }
          >
            <Plus />
            {t("form.addDebt")}
          </Button>
        </div>

        <Controller
          control={form.control}
          name="note"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier-note">{t("form.note")}</Label>
              <div className="relative">
                <FileText className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
                <Textarea
                  id="supplier-note"
                  className="pl-9"
                  value={field.value}
                  rows={3}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                />
              </div>
            </div>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onClose}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={pending || upload.isPending}>
            {pending ? tCommon("loading") : tCommon("save")}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function SupplierFormDialog({
  open,
  supplier,
  pending,
  onSubmit,
  onClose,
}: SupplierFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <SupplierForm
          key={supplier?.id ?? "new"}
          supplier={supplier}
          pending={pending}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
