"use client";

import { Hash } from "lucide-react";
// import { Barcode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, type ReactNode } from "react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";

import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseInputBarcodes } from "@/component/base/input/BaseInputBarcodes";
import { BaseInputFile } from "@/component/base/input/BaseInputFile";
import { BaseSelect } from "@/component/base/select/BaseSelect";
import { Checkbox } from "@/component/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  PRICE_CURRENCY_KEYS,
  PRICE_PERCENT_KEYS,
  PRODUCT_CREATE_IMAGE_ACCEPT,
} from "@/constants/product/product.constants";
import { getFileUrl } from "@/utils/menu";
import { generateArticle } from "@/utils/product-code";
// import { generateBarcode, isGeneratedBarcode } from "@/utils/product-code";
import { useUploadFileMutation } from "@/rest/query/file/file.query";
import type { SelectOption } from "@/types/common.types";
import type {
  CurrencyKey,
  PriceKey,
  ProductCreateFormValues,
  ProductVariantFormValues,
} from "@/types/product.types";
import {
  parseNumber,
  percentFromPrice,
  priceFromPercent,
} from "@/utils/product-create";

type ProductCreateVariantProps = {
  form: UseFormReturn<
    ProductCreateFormValues,
    unknown,
    ProductCreateFormValues
  >;
  rowIndex: number;
  variantIndex: number;
  showName: boolean;
  currencyOptions: SelectOption[];
  currencyRates: Record<string, number>;
  defaultCurrencyId: string;
  stockOptions?: SelectOption[];
  shelfOptions?: SelectOption[];
  leading?: ReactNode;
};

