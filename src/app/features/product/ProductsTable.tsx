"use client";

import { ChevronRight, ImageOff, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseButtonEdit } from "@/component/base/button/BaseButtonEdit";
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
  onToggleSelect: (key: string) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleExpand: (id: number) => void;
  onColumnChange: (key: ProductColumnKey, checked: boolean) => void;
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
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-sm font-normal text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300";

function Thumb({ src }: { src: string | null }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <ImageOff className="size-3.5" />
      )}
    </span>
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

const getBarcodeText = (variant?: ProductVariantRow) =>
  variant ? variant.barcodes.filter(Boolean).join(", ") : "";

const dash = <span className="text-muted-foreground">—</span>;

export function ProductsTable({
  products,
  selected,
  expanded,
  closing,
  columns,
  onToggleSelect,
  onToggleAll,
  onToggleExpand,
  onColumnChange,
  onDelete,
}: ProductsTableProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");

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
          <td key={key} className={base}>
            <span
              className={cn(
                "inline-flex max-w-full whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium",
                low
                  ? "border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                  : "bg-muted",
              )}
            >
              {formatNumber(variant.alertQuantity)} {unit}
            </span>
          </td>
        );
      case "cost":
        return (
          <td key={key} className={base}>
            <Money
              value={variant.purchasePrice}
              currency={variant.purchaseCurrency}
            />
          </td>
        );
      case "wholesale":
        return (
          <td key={key} className={base}>
            <Money
              value={variant.wholesalePrice}
              currency={variant.wholesaleCurrency}
              percentage={
                columns.margin ? variant.wholesalePercentage : undefined
              }
            />
          </td>
        );
      case "retail":
        return (
          <td key={key} className={base}>
            <Money
              value={variant.retailPrice}
              currency={variant.retailCurrency}
              percentage={columns.margin ? variant.retailPercentage : undefined}
            />
          </td>
        );
      case "article":
        return (
          <td key={key} className={cn(base, "whitespace-nowrap text-center")}>
            {variant.article ? `#${variant.article.replace(/^#/, "")}` : dash}
          </td>
        );
      case "quantity":
        return (
          <td
            key={key}
            className={cn(
              base,
              "text-center tabular-nums",
              low && "font-semibold text-destructive",
            )}
          >
            {formatNumber(variant.quantity)}
          </td>
        );
      case "unit":
        return (
          <td key={key} className={cn(base, "text-center")}>
            {unit || dash}
          </td>
        );
      case "shelf":
        return (
          <td key={key} className={cn(base, "truncate text-center")}>
            {variant.shelf || dash}
          </td>
        );
      case "stock":
        return (
          <td key={key} className={cn(base, "truncate text-center")}>
            {variant.stock || dash}
          </td>
        );
      case "supplier":
        return (
          <td key={key} className={cn(base, "truncate text-center")}>
            {variant.supplier || dash}
          </td>
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

  const renderActions = (target: ProductDeleteTarget) => (
    <td
      className={cell}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex justify-center gap-1.5">
        <BaseButtonEdit
          label={t("edit")}
          title={tCommon("comingSoon")}
          disabled
        />
        <BaseButtonDelete
          label={t("delete")}
          onClick={() => onDelete(target)}
        />
      </div>
    </td>
  );

  const renderFiller = () =>
    visibleKeys.length > 0 ? (
      <td className={cn(cell, fadeIn)} colSpan={visibleKeys.length} />
    ) : null;

  return (
    <table className="w-full table-fixed border-collapse">
      <colgroup>
        <col style={{ width: `${PRODUCTS_SELECT_COLUMN_WIDTH}%` }} />
        <col style={{ width: toWidth(PRODUCTS_NAME_COLUMN_WEIGHT) }} />
        {visibleKeys.map((key) => (
          <col key={key} style={{ width: toWidth(PRODUCTS_COLUMN_WEIGHTS[key]) }} />
        ))}
        <col style={{ width: `${PRODUCTS_ACTIONS_COLUMN_WIDTH}%` }} />
      </colgroup>
      <thead>
        <tr>
          <th className={cn(headCell, "px-0 text-center")}>
            <Checkbox
              className="mx-auto"
              checked={allSelected}
              indeterminate={someSelected}
              aria-label={t("selectAll")}
              onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
            />
          </th>
          <th className={headCell}>{t("columns.product")}</th>
          {visibleKeys.map((key) => {
            const label = t(`columns.${key}`);

            return (
              <th
                key={key}
                title={label}
                className={cn(headCell, "text-center")}
              >
                {label}
              </th>
            );
          })}
          <th className={cn(headCell, "text-center")}>
            <span className="flex items-center justify-center gap-1">
              <span className="truncate">{t("columns.actions")}</span>
              <ProductsColumnsMenu
                columns={columns}
                onColumnChange={onColumnChange}
              />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
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
              <tr
                onClick={multi ? () => onToggleExpand(product.id) : undefined}
                className={cn(
                  "h-14 cursor-pointer border-b transition-colors hover:bg-muted/50",
                  productSelected(product) && "bg-muted/60",
                  open && "bg-muted/30",
                )}
              >
                <td
                  className={cn(cell, "px-0 text-center")}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    className="mx-auto"
                    checked={productSelected(product)}
                    aria-label={t("selectRow")}
                    onCheckedChange={() =>
                      onToggleSelect(getProductSelectionKey(product.id))
                    }
                  />
                </td>
                <td className={cell}>
                  <div className="flex min-w-0 items-center gap-2">
                    {columns.image ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "shrink-0 transition-opacity duration-150 motion-reduce:transition-none",
                          open && "opacity-0",
                        )}
                      >
                        <Thumb src={first?.imageUrl ?? product.imageUrl} />
                      </span>
                    ) : null}
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="flex h-5 min-w-0 items-center gap-1.5 font-medium">
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
                            <TriangleAlert className="size-3" />
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
                          className="truncate text-sm leading-4 text-muted-foreground"
                          title={getBarcodeText(first)}
                        >
                          {getBarcodeText(first)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                {multi && open ? (
                  renderFiller()
                ) : first ? (
                  <Fragment key={multi ? "collapsed" : "single"}>
                    {renderVariantCells(first, product.unit, multi)}
                  </Fragment>
                ) : (
                  renderFiller()
                )}
                {renderActions({
                  kind: "product",
                  id: product.id,
                  name: product.name,
                })}
              </tr>

              {showChildren
                ? product.variants.map((variant) => {
                    const variantKey = getVariantSelectionKey(variant.id);
                    const low = isLowStock(variant);

                    return (
                      <tr
                        key={variant.id}
                        className={cn(
                          "h-14 cursor-pointer border-b bg-muted/20 transition-colors hover:bg-muted/50",
                          closing.has(product.id) ? rowExit : rowEnter,
                          selected.has(variantKey) && "bg-muted/60",
                        )}
                      >
                        <td
                          className={cn(cell, "px-0 text-center")}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            className="mx-auto"
                            checked={selected.has(variantKey)}
                            aria-label={t("selectRow")}
                            onCheckedChange={() => onToggleSelect(variantKey)}
                          />
                        </td>
                        <td className={cell}>
                          <div className="flex min-w-0 items-center gap-2 pl-4">
                            {columns.image ? (
                              <Thumb src={variant.imageUrl} />
                            ) : null}
                            <div className="flex min-w-0 flex-col leading-tight">
                              <span className="flex min-w-0 items-center gap-2 font-medium">
                                <span
                                  className="truncate"
                                  title={variant.name || product.name}
                                >
                                  {variant.name || product.name}
                                </span>
                                {low ? (
                                  <span className={lowBadge}>
                                    <TriangleAlert className="size-3" />
                                    {t("limitBadge")}
                                  </span>
                                ) : null}
                              </span>
                              {columns.barcode && getBarcodeText(variant) ? (
                                <span
                                  className="truncate text-sm leading-4 text-muted-foreground"
                                  title={getBarcodeText(variant)}
                                >
                                  {getBarcodeText(variant)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        {renderVariantCells(variant, product.unit, false)}
                        {renderActions({
                          kind: "variant",
                          id: variant.id,
                          name: variant.name || product.name,
                        })}
                      </tr>
                    );
                  })
                : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
