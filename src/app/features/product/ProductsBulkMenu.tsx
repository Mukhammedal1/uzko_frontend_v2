"use client";

import {
  ChevronDown,
  Link2,
  PackageMinus,
  Pencil,
  Percent,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/component/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/component/ui/dropdown-menu";

type ProductsBulkMenuProps = {
  count: number;
  onEdit: () => void;
  onMerge: () => void;
  onDiscount: () => void;
  onWriteOff: () => void;
  onDelete: () => void;
};

export function ProductsBulkMenu({
  count,
  onEdit,
  onMerge,
  onDiscount,
  onWriteOff,
  onDelete,
}: ProductsBulkMenuProps) {
  const t = useTranslations("product");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="group h-10 gap-2 border-[var(--focus-border)] shadow-xs bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          />
        }
      >
        {t("bulk.trigger", { count })}
        <ChevronDown className="transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-64 border border-border p-2 drop-shadow-md"
      >
        <DropdownMenuItem className="min-h-10 gap-3 px-3" onClick={onEdit}>
          <Pencil />
          {t("bulk.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 gap-3 px-3" onClick={onMerge}>
          <Link2 />
          {t("bulk.merge")}
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 gap-3 px-3" onClick={onDiscount}>
          <Percent />
          {t("bulk.discount")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="min-h-10 gap-3 px-3"
          onClick={onWriteOff}
        >
          <PackageMinus />
          {t("bulk.writeOff")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="min-h-10 gap-3 px-3"
          onClick={onDelete}
        >
          <Trash2 />
          {t("bulk.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
