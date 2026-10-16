"use client";

import { useLocale } from "next-intl";

import { DEFAULT_LOCALE } from "@/constants/i18n/i18n.constants";
import { LAYOUT_LANGUAGES } from "@/constants/layout/layout.constants";
import type { AppLocale } from "@/types/i18n.types";

export function useAppLocale(): AppLocale {
  const intlLocale = useLocale();

  return (
    LAYOUT_LANGUAGES.find((language) => language.intl === intlLocale)?.code ??
    DEFAULT_LOCALE
  );
}
