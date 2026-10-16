"use client";

import { ChevronDown, Download, FileX, PackagePlus, Package } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/component/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/component/ui/dropdown-menu";

type ProductsAddMenuProps = {
  onManual: () => void;
  onImport: () => void;
  onTemplate: () => void;
};

export function ProductsAddMenu({
  onManual,
  onImport,
  onTemplate,
}: ProductsAddMenuProps) {
  const t = useTranslations("product");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type="button" className="group h-10 gap-2" />}
      >
        <PackagePlus />
        {t("add")}
        <ChevronDown className="transition-transform group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64 p-2">
        <DropdownMenuItem className="min-h-10 gap-3 px-3" onClick={onManual}>
          <Package />
          {t("addMenu.manual")}
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 gap-3 px-3" onClick={onImport}>
          <FileX />
          {t("addMenu.import")}
        </DropdownMenuItem>
        <DropdownMenuItem className="min-h-10 gap-3 px-3" onClick={onTemplate}>
          <Download />
          {t("addMenu.template")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
