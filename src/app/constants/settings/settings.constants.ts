import { Box, Coins, Grip, Tag } from "lucide-react";

import type { SettingsTabKey } from "@/types/settings.types";

export const SETTINGS_TABS = [
  { key: "stocks", icon: Box },
  { key: "expenseTypes", icon: Tag },
  { key: "shelfNumbers", icon: Grip },
  { key: "currency", icon: Coins },
] as const satisfies readonly { key: SettingsTabKey; icon: unknown }[];

export const SETTINGS_DEFAULT_TAB: SettingsTabKey = "stocks";

export const SETTINGS_FIXED_RATE_CURRENCY = "UZS";
