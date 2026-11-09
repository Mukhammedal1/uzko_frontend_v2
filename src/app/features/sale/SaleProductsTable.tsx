"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { BasePrice } from "@/component/base/price/BasePrice";
import { BaseTableColumnsMenu } from "@/component/base/table/BaseTableColumnsMenu";
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
import { Button } from "@/component/ui/button";
import {
  SALE_COLUMN_WEIGHTS,
  SALE_MENU_COLUMN_WIDTH,
  SALE_NAME_COLUMN_WEIGHT,
  SALE_TABLE_COLUMN_KEYS,
  SALE_TOGGLE_COLUMN_KEYS,
} from "@/constants/sale/sale.constants";
import { cn } from "@/lib/utils";
import type { ColumnVisibility } from "@/types/common.types";
import type { ProductRow, ProductVariantRow } from "@/types/product.types";
import type { SaleTableColumnKey } from "@/types/sale.types";
import { formatNumber } from "@/utils/format";
import { isLowStock } from "@/utils/product";

type SaleProductsTableProps = {
  products: ProductRow[];
  visibility: ColumnVisibility;
  expanded: Set<number>;
  closing: Set<number>;
  onToggleExpand: (id: number) => void;
  onColumnChange: (key: string, checked: boolean) => void;
};

const headCell =
  "sticky top-0 z-10 overflow-hidden text-ellipsis whitespace-nowrap border-b bg-card px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";

const cell = "overflow-hidden px-2 py-1.5 text-center align-middle text-sm";

const fadeIn = "animate-in fade-in duration-200 motion-reduce:animate-none";

const rowEnter =
  "animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none";

const rowExit =
  "animate-out fade-out slide-out-to-top-1 fill-mode-forwards duration-150 motion-reduce:animate-none";

const dash = <span className="text-muted-foreground">—</span>;

