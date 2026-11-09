"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { cn } from "@/lib/utils";
import type { BaseAutocompleteOption } from "@/types/common.types";

type BaseInputAutocompleteProps = {
  id: string;
  label: string;
  value: string;
  options: BaseAutocompleteOption[];
  loading?: boolean;
  loadingLabel: string;
  emptyLabel: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
};

export function BaseInputAutocomplete({
  id,
  label,
  value,
  options,
  loading = false,
  loadingLabel,
  emptyLabel,
  placeholder,
  required,
  error,
  onChange,
  onSelect,
  onOpenChange,
}: BaseInputAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onOpenChange]);

  return (
    <div ref={wrapperRef} className="relative flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="whitespace-nowrap">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-invalid={error ? true : undefined}
        className="h-9"
        onFocus={() => changeOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          if (!open) changeOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") changeOpen(false);
          if (event.key === "Enter" && open) {
            event.preventDefault();
            const [first] = options;
            if (first) onSelect(first.value);
            changeOpen(false);
          }
        }}
      />
      {open ? (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-30 mt-1 max-h-60 w-full min-w-56 animate-in overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md duration-150 fade-in-0 motion-reduce:animate-none"
        >
          {options.length === 0 ? (
            <li className="px-2.5 py-2 text-sm text-muted-foreground">
              {loading ? loadingLabel : emptyLabel}
            </li>
          ) : (
            options.map((option, index) => (
              <li key={option.value} role="option" aria-selected={false}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-150",
                    "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
                    index === 0 && "bg-accent text-accent-foreground",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(option.value);
                    changeOpen(false);
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
