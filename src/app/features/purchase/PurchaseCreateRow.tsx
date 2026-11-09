"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseSelect } from "@/component/base/select/BaseSelect";
import {
  PRICE_CURRENCY_KEYS,
  PRICE_PERCENT_KEYS,
} from "@/constants/product/product.constants";
import { PurchaseProductField } from "@/features/purchase/PurchaseProductField";
import type { SelectOption } from "@/types/common.types";
import type { CurrencyKey, PriceKey } from "@/types/product.types";
import type {
  PurchaseCreateFormValues,
  PurchaseItemFormValues,
  PurchaseProductOption,
} from "@/types/purchase.types";
import {
  parseNumber,
  percentFromPrice,
  priceFromPercent,
} from "@/utils/product-create";
import { applyProductToItem } from "@/utils/purchase";

type PurchaseCreateRowProps = {
  form: UseFormReturn<
    PurchaseCreateFormValues,
    unknown,
    PurchaseCreateFormValues
  >;
  index: number;
  currencyOptions: SelectOption[];
  currencyRates: Record<string, number>;
  defaultCurrencyId: string;
  stockOptions: SelectOption[];
  shelfOptions: SelectOption[];
  supplierOptions: SelectOption[];
  canRemove: boolean;
  corner?: ReactNode;
  onSupplierChange: (value: string) => void;
  onRemove: () => void;
};

const PRICE_KEYS: PriceKey[] = ["wholesalePrice", "retailPrice"];

