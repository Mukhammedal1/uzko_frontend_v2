import { ru, uz, uzCyrl } from "date-fns/locale";

import type {
  LayoutCurrencyRate,
  LayoutLanguage,
} from "@/types/layout.types";

export const LAYOUT_BRAND = "UZKO";

export const LAYOUT_LOGIN_PATH = "/login";

export const LAYOUT_LANGUAGES = [
  { code: "uz", intl: "uz", label: "UZB", title: "O'zbekcha" },
  { code: "ru", intl: "ru", label: "RUS", title: "Русский" },
  { code: "uz_cryl", intl: "uz-Cyrl", label: "ЎЗБ", title: "Ўзбекча" },
] as const satisfies readonly LayoutLanguage[];

export const LAYOUT_CURRENCY_RATES = [
  { code: "USD", rate: "12 650" },
  { code: "RUB", rate: "135.5" },
  { code: "EUR", rate: "13 780" },
] as const satisfies readonly LayoutCurrencyRate[];

export const CALCULATOR_ERROR = "Error";

export const CALCULATOR_MAX_DIGITS = 15;

export const CALCULATOR_OPERATOR_SYMBOLS = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
} as const;

export const CALENDAR_LOCALES = {
  uz,
  ru,
  uz_cryl: uzCyrl,
} as const;
