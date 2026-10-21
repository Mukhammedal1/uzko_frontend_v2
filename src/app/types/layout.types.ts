import type { AppLocale } from "@/types/i18n.types";

export type LayoutLanguage = {
  code: AppLocale;
  intl: string;
  label: string;
  title: string;
};

export type LayoutCurrencyRate = {
  code: string;
  rate: string;
};

export type CalculatorOperator = "+" | "-" | "*" | "/";

export type CalculatorState = {
  display: string;
  accumulator: number | null;
  operator: CalculatorOperator | null;
  fresh: boolean;
};
