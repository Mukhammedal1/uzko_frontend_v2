"use client";

import { ChevronRight, ImageOff, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useState } from "react";

import { BaseBadgeShelf } from "@/component/base/badge/BaseBadgeShelf";
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
import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseButtonEdit } from "@/component/base/button/BaseButtonEdit";
import { BaseImagePreview } from "@/component/base/image/BaseImagePreview";
import { Button } from "@/component/ui/button";
import { Checkbox } from "@/component/ui/checkbox";
import {
  PRODUCTS_ACTIONS_COLUMN_WIDTH,
  PRODUCTS_COLUMN_WEIGHTS,
  PRODUCTS_NAME_COLUMN_WEIGHT,
  PRODUCTS_SELECT_COLUMN_WIDTH,
  PRODUCTS_TABLE_COLUMN_KEYS,
} from "@/constants/product/product.constants";
import { ProductsColumnsMenu } from "@/features/product/ProductsColumnsMenu";
import { cn } from "@/lib/utils";
import type {
  ProductColumnKey,
  ProductColumnVisibility,
  ProductDeleteTarget,
  ProductRow,
  ProductVariantRow,
} from "@/types/product.types";
import { formatNumber, formatPercent } from "@/utils/format";
import {
  getProductSelectionKey,
  getVariantSelectionKey,
  isLowStock,
} from "@/utils/product";

type ProductsTableProps = {
  products: ProductRow[];
  selected: Set<string>;
  expanded: Set<number>;
  closing: Set<number>;
  columns: ProductColumnVisibility;
  onToggleProduct: (product: ProductRow) => void;
  onToggleVariant: (product: ProductRow, variantId: number) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleExpand: (id: number) => void;
  onColumnChange: (key: ProductColumnKey, checked: boolean) => void;
  onEdit: (productId: number, variantId?: number) => void;
  onDelete: (target: ProductDeleteTarget) => void;
};

const headCell =
  "sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap border-b bg-card px-2 py-3 text-left text-sm font-semibold uppercase tracking-wide text-muted-foreground";

const cell = "overflow-hidden px-2 py-2 text-center align-middle text-sm";

const fadeIn = "animate-in fade-in duration-200 motion-reduce:animate-none";

const rowEnter =
  "animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none";

const rowExit =
  "animate-out fade-out slide-out-to-top-1 fill-mode-forwards duration-150 motion-reduce:animate-none";

const lowBadge =
  "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] leading-4 font-normal text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300";

