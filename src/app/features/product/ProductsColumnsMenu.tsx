"use client";

import { Columns2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/component/ui/button";
import { Checkbox } from "@/component/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";
import { PRODUCTS_COLUMN_KEYS } from "@/constants/product/product.constants";
import type {
  ProductColumnKey,
  ProductColumnVisibility,
} from "@/types/product.types";

type ProductsColumnsMenuProps = {
  columns: ProductColumnVisibility;
  onColumnChange: (key: ProductColumnKey, checked: boolean) => void;
};

export function ProductsColumnsMenu({
  columns,
  onColumnChange,
}: ProductsColumnsMenuProps) {
  const t = useTranslations("product");

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-foreground"
            aria-label={t("columnsSettings")}
            title={t("columnsSettings")}
          />
        }
      >
        <Columns2 />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-1 p-2">
        {PRODUCTS_COLUMN_KEYS.map((key) => (
          <label
            key={key}
            className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-2 text-sm font-normal normal-case tracking-normal text-foreground hover:bg-muted"
          >
            <Checkbox
              checked={columns[key]}
              onCheckedChange={(checked) => onColumnChange(key, Boolean(checked))}
            />
            <span className="uppercase">{t(`columns.${key}`)}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
