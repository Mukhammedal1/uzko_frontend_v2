"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  SETTINGS_DEFAULT_TAB,
  SETTINGS_TABS,
} from "@/constants/settings/settings.constants";
import { SettingsCurrencyTab } from "@/features/settings/SettingsCurrencyTab";
import {
  SettingsExpenseTypesTab,
  SettingsShelfNumbersTab,
  SettingsStocksTab,
} from "@/features/settings/SettingsNamedTabs";
import { cn } from "@/lib/utils";
import type { SettingsTabKey } from "@/types/settings.types";

export function SettingsGeneral() {
  const t = useTranslations("settingsGeneral");
  const [tab, setTab] = useState<SettingsTabKey>(SETTINGS_DEFAULT_TAB);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 sm:px-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <div
          role="tablist"
          className="flex shrink-0 gap-1 overflow-x-auto border-b p-2"
        >
          {SETTINGS_TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={cn(
                "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
              onClick={() => setTab(key)}
            >
              <Icon className="size-4" />
              {t(`tabs.${key}`)}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          {tab === "stocks" ? <SettingsStocksTab /> : null}
          {tab === "expenseTypes" ? <SettingsExpenseTypesTab /> : null}
          {tab === "shelfNumbers" ? <SettingsShelfNumbersTab /> : null}
          {tab === "currency" ? <SettingsCurrencyTab /> : null}
        </div>
      </section>
    </div>
  );
}
