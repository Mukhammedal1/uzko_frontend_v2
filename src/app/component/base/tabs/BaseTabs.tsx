import { cn } from "@/lib/utils";
import type { BaseTabItem } from "@/types/common.types";

type BaseTabsProps = {
  items: BaseTabItem[];
  label?: string;
  onSelect: (key: string) => void;
};

export function BaseTabs({ items, label, onSelect }: BaseTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex shrink-0 items-center gap-2 overflow-x-auto border-b p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={item.active}
          className={cn(
            "flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border px-3 text-sm transition-colors duration-150 motion-reduce:transition-none",
            item.active
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-border bg-background text-foreground hover:bg-muted",
          )}
          onClick={() => onSelect(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
