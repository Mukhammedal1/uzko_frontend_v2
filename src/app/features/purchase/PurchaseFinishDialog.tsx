"use client";

import { Check, Plus, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import {
  Controller,
  useFieldArray,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";

import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
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
  PURCHASE_FINISH_DEFAULTS,
  PURCHASE_PAYMENT_ICONS,
  PURCHASE_PAYMENT_METHODS,
  PURCHASE_PAYMENT_PROVIDERS,
} from "@/constants/purchase/purchase.constants";
import { useZodForm } from "@/plugins/react-hook-form";
import { useSupplierDebtsQuery } from "@/rest/query/supplier/supplier.query";
import type {
  PurchaseCurrencyTotal,
  PurchaseFinishFormValues,
  PurchasePaymentMethod,
  PurchaseTotals,
} from "@/types/purchase.types";
import type { SelectOption } from "@/types/common.types";
import { formatNumber } from "@/utils/format";
import { calcPurchaseDebts, emptyPaymentRow } from "@/utils/purchase";
import { purchaseFinishSchema } from "@/validate/purchase/finish.zod";

type PurchaseFinishDialogProps = {
  open: boolean;
  totals: PurchaseTotals;
  currencyOptions: SelectOption[];
  defaultCurrencyId: string;
  supplierId: string;
  pending: boolean;
  editing?: boolean;
  defaults?: PurchaseFinishFormValues;
  onConfirm: (values: PurchaseFinishFormValues) => void;
  onClose: () => void;
};

type PurchaseFinishFormProps = Omit<PurchaseFinishDialogProps, "open">;

function PurchaseFinishForm({
  totals,
  currencyOptions,
  defaultCurrencyId,
  supplierId,
  pending,
  editing = false,
  defaults,
  onConfirm,
  onClose,
}: PurchaseFinishFormProps) {
  const t = useTranslations("purchase.finish");
  const tPurchase = useTranslations("purchase");
  const tCommon = useTranslations("common");
  const tAll = useTranslations();
  const supplierDebts = useSupplierDebtsQuery(supplierId);

  const form: UseFormReturn<
    PurchaseFinishFormValues,
    unknown,
    PurchaseFinishFormValues
  > = useZodForm(purchaseFinishSchema, {
    defaultValues: defaults ?? {
      ...PURCHASE_FINISH_DEFAULTS,
      paidAmounts: [emptyPaymentRow(defaultCurrencyId)],
    },
  });

  const payments = useFieldArray({
    control: form.control,
    name: "paidAmounts",
  });
  const paidAmounts = useWatch({ control: form.control, name: "paidAmounts" });

  const codeOf = (currencyId: string) =>
    currencyOptions.find((option) => option.value === currencyId)?.label ?? "";

  const formatMoney = (item: PurchaseCurrencyTotal) =>
    `${formatNumber(item.amount)} ${codeOf(item.currencyId)}`;

  const usedCurrencies = paidAmounts.map(
    (payment) => payment.currencyId || defaultCurrencyId,
  );
  const freeCurrency = currencyOptions.find(
    (option) => !usedCurrencies.includes(option.value),
  );

  const method = useWatch({
    control: form.control,
    name: "paymentMethod",
  }) as PurchasePaymentMethod;
  const providers = PURCHASE_PAYMENT_PROVIDERS[method] ?? [];

  const handleMethodChange = (
    next: PurchasePaymentMethod,
    onChange: (value: string) => void,
  ) => {
    if (next === method) return;
    onChange(next);
    form.setValue("paymentProvider", "");
    form.clearErrors("paymentProvider");
  };

  const debts = calcPurchaseDebts(
    totals.byCurrency,
    paidAmounts,
    defaultCurrencyId,
  );

  const translateError = (message?: string) =>
    message ? tAll(message as Parameters<typeof tAll>[0]) : undefined;

  const handleSubmit = form.handleSubmit((values) => onConfirm(values));

  return (
    <form noValidate className="flex min-h-0 flex-col" onSubmit={handleSubmit}>
      <DialogHeader className="border-b px-4 pt-4 pb-3">
        <DialogTitle>{editing ? t("editTitle") : t("title")}</DialogTitle>
      </DialogHeader>

      <div className="flex items-end justify-between gap-3 border-b bg-muted/50 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{t("adding")}</span>
          <span className="truncate text-sm font-semibold">
            {totals.count === 1
              ? `${totals.firstName} · ${formatNumber(totals.firstQuantity)}`
              : t("itemsCount", { count: totals.count })}
          </span>
        </div>
        <div className="flex min-w-0 shrink-0 flex-col items-end gap-0.5">
          <span className="text-xs text-muted-foreground">{t("total")}</span>
          <div className="flex max-w-56 flex-col items-end text-xl font-bold tabular-nums">
            {totals.byCurrency.map((item) => (
              <span key={item.currencyId}>{formatMoney(item)}</span>
            ))}
          </div>
        </div>
      </div>

      {!supplierDebts.isPending && !supplierDebts.isError ? (
        <div className="flex flex-col gap-1.5 border-b px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {t("supplierDebt")}
          </span>
          <div className="flex items-start justify-end rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
            {supplierDebts.debts.length > 0 ? (
              <div className="grid min-w-0 grid-cols-[auto_auto] gap-x-2 gap-y-0.5 font-semibold text-destructive tabular-nums">
                {supplierDebts.debts.map((item) => (
                  <Fragment key={item.currency}>
                    <span className="text-right">
                      {formatNumber(item.amount)}
                    </span>
                    <span>{item.currency}</span>
                  </Fragment>
                ))}
              </div>
            ) : (
              <span className="font-medium">{t("noSupplierDebt")}</span>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4">
        <Controller
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <Label>
                {t("paymentMethod")}
                <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PURCHASE_PAYMENT_METHODS.map((method) => {
                  const Icon = PURCHASE_PAYMENT_ICONS[method];
                  const active = field.value === method;

                  return (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={active}
                      className={
                        active
                          ? "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-primary bg-primary/10 px-2 py-2 text-xs font-medium text-primary transition-colors duration-150"
                          : "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-2 text-xs font-medium transition-colors duration-150 hover:bg-muted"
                      }
                      onClick={() => handleMethodChange(method, field.onChange)}
                    >
                      <Icon className="size-4" />
                      {tPurchase(`paymentMethods.${method}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        />

        {providers.length > 0 ? (
          <div className="animate-expand" key={method}>
            <Controller
              control={form.control}
              name="paymentProvider"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <Label>
                    {t(
                      method === "CARD"
                        ? "providerLabels.CARD"
                        : "providerLabels.TRANSFER",
                    )}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {providers.map((provider) => {
                      const active = field.value === provider;

                      return (
                        <button
                          key={provider}
                          type="button"
                          aria-pressed={active}
                          className={
                            active
                              ? "flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-primary bg-primary/10 px-2 py-2 text-xs font-medium text-primary transition-colors duration-150"
                              : "flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-2 py-2 text-xs font-medium transition-colors duration-150 hover:bg-muted"
                          }
                          onClick={() => field.onChange(provider)}
                        >
                          {tPurchase(`paymentProviders.${provider}`)}
                        </button>
                      );
                    })}
                  </div>
                  {fieldState.error ? (
                    <p role="alert" className="text-xs text-destructive">
                      {translateError(fieldState.error.message)}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {payments.fields.map((row, index) => {
            const own = usedCurrencies[index];
            const currencyChoices = currencyOptions.filter(
              (option) =>
                option.value === own || !usedCurrencies.includes(option.value),
            );

            return (
              <div
                key={row.id}
                className={index > 0 ? "animate-expand" : undefined}
              >
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <Controller
                      control={form.control}
                      name={`paidAmounts.${index}.amount`}
                      render={({ field, fieldState }) => (
                        <BaseInputAddon
                          id={`purchase-finish-paid-${index}`}
                          label={index === 0 ? t("paidAmount") : undefined}
                          placeholder="0"
                          numeric={{ decimals: 2 }}
                          suffixOptions={currencyChoices}
                          suffixValue={own}
                          value={field.value}
                          error={translateError(fieldState.error?.message)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          onSuffixChange={(value) =>
                            form.setValue(
                              `paidAmounts.${index}.currencyId`,
                              value,
                            )
                          }
                        />
                      )}
                    />
                  </div>
                  {payments.fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      aria-label={t("removePayment")}
                      title={t("removePayment")}
                      onClick={() => payments.remove(index)}
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
            className="w-fit gap-2"
            disabled={!freeCurrency}
            onClick={() =>
              freeCurrency &&
              payments.append(emptyPaymentRow(freeCurrency.value))
            }
          >
            <Plus />
            {t("addPayment")}
          </Button>
        </div>

        {debts.length > 0 ? (
          <div className="animate-expand">
            <div className="flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <span className="flex min-w-0 items-center gap-2">
                <TriangleAlert className="size-4 shrink-0" />
                {t("debtHint")}
              </span>
              <div className="flex shrink-0 flex-col items-end font-bold tabular-nums">
                {debts.map((item) => (
                  <span key={item.currencyId}>{formatMoney(item)}</span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <Controller
          control={form.control}
          name="note"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purchase-finish-note">{t("note")}</Label>
              <Textarea
                id="purchase-finish-note"
                rows={3}
                placeholder={t("notePlaceholder")}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
              />
            </div>
          )}
        />
      </div>

      {editing ? (
        <div className="border-t px-4 py-3">
          <Controller
            control={form.control}
            name="editReason"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="purchase-finish-edit-reason">
                  {t("editReason")}
                </Label>
                <Textarea
                  id="purchase-finish-edit-reason"
                  rows={2}
                  placeholder={t("editReasonPlaceholder")}
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                />
              </div>
            )}
          />
        </div>
      ) : null}

      <DialogFooter className="m-0 border-t px-4 py-3">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={pending}
          onClick={onClose}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" className="h-10 gap-2" disabled={pending}>
          <Check />
          {pending ? t("saving") : t("confirm")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PurchaseFinishDialog({
  open,
  pending,
  onClose,
  ...rest
}: PurchaseFinishDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onClose();
      }}
    >
      <DialogContent className="max-h-[min(42rem,calc(100dvh-2rem))] grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-md">
        {open ? (
          <PurchaseFinishForm {...rest} pending={pending} onClose={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
