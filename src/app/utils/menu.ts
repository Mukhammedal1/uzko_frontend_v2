import type { MeResponse } from "@/types/auth.types";
import type { AppLocale } from "@/types/i18n.types";
import type { LocalizedName, MenuModule, MenuPage } from "@/types/menu.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const getFileUrl = (fileId: number) =>
  `${API_URL}/files/serve/${fileId}`;

export const extractMenu = (me?: MeResponse): MenuModule[] => {
  if (!me || !Array.isArray(me.modules)) return [];

  const pages = Array.isArray(me.pages) ? me.pages : [];

  return me.modules
    .map((module): MenuModule => {
      const modulePages = pages
        .filter((page) => page.module_id === module.id)
        .sort((a, b) => a.order - b.order)
        .map(
          (page): MenuPage => ({
            id: page.id,
            key: page.key,
            order: page.order,
            name: page.name,
            href: `/${module.key}/${page.key}`,
          }),
        );

      return {
        id: module.id,
        key: module.key,
        order: module.order,
        name: module.name,
        iconUrl: module.icon ? getFileUrl(module.icon.id) : null,
        href: modulePages[0]?.href ?? `/${module.key}`,
        pages: modulePages,
      };
    })
    .sort((a, b) => a.order - b.order);
};

export const getLocalizedName = (name: LocalizedName, locale: AppLocale) =>
  name[locale] || name.uz;
