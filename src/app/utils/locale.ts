import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
} from "@/constants/i18n/i18n.constants";
import type { AppLocale } from "@/types/i18n.types";

export const isAppLocale = (value: string | undefined): value is AppLocale =>
  LOCALES.some((locale) => locale === value);

export const readLocaleFromCookie = (cookieHeader?: string): AppLocale => {
  if (!cookieHeader) return DEFAULT_LOCALE;

  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));

  const value = entry?.slice(LOCALE_COOKIE.length + 1);
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
};