function Thumb({
  src,
  label,
  onPreview,
}: {
  src: string | null;
  label: string;
  onPreview: (src: string, label: string) => void;
}) {
  const box =
    "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground";

  if (!src) {
    return (
      <span className={box}>
        <ImageOff className="size-3.5" />
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        box,
        "cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onPreview(src, label);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
    </button>
  );
}

function Money({
  value,
  currency,
  percentage,
}: {
  value: number;
  currency: string;
  percentage?: number;
}) {
  return (
    <div className="flex flex-col items-center leading-tight tabular-nums">
      <span className="font-medium">
        {formatNumber(value)}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {currency}
        </span>
      </span>
      {percentage ? (
        <span
          className={cn(
            "text-sm",
            percentage > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          {formatPercent(percentage)}
        </span>
      ) : null}
    </div>
  );
}

const getBarcodes = (variant?: ProductVariantRow) =>
  variant ? variant.barcodes.filter(Boolean) : [];

const getBarcodeText = (variant?: ProductVariantRow) =>
  getBarcodes(variant)[0] ?? "";

const getBarcodeTitle = (variant?: ProductVariantRow) =>
  getBarcodes(variant).join(", ");

const dash = <span className="text-muted-foreground">—</span>;

export function ProductsTable({
  products,
  selected,
  expanded,
  closing,
  columns,
  onToggleProduct,
  onToggleVariant,
  onToggleAll,
  onToggleExpand,
  onColumnChange,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const t = useTranslations("product");
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(
    null,
  );
  const openPreview = (src: string, label: string) =>
    setPreview({ src, label });

  const visibleKeys = PRODUCTS_TABLE_COLUMN_KEYS.filter((key) => columns[key]);
  const weightSum =
    PRODUCTS_NAME_COLUMN_WEIGHT +
    visibleKeys.reduce((sum, key) => sum + PRODUCTS_COLUMN_WEIGHTS[key], 0);
  const flexibleWidth =
    100 - PRODUCTS_SELECT_COLUMN_WIDTH - PRODUCTS_ACTIONS_COLUMN_WIDTH;
  const toWidth = (weight: number) => `${(weight / weightSum) * flexibleWidth}%`;

  const productSelected = (product: ProductRow) =>
    selected.has(getProductSelectionKey(product.id));

  const allSelected = products.length > 0 && products.every(productSelected);
  const someSelected = !allSelected && products.some(productSelected);

  const renderVariantCell = (
    key: (typeof PRODUCTS_TABLE_COLUMN_KEYS)[number],
    variant: ProductVariantRow,
    unit: string,
    animation: string | undefined,
  ) => {
    const low = isLowStock(variant);
    const base = cn(cell, animation);

    switch (key) {
      case "limit":
        return (
          <BaseTableCell key={key} className={base}>
            <span
              className={cn(
                "inline-flex max-w-full items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] leading-4 font-medium",
                low
                  ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                  : "border-transparent bg-muted",
              )}
            >
              {formatNumber(variant.alertQuantity)} {unit}
            </span>
          </BaseTableCell>
        );
      case "cost":
        return (
          <BaseTableCell key={key} className={base}>
            <Money
              value={variant.purchasePrice}
              currency={variant.purchaseCurrency}
            />
          </BaseTableCell>
        );
      case "wholesale":
        return (
          <BaseTableCell key={key} className={base}>
            <Money
              value={variant.wholesalePrice}
              currency={variant.wholesaleCurrency}
              percentage={
                columns.margin ? variant.wholesalePercentage : undefined
              }
            />
          </BaseTableCell>
        );
      case "retail":
        return (
          <BaseTableCell key={key} className={base}>
            <Money
              value={variant.retailPrice}
              currency={variant.retailCurrency}
              percentage={columns.margin ? variant.retailPercentage : undefined}
            />
          </BaseTableCell>
        );
      case "article":
        return (
          <BaseTableCell key={key} className={cn(base, "whitespace-nowrap text-center")}>
            {variant.article || dash}
          </BaseTableCell>
        );
      case "quantity":
        return (
          <BaseTableCell
            key={key}
            className={cn(
              base,
              "text-center tabular-nums",
              low && "font-semibold text-destructive",
            )}
          >
            {formatNumber(variant.quantity)}
          </BaseTableCell>
        );
      case "unit":
        return (
          <BaseTableCell key={key} className={cn(base, "text-center")}>
            {unit || dash}
          </BaseTableCell>
        );
      case "shelf":
        return (
          <BaseTableCell key={key} className={cn(base, "text-center")}>
            <div className="flex items-center justify-center">
              {variant.shelf ? <BaseBadgeShelf label={variant.shelf} /> : dash}
            </div>
          </BaseTableCell>
        );
      case "stock":
        return (
          <BaseTableCell key={key} className={cn(base, "truncate text-center")}>
            {variant.stock || dash}
          </BaseTableCell>
        );
      case "supplier":
        return (
          <BaseTableCell key={key} className={cn(base, "truncate text-center")}>
            {variant.supplier || dash}
          </BaseTableCell>
        );
      default:
        return null;
    }
  };

  const renderVariantCells = (
    variant: ProductVariantRow,
    unit: string,
    animated: boolean,
  ) => {
    const animation = animated ? fadeIn : undefined;

    return (
      <>
        {visibleKeys.map((key) =>
          renderVariantCell(key, variant, unit, animation),
        )}
      </>
    );
  };

  const renderActions = (target: ProductDeleteTarget, productId: number) => (
    <BaseTableCell
      className={cell}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex justify-center gap-1.5">
        <BaseButtonEdit
          label={t("edit")}
          onClick={() =>
            onEdit(productId, target.kind === "variant" ? target.id : undefined)
          }
        />
        <BaseButtonDelete
          label={t("delete")}
          onClick={() => onDelete(target)}
        />
      </div>
    </BaseTableCell>
  );

  const renderFiller = () =>
    visibleKeys.length > 0 ? (
      <BaseTableCell className={cn(cell, fadeIn)} colSpan={visibleKeys.length} />
    ) : null;

  return (
    <>
    <BaseTableRoot className="w-full table-fixed border-collapse">
      <BaseTableColGroup>
        <BaseTableCol style={{ width: `${PRODUCTS_SELECT_COLUMN_WIDTH}%` }} />
        <BaseTableCol style={{ width: toWidth(PRODUCTS_NAME_COLUMN_WEIGHT) }} />
        {visibleKeys.map((key) => (
          <BaseTableCol key={key} style={{ width: toWidth(PRODUCTS_COLUMN_WEIGHTS[key]) }} />
        ))}
        <BaseTableCol style={{ width: `${PRODUCTS_ACTIONS_COLUMN_WIDTH}%` }} />
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
          <BaseTableHeadCell className={headCell}>{t("columns.product")}</BaseTableHeadCell>
          {visibleKeys.map((key) => {
            const label = t(`columns.${key}`);

            return (
              <BaseTableHeadCell
                key={key}
                title={label}
                className={cn(headCell, "text-center")}
              >
                {label}
              </BaseTableHeadCell>
            );
          })}
          <BaseTableHeadCell className={cn(headCell, "text-center")}>
            <span className="flex items-center justify-center gap-1">
              <span className="truncate">{t("columns.actions")}</span>
              <ProductsColumnsMenu
                columns={columns}
                onColumnChange={onColumnChange}
              />
            </span>
          </BaseTableHeadCell>
        </BaseTableRow>
      </BaseTableHead>
      <BaseTableBody>
        {products.map((product) => {
          const multi = product.variants.length > 1;
          const first = product.variants[0];
          const open = multi && expanded.has(product.id) && !closing.has(product.id);
          const showChildren = multi && expanded.has(product.id);
          const lowAny = product.variants.some(isLowStock);
          const collapsedName =
            first?.name && first.name !== product.name
              ? `${product.name} · ${first.name}`
              : product.name;
          const headerLabel = multi && !open ? collapsedName : product.name;
          const lowForRow = multi ? lowAny : first ? isLowStock(first) : false;

          return (
            <Fragment key={product.id}>
              <BaseTableRow
                onClick={multi ? () => onToggleExpand(product.id) : undefined}
                className={cn(
                  "h-14 cursor-pointer border-b transition-colors hover:bg-muted/50",
                  productSelected(product) && "bg-muted/60",
                  open && "bg-muted/30",
                )}
              >
                <BaseTableCell
                  className={cn(cell, "px-0 text-center")}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    className="mx-auto"
                    checked={productSelected(product)}
                    indeterminate={
                      !productSelected(product) &&
                      product.variants.some((variant) =>
                        selected.has(getVariantSelectionKey(variant.id)),
                      )
                    }
                    aria-label={t("selectRow")}
                    onCheckedChange={() => onToggleProduct(product)}
                  />
                </BaseTableCell>
                <BaseTableCell className={cell}>
                  <div className="flex min-w-0 items-center gap-2">
                    {columns.image ? (
                      <span
                        className={cn(
                          "shrink-0",
                          open && "hidden",
                        )}
                      >
                        <Thumb
                          src={first?.imageUrl ?? product.imageUrl}
                          label={product.name}
                          onPreview={openPreview}
                        />
                      </span>
                    ) : null}
                    <div className="flex min-w-0 flex-col text-left leading-tight">
                      <span className="flex h-5 min-w-0 items-center gap-1.5 text-base font-medium">
                        {multi ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="-ml-1 size-5 shrink-0"
                            aria-expanded={open}
                            aria-label={product.name}
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleExpand(product.id);
                            }}
                          >
                            <ChevronRight
                              className={cn(
                                "transition-transform duration-200 motion-reduce:transition-none",
                                open && "rotate-90",
                              )}
                            />
                          </Button>
                        ) : null}
                        <span className="truncate" title={headerLabel}>
                          {headerLabel}
                        </span>
                        {lowForRow ? (
                          <span className={lowBadge}>
                            <TriangleAlert className="size-2.5" />
                            {t("limitBadge")}
                          </span>
                        ) : null}
                      </span>
                      {multi ? (
                        <span className="truncate text-sm leading-4 text-muted-foreground">
                          {t("variantsCount", { count: product.variants.length })}
                        </span>
                      ) : columns.barcode && getBarcodeText(first) ? (
                        <span
                          className="truncate text-xs leading-4 text-muted-foreground"
                          title={getBarcodeTitle(first)}
                        >
                          {getBarcodeText(first)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </BaseTableCell>
                {multi && open ? (
                  renderFiller()
                ) : first ? (
                  <Fragment key={multi ? "collapsed" : "single"}>
                    {renderVariantCells(first, product.unit, multi)}
                  </Fragment>
                ) : (
                  renderFiller()
                )}
                {renderActions(
                  {
                    kind: "product",
                    id: product.id,
                    name: product.name,
                  },
                  product.id,
                )}
              </BaseTableRow>

              {showChildren
                ? product.variants.map((variant) => {
                    const variantKey = getVariantSelectionKey(variant.id);
                    const low = isLowStock(variant);

                    return (
                      <BaseTableRow
                        key={variant.id}
                        className={cn(
                          "h-14 cursor-pointer border-b bg-variant-row transition-colors hover:bg-muted/50",
                          closing.has(product.id) ? rowExit : rowEnter,
                          selected.has(variantKey) && "bg-muted/60",
                        )}
                      >
                        <BaseTableCell
                          className={cn(cell, "px-0 text-center")}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            className="mx-auto"
                            checked={selected.has(variantKey)}
                            aria-label={t("selectRow")}
                            onCheckedChange={() =>
                              onToggleVariant(product, variant.id)
                            }
                          />
                        </BaseTableCell>
                        <BaseTableCell className={cell}>
                          <div className="flex min-w-0 items-center gap-2 pl-4">
                            {columns.image ? (
                              <Thumb
                                src={variant.imageUrl}
                                label={variant.name || product.name}
                                onPreview={openPreview}
                              />
                            ) : null}
                            <div className="flex min-w-0 flex-col text-left leading-tight">
                              <span className="flex min-w-0 items-center gap-2 text-base font-medium">
                                <span
                                  className="truncate"
                                  title={variant.name || product.name}
                                >
                                  {variant.name || product.name}
                                </span>
                                {low ? (
                                  <span className={lowBadge}>
                                    <TriangleAlert className="size-2.5" />
                                    {t("limitBadge")}
                                  </span>
                                ) : null}
                              </span>
                              {columns.barcode && getBarcodeText(variant) ? (
                                <span
                                  className="truncate text-xs leading-4 text-muted-foreground"
                                  title={getBarcodeTitle(variant)}
                                >
                                  {getBarcodeText(variant)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </BaseTableCell>
                        {renderVariantCells(variant, product.unit, false)}
                        {renderActions(
                          {
                            kind: "variant",
                            id: variant.id,
                            name: variant.name || product.name,
                          },
                          product.id,
                        )}
                      </BaseTableRow>
                    );
                  })
                : null}
            </Fragment>
          );
        })}
      </BaseTableBody>
    </BaseTableRoot>
      <BaseImagePreview
        open={preview !== null}
        src={preview?.src ?? null}
        title={preview?.label ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
