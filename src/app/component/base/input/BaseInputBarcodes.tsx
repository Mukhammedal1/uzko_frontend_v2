import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/ui/popover";

type BaseInputBarcodesProps = {
  id: string;
  label: string;
  values: string[];
  placeholder: string;
  countLabel: string;
  inputPlaceholder: string;
  removeLabel: string;
  actionIcon?: ReactNode;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  onAction?: () => void;
};

export function BaseInputBarcodes({
  id,
  label,
  values,
  placeholder,
  countLabel,
  inputPlaceholder,
  removeLabel,
  actionIcon,
  actionLabel,
  actionDisabled,
  onAdd,
  onRemove,
  onAction,
}: BaseInputBarcodesProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !values.includes(value)) onAdd(value);
    setDraft("");
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="whitespace-nowrap">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                id={id}
                type="button"
                variant="outline"
                className="h-9 min-w-0 flex-1 justify-between gap-2 px-2.5 font-normal"
              />
            }
          >
            <span
              className={
                values.length > 0 ? "truncate" : "truncate text-muted-foreground"
              }
            >
              {values.length > 0 ? countLabel : placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-(--anchor-width) min-w-56 gap-1 p-1"
          >
            <Input
              autoFocus
              value={draft}
              placeholder={inputPlaceholder}
              className="h-9"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                commit();
              }}
            />
            {values.length > 0 ? (
              <ul className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                {values.map((value, index) => (
                  <li
                    key={value}
                    className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1 text-sm hover:bg-accent"
                  >
                    <span className="min-w-0 truncate">{value}</span>
                    <BaseButtonDelete
                      label={removeLabel}
                      className="size-6 shrink-0"
                      onClick={() => onRemove(index)}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </PopoverContent>
        </Popover>
        {actionIcon ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label={actionLabel}
            title={actionLabel}
            disabled={actionDisabled}
            onClick={onAction}
          >
            {actionIcon}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
