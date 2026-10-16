import type { LOCALES } from "@/constants/i18n/i18n.constants";
import type uz from "@/locales/uz.json";

export type AppLocale = (typeof LOCALES)[number];

export type AppMessages = typeof uz;

declare module "next-intl" {
  interface AppConfig {
    Messages: AppMessages;
  }
}
