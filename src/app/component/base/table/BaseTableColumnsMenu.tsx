import { Columns2 } from "lucide-react";

import { Button } from "@/component/ui/button";
import { Checkbox } from "@/component/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";
import type {
  BaseColumnsMenuItem,
  ColumnVisibility,
} from "@/types/common.types";

type BaseTableColumnsMenuProps = {
  items: BaseColumnsMenuItem[];
  visibility: ColumnVisibility;
  label: string;
  onChange: (key: string, checked: boolean) => void;
};

export function BaseTableColumnsMenu({
  items,
  visibility,
  label,
  onChange,
}: BaseTableColumnsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-foreground"
            aria-label={label}
            title={label}
          />
        }
      >
        <Columns2 />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-1 p-2">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-2 text-sm font-normal normal-case tracking-normal text-foreground hover:bg-muted"
          >
            <Checkbox
              checked={visibility[item.key] !== false}
              onCheckedChange={(checked) =>
                onChange(item.key, Boolean(checked))
              }
            />
            <span className="uppercase">{item.label}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