export function PurchaseCreateRow({
  form,
  index,
  currencyOptions,
  currencyRates,
  defaultCurrencyId,
  stockOptions,
  shelfOptions,
  supplierOptions,
  canRemove,
  corner,
  onSupplierChange,
  onRemove,
}: PurchaseCreateRowProps) {
  const t = useTranslations("purchase.create");
  const tAll = useTranslations();

  const base = `items.${index}` as const;
  const idPrefix = `purchase-${index}`;

  const translateError = (message?: string) =>
    message ? tAll(message as Parameters<typeof tAll>[0]) : undefined;

  const setField = <K extends keyof PurchaseItemFormValues>(
    key: K,
    value: PurchaseItemFormValues[K],
  ) => {
    form.setValue(`${base}.${key}` as never, value as never, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
  };

  const getField = <K extends keyof PurchaseItemFormValues>(key: K) =>
    form.getValues(
      `${base}.${key}` as never,
    ) as unknown as PurchaseItemFormValues[K];

  const rateOf = (key: CurrencyKey) =>
    currencyRates[getField(key) || defaultCurrencyId] ?? 1;

  const recalculatePrice = (
    priceKey: PriceKey,
    percent = getField(PRICE_PERCENT_KEYS[priceKey]),
    cost = getField("purchasePrice"),
  ) => {
    if (percent.trim() === "") return;

    setField(
      priceKey,
      priceFromPercent(
        cost,
        percent,
        false,
        rateOf("purchaseCurrencyId"),
        rateOf(PRICE_CURRENCY_KEYS[priceKey]),
      ),
    );
  };

  const recalculatePercent = (priceKey: PriceKey, cost: string) => {
    setField(
      PRICE_PERCENT_KEYS[priceKey],
      percentFromPrice(
        cost,
        getField(priceKey),
        rateOf("purchaseCurrencyId"),
        rateOf(PRICE_CURRENCY_KEYS[priceKey]),
      ),
    );
  };

  const recalculate = (cost: string) => {
    PRICE_KEYS.forEach((priceKey) => {
      if (getField(PRICE_PERCENT_KEYS[priceKey]).trim() === "") {
        if (getField(priceKey).trim() !== "")
          recalculatePercent(priceKey, cost);
        return;
      }
      recalculatePrice(priceKey, undefined, cost);
    });
  };

  const handleCurrencyChange = (key: CurrencyKey, next: string) => {
    setField(key, next);

    if (key === "purchaseCurrencyId") {
      recalculate(getField("purchasePrice"));
      return;
    }

    const priceKey: PriceKey =
      key === "wholesaleCurrencyId" ? "wholesalePrice" : "retailPrice";
    if (getField(PRICE_PERCENT_KEYS[priceKey]).trim() === "") {
      recalculatePercent(priceKey, getField("purchasePrice"));
      return;
    }
    recalculatePrice(priceKey);
  };

  const renderCurrency = (key: CurrencyKey) => ({
    suffixOptions: currencyOptions,
    suffixValue:
      (form.watch(`${base}.${key}` as never) as unknown as string) ||
      defaultCurrencyId,
    onSuffixChange: (next: string) => handleCurrencyChange(key, next),
  });

  const handleProductText = (text: string) => {
    setField("productName", text);
    setField("productId", null);
    setField("variantId", null);
  };

  const handleProductSelect = (option: PurchaseProductOption) => {
    const next = applyProductToItem(form.getValues(base), option);

    (Object.keys(next) as (keyof PurchaseItemFormValues)[]).forEach((key) =>
      setField(key, next[key] as never),
    );

    PRICE_KEYS.forEach((priceKey) => {
      if (
        getField(PRICE_PERCENT_KEYS[priceKey]).trim() === "" &&
        getField(priceKey).trim() !== ""
      ) {
        recalculatePercent(priceKey, getField("purchasePrice"));
      }
    });
  };

  const renderPrice = (
    priceKey: PriceKey,
    label: string,
    required: boolean,
  ) => {
    const percentKey = PRICE_PERCENT_KEYS[priceKey];
    const currencyKey = PRICE_CURRENCY_KEYS[priceKey];
    const percentState = form.getFieldState(
      `${base}.${percentKey}` as never,
      form.formState,
    );
    const percentError = translateError(
      (percentState.error as { message?: string } | undefined)?.message,
    );

    return (
      <div className="flex min-w-0 flex-col gap-1">
        <Controller
          control={form.control}
          name={`${base}.${priceKey}` as never}
          render={({ field, fieldState }) => (
            <BaseInputAddon
              id={`${idPrefix}-${priceKey}`}
              label={label}
              required={required}
              placeholder="0"
              numeric={{ decimals: 2 }}
              {...renderCurrency(currencyKey)}
              value={String(field.value ?? "")}
              error={translateError(fieldState.error?.message)}
              onChange={(value) => {
                field.onChange(value);
                setField(
                  percentKey,
                  percentFromPrice(
                    getField("purchasePrice"),
                    value,
                    rateOf("purchaseCurrencyId"),
                    rateOf(currencyKey),
                  ),
                );
              }}
              onBlur={field.onBlur}
            />
          )}
        />
        <div className="flex items-center justify-between gap-1.5">
          <span className="shrink-0 text-xs text-muted-foreground">
            {t("costPlus")}
          </span>
          <div className="w-24 shrink-0">
            <Controller
              control={form.control}
              name={`${base}.${percentKey}` as never}
              render={({ field, fieldState }) => (
                <BaseInputAddon
                  id={`${idPrefix}-${percentKey}`}
                  placeholder="0"
                  numeric={{ decimals: 2, allowNegative: true }}
                  suffix="%"
                  compact
                  invalid={Boolean(fieldState.error)}
                  value={String(field.value ?? "")}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value.trim() === "") {
                      if (parseNumber(getField("purchasePrice")) > 0) {
                        setField(priceKey, "0");
                      }
                      return;
                    }
                    recalculatePrice(priceKey, value);
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </div>
        {percentError ? (
          <p role="alert" className="text-xs text-destructive">
            {percentError}
          </p>
        ) : null}
      </div>
    );
  };

  const renderSelect = (
    key: "stockId" | "shelfId",
    label: string,
    options: SelectOption[],
    required: boolean,
  ) => (
    <Controller
      control={form.control}
      name={`${base}.${key}` as never}
      render={({ field, fieldState }) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <BaseSelect
            id={`${idPrefix}-${key}`}
            label={label}
            required={required}
            labelClassName="text-foreground"
            triggerClassName="data-[size=default]:h-9 py-1 px-2.5"
            placeholder={t("selectPlaceholder")}
            value={String(field.value ?? "")}
            options={options}
            onChange={field.onChange}
          />
          {fieldState.error ? (
            <p role="alert" className="text-xs text-destructive">
              {translateError(fieldState.error.message)}
            </p>
          ) : null}
        </div>
      )}
    />
  );

  return (
    <section className="relative flex flex-col gap-1 rounded-lg border bg-card px-2.5 py-1.5 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {index + 1}
        </span>
        {canRemove ? (
          <BaseButtonDelete
            label={t("removeRow")}
            className="size-6"
            onClick={onRemove}
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(0,3.3fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.7fr)_minmax(0,1.7fr)_minmax(0,1.2fr)]">
        <div className="sm:col-span-2 lg:col-span-4 xl:col-span-1">
          <Controller
            control={form.control}
            name={`${base}.productName`}
            render={({ field, fieldState }) => (
              <PurchaseProductField
                id={`${idPrefix}-product`}
                value={field.value}
                error={translateError(fieldState.error?.message)}
                onTextChange={handleProductText}
                onProductSelect={handleProductSelect}
              />
            )}
          />
        </div>

        <Controller
          control={form.control}
          name={`${base}.quantity`}
          render={({ field, fieldState }) => (
            <BaseInputAddon
              id={`${idPrefix}-quantity`}
              label={t("quantity")}
              required
              placeholder="0"
              numeric={{ decimals: 2 }}
              value={field.value}
              error={translateError(fieldState.error?.message)}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          control={form.control}
          name={`${base}.purchasePrice`}
          render={({ field, fieldState }) => (
            <BaseInputAddon
              id={`${idPrefix}-purchasePrice`}
              label={t("cost")}
              required
              placeholder="0"
              numeric={{ decimals: 2 }}
              {...renderCurrency("purchaseCurrencyId")}
              value={field.value}
              error={translateError(fieldState.error?.message)}
              onChange={(value) => {
                field.onChange(value);
                recalculate(value);
              }}
              onBlur={field.onBlur}
            />
          )}
        />

        {renderPrice("wholesalePrice", t("wholesale"), false)}
        {renderPrice("retailPrice", t("retail"), true)}
        <Controller
          control={form.control}
          name={`${base}.supplierId`}
          render={({ field, fieldState }) => (
            <div className="flex min-w-0 flex-col gap-1.5">
              <BaseSelect
                id={`${idPrefix}-supplierId`}
                label={t("supplier")}
                required
                disabled={index > 0}
                labelClassName="text-foreground"
                triggerClassName="data-[size=default]:h-9 py-1 px-2.5"
                placeholder={t("supplierPlaceholder")}
                value={field.value}
                options={supplierOptions}
                onChange={onSupplierChange}
              />
              {fieldState.error ? (
                <p role="alert" className="text-xs text-destructive">
                  {translateError(fieldState.error.message)}
                </p>
              ) : null}
            </div>
          )}
        />
        {renderSelect("stockId", t("stock"), stockOptions, true)}
        {renderSelect("shelfId", t("shelf"), shelfOptions, false)}
      </div>

      {corner ? (
        <div className="absolute -right-4 -bottom-4 z-10">{corner}</div>
      ) : null}
    </section>
  );
}