export function ProductCreateVariant({
  form,
  rowIndex,
  variantIndex,
  showName,
  currencyOptions,
  currencyRates,
  defaultCurrencyId,
  stockOptions,
  shelfOptions,
  leading,
}: ProductCreateVariantProps) {
  const t = useTranslations("productCreate");
  const tEdit = useTranslations("productEdit");
  const tValidation = useTranslations();
  const upload = useUploadFileMutation();

  const base = `rows.${rowIndex}.variants.${variantIndex}` as const;
  const fileId = useWatch({ control: form.control, name: `${base}.fileId` });
  const previewUrl = fileId ? getFileUrl(fileId) : undefined;
  const idPrefix = `product-${rowIndex}-${variantIndex}`;

  const translateError = (message?: string) =>
    message
      ? tValidation(message as Parameters<typeof tValidation>[0])
      : undefined;

  const setField = <K extends keyof ProductVariantFormValues>(
    key: K,
    value: ProductVariantFormValues[K],
  ) => {
    form.setValue(`${base}.${key}` as never, value as never, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
  };

  const getField = <K extends keyof ProductVariantFormValues>(key: K) =>
    form.getValues(
      `${base}.${key}` as never,
    ) as unknown as ProductVariantFormValues[K];

  const isRounded = () => form.getValues("roundPrices");

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
        isRounded(),
        rateOf("purchaseCurrencyId"),
        rateOf(PRICE_CURRENCY_KEYS[priceKey]),
      ),
    );
  };

  const priceDriven = useRef(new Set<PriceKey>());

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
    (["wholesalePrice", "retailPrice"] as const).forEach((priceKey) => {
      if (
        priceDriven.current.has(priceKey) ||
        getField(PRICE_PERCENT_KEYS[priceKey]).trim() === ""
      ) {
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
    recalculatePrice(key === "wholesaleCurrencyId" ? "wholesalePrice" : "retailPrice");
  };

  const handleUpload = (file: File) => {
    upload.mutate(file, {
      onSuccess: (uploaded) => {
        setField("fileId", uploaded.id);
        setField("fileName", file.name);
      },
    });
  };

  const renderCurrency = (key: CurrencyKey) => {
    const value = form.watch(`${base}.${key}` as never) as unknown as string;

    return {
      suffixOptions: currencyOptions,
      suffixValue: value || defaultCurrencyId,
      onSuffixChange: (next: string) => handleCurrencyChange(key, next),
    };
  };

  const renderNumber = (
    key: "limit" | "boxQuantity",
    label: string,
    placeholder = "0",
  ) => (
    <Controller
      control={form.control}
      name={`${base}.${key}` as never}
      render={({ field, fieldState }) => (
        <BaseInputAddon
          id={`${idPrefix}-${key}`}
          label={label}
          placeholder={placeholder}
          numeric={{ decimals: 2 }}
          value={String(field.value ?? "")}
          error={translateError(fieldState.error?.message)}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );

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
                if (parseNumber(getField("purchasePrice")) > 0) {
                  priceDriven.current.delete(priceKey);
                } else {
                  priceDriven.current.add(priceKey);
                }
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
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-xs text-muted-foreground">
            {t("costPlus")}
          </span>
          <div className="min-w-0 flex-1">
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
                    priceDriven.current.delete(priceKey);
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

  const extended = Boolean(stockOptions && shelfOptions);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-3 sm:grid-cols-2 lg:grid-cols-4",
        showName ? "gap-y-2" : "gap-y-1",
        extended
          ? showName
            ? "2xl:grid-cols-[minmax(0,2fr)_minmax(0,.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.65fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.65fr)]"
            : "2xl:grid-cols-[minmax(0,2fr)_minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.65fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.65fr)]"
          : showName
            ? "xl:grid-cols-[minmax(0,2fr)_minmax(0,.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,.65fr)]"
            : "xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,.65fr)]",
      )}
    >
      {leading}

      {showName ? (
        <div className="sm:col-span-2 xl:col-span-1">
          <Controller
            control={form.control}
            name={`${base}.name` as never}
            render={({ field, fieldState }) => (
              <BaseInputAddon
                id={`${idPrefix}-name`}
                label={t("variantName")}
                required
                placeholder={t("variantNamePlaceholder")}
                value={String(field.value ?? "")}
                error={translateError(fieldState.error?.message)}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
      ) : null}

      {renderNumber("limit", t("limit"))}
      {renderNumber("boxQuantity", t("boxQuantity"))}

      <div className="flex min-w-0 flex-col gap-1">
        <Controller
          control={form.control}
          name={`${base}.purchasePrice` as never}
          render={({ field, fieldState }) => (
            <BaseInputAddon
              id={`${idPrefix}-purchasePrice`}
              label={t("cost")}
              placeholder="0"
              numeric={{ decimals: 2 }}
              {...renderCurrency("purchaseCurrencyId")}
              value={String(field.value ?? "")}
              error={translateError(fieldState.error?.message)}
              onChange={(value) => {
                field.onChange(value);
                recalculate(value);
              }}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={form.control}
          name={`${base}.allowBelowCost` as never}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={!field.value}
                onCheckedChange={(checked) => field.onChange(!checked)}
              />
              <span>{t("belowCost")}</span>
            </label>
          )}
        />
      </div>

      {renderPrice("wholesalePrice", t("wholesale"), false)}
      {renderPrice("retailPrice", t("retail"), true)}

      <Controller
        control={form.control}
        name={`${base}.barcodes` as never}
        render={({ field }) => {
          const codes = (field.value ?? []) as string[];

          return (
            <BaseInputBarcodes
              id={`${idPrefix}-barcode`}
              label={t("barcode")}
              values={codes}
              placeholder={t("barcodePlaceholder")}
              countLabel={t("barcodesCount", { count: codes.length })}
              inputPlaceholder={t("barcodeScanMore")}
              removeLabel={t("removeBarcode")}
              // actionIcon={<Barcode />}
              // actionLabel={t("generate")}
              // actionDisabled={codes.some(isGeneratedBarcode)}
              // onAction={() => field.onChange([...codes, generateBarcode()])}
              onAdd={(code) => field.onChange([...codes, code])}
              onRemove={(index) =>
                field.onChange(codes.filter((_, position) => position !== index))
              }
            />
          );
        }}
      />

      <Controller
        control={form.control}
        name={`${base}.article` as never}
        render={({ field, fieldState }) => (
          <BaseInputAddon
            id={`${idPrefix}-article`}
            label={t("article")}
            placeholder={t("articlePlaceholder")}
            actionIcon={<Hash />}
            actionLabel={t("generate")}
            value={String(field.value ?? "")}
            error={translateError(fieldState.error?.message)}
            onChange={field.onChange}
            onBlur={field.onBlur}
            onAction={() => setField("article", generateArticle())}
          />
        )}
      />

      {stockOptions && shelfOptions ? (
        <>
          <Controller
            control={form.control}
            name={`${base}.stockId` as never}
            render={({ field }) => (
              <BaseSelect
                id={`${idPrefix}-stock`}
                label={tEdit("stock")}
                labelClassName="text-foreground"
                triggerClassName="data-[size=default]:h-9 py-1 px-2.5"
                value={String(field.value ?? "")}
                options={stockOptions}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name={`${base}.shelfId` as never}
            render={({ field }) => (
              <BaseSelect
                id={`${idPrefix}-shelf`}
                label={tEdit("shelf")}
                labelClassName="text-foreground"
                triggerClassName="data-[size=default]:h-9 py-1 px-2.5"
                value={String(field.value ?? "")}
                options={shelfOptions}
                onChange={field.onChange}
              />
            )}
          />
        </>
      ) : null}

      <Controller
        control={form.control}
        name={`${base}.fileName` as never}
        render={({ field }) => (
          <BaseInputFile
            id={`${idPrefix}-image`}
            label={t("image")}
            placeholder={t("imagePlaceholder")}
            accept={PRODUCT_CREATE_IMAGE_ACCEPT}
            previewUrl={previewUrl}
            loading={upload.isPending}
            fileName={
              upload.isPending ? t("imageUploading") : String(field.value ?? "")
            }
            clearLabel={t("removeImage")}
            onSelect={handleUpload}
            onClear={() => {
              setField("fileId", null);
              setField("fileName", "");
            }}
          />
        )}
      />
    </div>
  );
}
