import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
} from "@/constants/i18n/i18n.constants";
import type { AppLocale } from "@/types/i18n.types";
import { isAppLocale } from "@/utils/locale";

export function setLocale(locale: AppLocale) {
  if (typeof document === "undefined" || !isAppLocale(locale)) return;

  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
