import type { ProductRow } from "@/types/product.types";

const escapeCell = (value: string | number) => {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildProductsCsv = (
  products: ProductRow[],
  headers: string[],
) => {
  const rows = products.flatMap((product) =>
    product.variants.map((variant) => [
      variant.name ? `${product.name} · ${variant.name}` : product.name,
      variant.alertQuantity,
      `${variant.purchasePrice} ${variant.purchaseCurrency}`.trim(),
      `${variant.wholesalePrice} ${variant.wholesaleCurrency}`.trim(),
      `${variant.retailPrice} ${variant.retailCurrency}`.trim(),
      variant.article,
      variant.quantity,
      product.unit,
      variant.shelf,
      variant.stock,
      variant.supplier,
    ]),
  );

  return [headers, ...rows]
    .map((row) => row.map(escapeCell).join(";"))
    .join("\r\n");
};

export const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([`﻿${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
