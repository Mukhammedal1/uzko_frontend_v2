import type { Locale } from "date-fns";

import { Calendar } from "@/component/ui/calendar";

type BaseCalendarProps = {
  value: Date | undefined;
  locale: Locale;
  onChange: (value: Date | undefined) => void;
};

export function BaseCalendar({ value, locale, onChange }: BaseCalendarProps) {
  return (
    <Calendar
      mode="single"
      required={false}
      selected={value}
      defaultMonth={value}
      locale={locale}
      weekStartsOn={1}
      onSelect={onChange}
    />
  );
}
