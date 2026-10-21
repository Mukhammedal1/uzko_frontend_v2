import type { z } from "zod";

import type { settingsNameSchema } from "@/validate/settings/name.zod";

export type SettingsTabKey =
  | "stocks"
  | "expenseTypes"
  | "shelfNumbers"
  | "currency";

export type SettingsNameFormValues = z.infer<typeof settingsNameSchema>;

export type NamedItem = {
  id: number;
  name: string;
  isSystem: boolean;
};

export type BusinessCurrencyRow = {
  id: number;
  name: string;
  symbol: string;
  rate: number;
  isMain: boolean;
};

export type NamedListMessages = {
  description: string;
  placeholder: string;
  deleteTitle: string;
};
