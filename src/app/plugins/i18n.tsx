import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { INTL_LOCALES } from "@/constants/i18n/i18n.constants";
import ru from "@/locales/ru.json";
import uz from "@/locales/uz.json";
import uzCryl from "@/locales/uz_cryl.json";
import { LangSync } from "@/plugins/i18n-lang-sync";
import type { AppLocale, AppMessages } from "@/types/i18n.types";

const messages: Record<AppLocale, AppMessages> = {
  uz,
  ru,
  uz_cryl: uzCryl,
};

type I18nProviderProps = {
  locale: AppLocale;
  children: ReactNode;
};

export function I18nProvider({ locale, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider
      locale={INTL_LOCALES[locale]}
      messages={messages[locale]}
      timeZone="Asia/Tashkent"
    >
      <LangSync />
      {children}
    </NextIntlClientProvider>
  );
}
