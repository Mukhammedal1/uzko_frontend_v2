"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "react-toastify";

import { Button } from "@/component/ui/button";
import {
  PRODUCT_BULK_EDIT_QUERY,
  PRODUCTS_LIST_PATH,
} from "@/constants/product/product.constants";
import { ProductBulkEditRow } from "@/features/product/ProductBulkEditRow";
import { useZodForm } from "@/plugins/react-hook-form";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import {
  useProductDetailsQuery,
  useUpdateProductsMutation,
} from "@/rest/query/product/product.query";
import { useShelfNumbersQuery } from "@/rest/query/shelf-number/shelf-number.query";
import { useStocksQuery } from "@/rest/query/stock/stock.query";
import { useUnitsQuery } from "@/rest/query/unit/unit.query";
import type {
  ProductBulkTarget,
  ProductCreateFormValues,
  ProductRowFormValues,
} from "@/types/product.types";
import { parseBulkEditQuery } from "@/utils/product";
import {
  buildProductEditSubmit,
  normalizeProductForEdit,
} from "@/utils/product-edit";
import { productCreateSchema } from "@/validate/product/create.zod";

type ProductBulkEditFormProps = {
  targets: ProductBulkTarget[];
  initialRows: ProductRowFormValues[];
};

function ProductBulkEditShell({
  submitting,
  canSubmit,
  children,
  onSubmit,
}: {
  submitting: boolean;
  canSubmit: boolean;
  children: ReactNode;
  onSubmit?: () => void;
}) {
  const t = useTranslations("productEdit");
  const tCreate = useTranslations("productCreate");
  const router = useRouter();

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col p-3 sm:px-5"
      onSubmit={onSubmit}
    >
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-base font-semibold">{t("bulkTitle")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("bulkDescription")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={() => router.push(PRODUCTS_LIST_PATH)}
            >
              <ArrowLeft />
              {tCreate("back")}
            </Button>
            <Button
              type="submit"
              className="h-10 gap-2"
              disabled={submitting || !canSubmit}
            >
              <Check />
              {submitting ? tCreate("saving") : tCreate("save")}
            </Button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-6">
          {children}
        </div>
      </section>
    </form>
  );
}

function ProductBulkEditForm({ targets, initialRows }: ProductBulkEditFormProps) {
  const tCreate = useTranslations("productCreate");
  const router = useRouter();

  const { options: unitOptions } = useUnitsQuery();
  const { options: stockOptions } = useStocksQuery();
  const { options: shelfOptions } = useShelfNumbersQuery();
  const { mainCurrency, currencyOptions, currencyRates } =
    useMainCurrencyQuery();
  const updateProducts = useUpdateProductsMutation();

  const [rows] = useState(initialRows);

  const form = useZodForm(productCreateSchema, {
    defaultValues: { roundPrices: false, rows },
  });

  const { dirtyFields } = form.formState;
  const defaultCurrencyId = mainCurrency ? String(mainCurrency.id) : "";

  const handleSubmit = form.handleSubmit((values: ProductCreateFormValues) => {
    if (!mainCurrency) {
      toast.error(tCreate("noCurrency"), { toastId: "product-edit-currency" });
      return;
    }

    const submits = values.rows
      .map((row, index) =>
        buildProductEditSubmit(
          targets[index].productId,
          row,
          dirtyFields.rows?.[index],
          mainCurrency.id,
        ),
      )
      .filter(
        (submit) =>
          submit.product || submit.updates.length || submit.creates.length,
      );

    if (submits.length === 0) {
      router.push(PRODUCTS_LIST_PATH);
      return;
    }

    updateProducts.mutate(submits, {
      onSuccess: () => router.push(PRODUCTS_LIST_PATH),
    });
  });

  return (
    <ProductBulkEditShell
      submitting={updateProducts.isPending}
      canSubmit
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        {rows.map((row, rowIndex) => {
          const { productId, variantIds } = targets[rowIndex];

          return (
            <ProductBulkEditRow
              key={productId}
              form={form}
              rowIndex={rowIndex}
              variantIds={variantIds}
              unitOptions={unitOptions}
              currencyOptions={currencyOptions}
              currencyRates={currencyRates}
              defaultCurrencyId={defaultCurrencyId}
              stockOptions={stockOptions}
              shelfOptions={shelfOptions}
            />
          );
        })}
      </div>
    </ProductBulkEditShell>
  );
}

export function ProductBulkEdit() {
  const t = useTranslations("productEdit");
  const router = useRouter();

  const queryValue = router.query[PRODUCT_BULK_EDIT_QUERY];
  const targets = useMemo(() => parseBulkEditQuery(queryValue), [queryValue]);
  const targetsKey = targets
    .map((target) => `${target.productId}:${target.variantIds.join(".")}`)
    .join(",");

  const details = useProductDetailsQuery(
    useMemo(() => targets.map((target) => target.productId), [targets]),
  );

  const initialRows = useMemo(
    () =>
      targets.length > 0 && !details.isPending && !details.isError
        ? details.data.map((raw) => normalizeProductForEdit(raw))
        : null,
    [targets.length, details.isPending, details.isError, details.data],
  );

  if (!router.isReady || !initialRows) {
    const missing = router.isReady && (targets.length === 0 || details.isError);

    return (
      <ProductBulkEditShell submitting={false} canSubmit={false}>
        <p className="text-sm text-muted-foreground">
          {missing ? t("notFound") : t("loading")}
        </p>
      </ProductBulkEditShell>
    );
  }

  return (
    <ProductBulkEditForm
      key={targetsKey}
      targets={targets}
      initialRows={initialRows}
    />
  );
}
