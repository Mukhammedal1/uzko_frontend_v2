import type { NumericOptions } from "@/types/common.types";

export const sanitizeNumeric = (
  input: string,
  { decimals, allowNegative = false }: NumericOptions,
) => {
  const text = input.replace(/\s/g, "").replace(",", ".");
  const negative = allowNegative && text.startsWith("-");
  const cleaned = text.replace(/[^0-9.]/g, "");
  const [integerPart, ...rest] = cleaned.split(".");

  let result = integerPart.replace(/^0+(?=\d)/, "");
  if (decimals > 0 && rest.length > 0) {
    result += `.${rest.join("").slice(0, decimals)}`;
  }

  return negative ? `-${result}` : result;
};

export const formatNumeric = (
  value: string,
  { grouping = true }: NumericOptions,
) => {
  if (value === "") return "";

  const negative = value.startsWith("-");
  const [integerPart, decimalPart] = value.replace("-", "").split(".");
  const grouped = grouping
    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : integerPart;
  const decimal = value.includes(".") ? `,${decimalPart ?? ""}` : "";

  return `${negative ? "-" : ""}${grouped}${decimal}`;
};
