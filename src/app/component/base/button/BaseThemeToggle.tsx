import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/component/ui/button";
import { THEME_MODES } from "@/constants/theme/theme.constants";
import type { ThemeMode } from "@/types/theme.types";

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} satisfies Record<ThemeMode, typeof Sun>;

type BaseThemeToggleProps = {
  value: ThemeMode;
  labels: Record<ThemeMode, string>;
  onChange: (value: ThemeMode) => void;
};

export function BaseThemeToggle({ value, labels, onChange }: BaseThemeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1" role="group">
      {THEME_MODES.map((mode) => {
        const Icon = icons[mode];

        return (
          <Button
            key={mode}
            type="button"
            size="icon"
            variant={value === mode ? "default" : "outline"}
            aria-label={labels[mode]}
            aria-pressed={value === mode}
            title={labels[mode]}
            onClick={() => onChange(mode)}
          >
            <Icon />
          </Button>
        );
      })}
    </div>
  );
}
