"use client";

import { Barcode, Hash } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";

import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseInputFile } from "@/component/base/input/BaseInputFile";
import { Checkbox } from "@/component/ui/checkbox";
import { cn } from "@/lib/utils";
import { PRODUCT_CREATE_IMAGE_ACCEPT } from "@/constants/product/product.constants";
import { getFileUrl } from "@/utils/menu";
import { useUploadFileMutation } from "@/rest/query/file/file.query";
import type {
  ProductCreateFormValues,
  ProductVariantFormValues,
} from "@/types/product.types";
import {
  generateArticle,
  generateBarcode,
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
  currencyCode: string;
  leading?: ReactNode;
};

export function ProductCreateVariant({
  form,
  rowIndex,
  variantIndex,
  showName,
  currencyCode,
  leading,
}: ProductCreateVariantProps) {
  const t = useTranslations("productCreate");
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

  const recalculate = (cost: string) => {
    const wholesalePercent = getField("wholesalePercent");
    const retailPercent = getField("retailPercent");

    if (wholesalePercent.trim() !== "") {
      setField(
        "wholesalePrice",
        priceFromPercent(cost, wholesalePercent, isRounded()),
      );
    }
    if (retailPercent.trim() !== "") {
      setField(
        "retailPrice",
        priceFromPercent(cost, retailPercent, isRounded()),
      );
    }
  };

  const handleUpload = (file: File) => {
    upload.mutate(file, {
      onSuccess: (uploaded) => {
        setField("fileId", uploaded.id);
        setField("fileName", file.name);
      },
    });
  };

  const renderNumber = (key: "limit" | "boxQuantity", label: string) => (
    <Controller
      control={form.control}
      name={`${base}.${key}` as never}
      render={({ field, fieldState }) => (
        <BaseInputAddon
          id={`${idPrefix}-${key}`}
          label={label}
          placeholder="0"
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
    priceKey: "wholesalePrice" | "retailPrice",
    percentKey: "wholesalePercent" | "retailPercent",
    label: string,
    required: boolean,
  ) => {
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
              suffix={currencyCode}
              value={String(field.value ?? "")}
              error={translateError(fieldState.error?.message)}
              onChange={(value) => {
                field.onChange(value);
                setField(
                  percentKey,
                  percentFromPrice(getField("purchasePrice"), value),
                );
              }}
              onBlur={field.onBlur}
            />
          )}
        />
        <div className="flex items-center gap-2">
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
                    setField(
                      priceKey,
                      priceFromPercent(
                        getField("purchasePrice"),
                        value,
                        isRounded(),
                      ),
                    );
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

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-4",
        showName
          ? "xl:grid-cols-[minmax(0,2fr)_minmax(0,.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,.8fr)]"
          : "xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,.8fr)]",
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
              required
              placeholder="0"
              numeric={{ decimals: 2 }}
              suffix={currencyCode}
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

      {renderPrice("wholesalePrice", "wholesalePercent", t("wholesale"), false)}
      {renderPrice("retailPrice", "retailPercent", t("retail"), true)}

      <Controller
        control={form.control}
        name={`${base}.barcode` as never}
        render={({ field, fieldState }) => (
          <BaseInputAddon
            id={`${idPrefix}-barcode`}
            label={t("barcode")}
            placeholder={t("barcodePlaceholder")}
            numeric={{ decimals: 0, grouping: false }}
            actionIcon={<Barcode />}
            actionLabel={t("generate")}
            value={String(field.value ?? "")}
            error={translateError(fieldState.error?.message)}
            onChange={field.onChange}
            onBlur={field.onBlur}
            onAction={() => setField("barcode", generateBarcode())}
          />
        )}
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
