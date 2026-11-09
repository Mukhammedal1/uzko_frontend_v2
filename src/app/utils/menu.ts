import type { MePage, MeResponse } from "@/types/auth.types";
import type { AppLocale } from "@/types/i18n.types";
import type { LocalizedName, MenuModule, MenuPage } from "@/types/menu.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const getFileUrl = (fileId: number) =>
  `${API_URL}/files/serve/${fileId}`;

const toMenuPages = (pages: MePage[], moduleKey: string): MenuPage[] =>
  [...pages]
    .sort((a, b) => a.order - b.order)
    .map((page): MenuPage => {
      const children = Array.isArray(page.children)
        ? toMenuPages(page.children, moduleKey)
        : [];

      return {
        id: page.id,
        key: page.key,
        order: page.order,
        name: page.name,
        href: children[0]?.href ?? `/${moduleKey}/${page.key}`,
        children,
      };
    });

export const flattenMenuPages = (pages: MenuPage[]): MenuPage[] =>
  pages.flatMap((page) => [page, ...flattenMenuPages(page.children)]);

export const isMenuPageActive = (page: MenuPage, pathname: string) =>
  flattenMenuPages([page]).some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

export const extractMenu = (me?: MeResponse): MenuModule[] => {
  if (!me || !Array.isArray(me.modules)) return [];

  const pages = Array.isArray(me.pages) ? me.pages : [];

  return me.modules
    .map((module): MenuModule => {
      const modulePages = toMenuPages(
        pages.filter((page) => page.module_id === module.id),
        module.key,
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

export const findChildPageGroup = (
  modules: MenuModule[],
  pathname: string,
): MenuPage | undefined =>
  modules
    .flatMap((module) => flattenMenuPages(module.pages))
    .find((page) => page.children.some((child) => child.href === pathname));