export function SaleProductsTable({
  products,
  visibility,
  expanded,
  closing,
  onToggleExpand,
  onColumnChange,
}: SaleProductsTableProps) {
  const t = useTranslations("sale");

  const isVisible = (key: string) => visibility[key] !== false;
  const visibleKeys = SALE_TABLE_COLUMN_KEYS.filter(isVisible);
  const showMargin = isVisible("margin");

  const weightSum =
    SALE_NAME_COLUMN_WEIGHT +
    visibleKeys.reduce((sum, key) => sum + SALE_COLUMN_WEIGHTS[key], 0);
  const flexibleWidth = 100 - SALE_MENU_COLUMN_WIDTH;
  const toWidth = (weight: number) =>
    `${(weight / weightSum) * flexibleWidth}%`;

  const menuItems = SALE_TOGGLE_COLUMN_KEYS.map((key) => ({
    key,
    label: t(`columns.${key}`),
  }));

  const renderVariantCell = (
    key: SaleTableColumnKey,
    variant: ProductVariantRow,
    unit: string,
    animation: string | undefined,
  ) => {
    const base = cn(cell, animation);

    switch (key) {
      case "cost":
        return (
          <BaseTableCell key={key} className={base}>
            <BasePrice
              value={variant.purchasePrice}
              currency={variant.purchaseCurrency}
            />
          </BaseTableCell>
        );
      case "retail":
        return (
          <BaseTableCell key={key} className={base}>
            <BasePrice
              value={variant.retailPrice}
              currency={variant.retailCurrency}
              percentage={showMargin ? variant.retailPercentage : undefined}
            />
          </BaseTableCell>
        );
      case "wholesale":
        return (
          <BaseTableCell key={key} className={base}>
            <BasePrice
              value={variant.wholesalePrice}
              currency={variant.wholesaleCurrency}
              percentage={showMargin ? variant.wholesalePercentage : undefined}
            />
          </BaseTableCell>
        );
      case "quantity":
        return (
          <BaseTableCell
            key={key}
            className={cn(
              base,
              "tabular-nums",
              isLowStock(variant) && "font-semibold text-destructive",
            )}
          >
            {formatNumber(variant.quantity)}
          </BaseTableCell>
        );
      case "unit":
        return (
          <BaseTableCell key={key} className={base}>
            {unit || dash}
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
  ) =>
    visibleKeys.map((key) =>
      renderVariantCell(key, variant, unit, animated ? fadeIn : undefined),
    );

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <BaseTableRoot className="w-full min-w-200 table-fixed border-collapse">
        <BaseTableColGroup>
          <BaseTableCol style={{ width: toWidth(SALE_NAME_COLUMN_WEIGHT) }} />
          {visibleKeys.map((key) => (
            <BaseTableCol
              key={key}
              style={{ width: toWidth(SALE_COLUMN_WEIGHTS[key]) }}
            />
          ))}
          <BaseTableCol style={{ width: `${SALE_MENU_COLUMN_WIDTH}%` }} />
        </BaseTableColGroup>
        <BaseTableHead>
          <BaseTableRow>
            <BaseTableHeadCell className={headCell}>
              {t("columns.name")}
            </BaseTableHeadCell>
            {visibleKeys.map((key) => (
              <BaseTableHeadCell
                key={key}
                title={t(`columns.${key}`)}
                className={cn(headCell, "text-center")}
              >
                {t(`columns.${key}`)}
              </BaseTableHeadCell>
            ))}
            <BaseTableHeadCell className={cn(headCell, "px-0 text-center")}>
              <BaseTableColumnsMenu
                items={menuItems}
                visibility={visibility}
                label={t("columnsSettings")}
                onChange={onColumnChange}
              />
            </BaseTableHeadCell>
          </BaseTableRow>
        </BaseTableHead>
        <BaseTableBody>
          {products.map((product) => {
            const multi = product.variants.length > 1;
            const first = product.variants[0];
            const open =
              multi && expanded.has(product.id) && !closing.has(product.id);
            const showChildren = multi && expanded.has(product.id);
            const collapsedName =
              first?.name && first.name !== product.name
                ? `${product.name} · ${first.name}`
                : product.name;
            const headerLabel = multi && !open ? collapsedName : product.name;

            return (
              <Fragment key={product.id}>
                <BaseTableRow
                  onClick={multi ? () => onToggleExpand(product.id) : undefined}
                  className={cn(
                    "h-12 border-b transition-colors hover:bg-muted/50",
                    multi && "cursor-pointer",
                    open && "bg-muted/30",
                  )}
                >
                  <BaseTableCell className={cell}>
                    <div className="flex min-w-0 flex-col text-left leading-tight">
                      <span className="flex h-5 min-w-0 items-center gap-1.5 text-sm font-medium">
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
                      </span>
                      {multi ? (
                        <span className="truncate text-xs leading-4 text-muted-foreground">
                          {t("variantsCount", {
                            count: product.variants.length,
                          })}
                        </span>
                      ) : first?.article ? (
                        <span
                          className="truncate text-xs leading-4 text-muted-foreground"
                          title={first.article}
                        >
                          {first.article}
                        </span>
                      ) : null}
                    </div>
                  </BaseTableCell>
                  {multi && open ? (
                    <BaseTableCell
                      className={cn(cell, fadeIn)}
                      colSpan={Math.max(visibleKeys.length, 1)}
                    />
                  ) : first ? (
                    <Fragment key={multi ? "collapsed" : "single"}>
                      {renderVariantCells(first, product.unit, multi)}
                    </Fragment>
                  ) : (
                    <BaseTableCell
                      className={cell}
                      colSpan={Math.max(visibleKeys.length, 1)}
                    />
                  )}
                  <BaseTableCell className={cell} />
                </BaseTableRow>

                {showChildren
                  ? product.variants.map((variant) => (
                      <BaseTableRow
                        key={variant.id}
                        className={cn(
                          "h-12 border-b bg-variant-row transition-colors hover:bg-muted/50",
                          closing.has(product.id) ? rowExit : rowEnter,
                        )}
                      >
                        <BaseTableCell className={cell}>
                          <div className="flex min-w-0 flex-col pl-6 text-left leading-tight">
                            <span
                              className="truncate text-sm font-medium"
                              title={variant.name || product.name}
                            >
                              {variant.name || product.name}
                            </span>
                            {variant.article ? (
                              <span
                                className="truncate text-xs leading-4 text-muted-foreground"
                                title={variant.article}
                              >
                                {variant.article}
                              </span>
                            ) : null}
                          </div>
                        </BaseTableCell>
                        {renderVariantCells(variant, product.unit, false)}
                        <BaseTableCell className={cell} />
                      </BaseTableRow>
                    ))
                  : null}
              </Fragment>
            );
          })}
        </BaseTableBody>
      </BaseTableRoot>
    </div>
  );
}
