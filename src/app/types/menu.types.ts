import type { AppLocale } from "@/types/i18n.types";

export type LocalizedName = Record<AppLocale, string>;

export type MenuPage = {
  id: number;
  key: string;
  order: number;
  name: LocalizedName;
  href: string;
};

export type MenuModule = {
  id: number;
  key: string;
  order: number;
  name: LocalizedName;
  iconUrl: string | null;
  href: string;
  pages: MenuPage[];
};
