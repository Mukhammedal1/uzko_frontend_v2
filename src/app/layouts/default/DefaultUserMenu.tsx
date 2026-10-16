"use client";

import {
  ChevronDown,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Sun,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { ApiError } from "@/api/intercept";
import { Avatar, AvatarFallback } from "@/component/ui/avatar";
import { Button } from "@/component/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/component/ui/dropdown-menu";
import { LAYOUT_LANGUAGES } from "@/constants/layout/layout.constants";
import { useLogout } from "@/composable/useLogout";
import { useThemeMode } from "@/composable/useThemeMode";
import { setLocale } from "@/lib/locale";
import { useMeQuery } from "@/rest/query/auth/auth.query";
import type { AppLocale } from "@/types/i18n.types";
import type { ThemeMode } from "@/types/theme.types";
import { getUserDisplayName, getUserInitials } from "@/utils/user";

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} satisfies Record<ThemeMode, typeof Sun>;

const themeOrder: ThemeMode[] = ["system", "light", "dark"];

export function DefaultUserMenu() {
  const t = useTranslations("layout");
  const tTheme = useTranslations("theme");
  const router = useRouter();
  const intlLocale = useLocale();
  const logout = useLogout();
  const me = useMeQuery();
  const { theme, setTheme } = useThemeMode();

  useEffect(() => {
    if (me.error instanceof ApiError && me.error.status === 401) logout();
  }, [me.error, logout]);

  const role = me.data?.role;
  const roleKey = `user.roles.${role}`;
  const roleLabel = role
    ? t.has(roleKey as never)
      ? t(roleKey as never)
      : role
    : "";
  const name = getUserDisplayName(me.data);
  const initials = getUserInitials(name);
  const currentLanguage =
    LAYOUT_LANGUAGES.find((language) => language.intl === intlLocale) ??
    LAYOUT_LANGUAGES[0];

  const changeLanguage = (code: string) => {
    setLocale(code as AppLocale);
    router.replace(router.asPath);
  };

  const avatar = (size: "default" | "lg") => (
    <Avatar size={size}>
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
        {initials || <UserRound className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="group h-auto max-w-[16rem] gap-2 px-1 py-0.5 sm:pr-2"
            aria-label={name || t("actions.profile")}
          />
        }
      >
        {avatar("default")}
        <span className="hidden min-w-0 flex-col items-start text-left leading-tight sm:flex">
          {name ? (
            <span className="max-w-full truncate text-sm font-semibold">
              {name}
            </span>
          ) : null}
          {roleLabel ? (
            <span className="max-w-full truncate text-xs font-normal text-muted-foreground">
              {roleLabel}
            </span>
          ) : null}
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          {avatar("default")}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{name}</span>
            {roleLabel ? (
              <span className="truncate text-xs text-muted-foreground">
                {roleLabel}
              </span>
            ) : null}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette />
              {t("user.theme")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-44">
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as ThemeMode)}
              >
                {themeOrder.map((mode) => {
                  const Icon = themeIcons[mode];

                  return (
                    <DropdownMenuRadioItem key={mode} value={mode}>
                      <Icon />
                      {tTheme(mode)}
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages />
              {t("user.language")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-44">
              <DropdownMenuRadioGroup
                value={currentLanguage.code}
                onValueChange={changeLanguage}
              >
                {LAYOUT_LANGUAGES.map((language) => (
                  <DropdownMenuRadioItem
                    key={language.code}
                    value={language.code}
                      >
                    {language.title}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          {t("actions.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
