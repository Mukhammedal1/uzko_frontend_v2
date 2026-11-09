"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { BaseInputAutocomplete } from "@/component/base/input/BaseInputAutocomplete";
import { useDebouncedValue } from "@/composable/useDebouncedValue";
import { PURCHASE_PRODUCT_SEARCH_DEBOUNCE_MS } from "@/constants/purchase/purchase.constants";
import { usePurchaseProductSearchQuery } from "@/rest/query/purchase/purchase.query";
import type { PurchaseProductOption } from "@/types/purchase.types";

type PurchaseProductFieldProps = {
  id: string;
  value: string;
  error?: string;
  onTextChange: (value: string) => void;
  onProductSelect: (option: PurchaseProductOption) => void;
};

export function PurchaseProductField({
  id,
  value,
  error,
  onTextChange,
  onProductSelect,
}: PurchaseProductFieldProps) {
  const t = useTranslations("purchase.create");
  const [open, setOpen] = useState(false);

  const search = useDebouncedValue(
    value.trim(),
    PURCHASE_PRODUCT_SEARCH_DEBOUNCE_MS,
  );
  const { options, isFetching } = usePurchaseProductSearchQuery(search, open);

  const items = useMemo(
    () =>
      options.map((option) => ({
        value: option.key,
        label: option.label,
        description: option.article || undefined,
      })),
    [options],
  );

  return (
    <BaseInputAutocomplete
      id={id}
      label={t("product")}
      required
      placeholder={t("productPlaceholder")}
      value={value}
      options={items}
      loading={isFetching}
      loadingLabel={t("productLoading")}
      emptyLabel={t("productEmpty")}
      error={error}
      onChange={onTextChange}
      onOpenChange={setOpen}
      onSelect={(key) => {
        const option = options.find((item) => item.key === key);
        if (option) onProductSelect(option);
      }}
    />
  );
}
