"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common.types";

type BaseSelectProps = {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  active?: boolean;
  required?: boolean;
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  labelClassName?: string;
  triggerClassName?: string;
  onChange: (value: string) => void;
};

type BaseSelectSearchProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter: () => void;
};

const NAVIGATION_KEYS = new Set(["ArrowDown", "ArrowUp", "Escape", "Tab"]);

function BaseSelectSearch({
  value,
  placeholder,
  onChange,
  onEnter,
}: BaseSelectSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-popover p-1 pb-0.5">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className="h-8 pl-8"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              onEnter();
              return;
            }
            if (!NAVIGATION_KEYS.has(event.key)) event.stopPropagation();
          }}
        />
      </div>
    </div>
  );
}

export function BaseSelect({
  id,
  label,
  value,
  options,
  disabled,
  active = false,
  required = false,
  searchable = true,
  placeholder,
  searchPlaceholder,
  labelClassName,
  triggerClassName,
  onChange,
}: BaseSelectProps) {
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return text === ""
      ? options
      : options.filter((option) => option.label.toLowerCase().includes(text));
  }, [options, query]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const handleSelect = (next: string) => {
    onChange(next);
    handleOpenChange(false);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label
        htmlFor={id}
        className={cn(
          active ? "text-primary" : "text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Select
        value={value === "" ? null : value}
        items={options}
        open={open}
        disabled={disabled}
        onOpenChange={handleOpenChange}
        onValueChange={(next) => {
          if (typeof next === "string") handleSelect(next);
        }}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "w-full",
            triggerClassName,
            active &&
              "border-primary bg-primary/10 font-medium text-primary dark:bg-primary/15",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="min-w-0 p-1">
          {searchable ? (
            <BaseSelectSearch
              value={query}
              placeholder={searchPlaceholder ?? tCommon("search")}
              onChange={setQuery}
              onEnter={() => {
                const [first] = filtered;
                if (first) handleSelect(first.value);
              }}
            />
          ) : null}
          {filtered.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="py-1.5 pl-2.5"
            >
              {option.label}
            </SelectItem>
          ))}
          {searchable && filtered.length === 0 ? (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              {tCommon("noResults")}
            </p>
          ) : null}
        </SelectContent>
      </Select>
    </div>
  );
}
