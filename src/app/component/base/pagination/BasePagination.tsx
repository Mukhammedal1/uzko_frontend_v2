"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";

type BasePaginationProps = {
  page: number;
  totalPages: number;
  limit: number;
  limitOptions: number[];
  limitLabel: string;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function BasePagination({
  page,
  totalPages,
  limit,
  limitOptions,
  limitLabel,
  previousLabel,
  nextLabel,
  pageLabel,
  disabled,
  onPageChange,
  onLimitChange,
}: BasePaginationProps) {
  const [draft, setDraft] = useState(String(page));

  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isInteger(parsed)) {
      setDraft(String(page));
      return;
    }
    const next = Math.min(Math.max(parsed, 1), totalPages);
    setDraft(String(next));
    if (next !== page) onPageChange(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="hidden w-32 sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          value={draft}
          disabled={disabled}
          aria-label={pageLabel}
          className="h-9 w-16 text-center"
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          disabled={disabled || page <= 1}
          aria-label={previousLabel}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-12 text-center text-sm tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          disabled={disabled || page >= totalPages}
          aria-label={nextLabel}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{limitLabel}:</span>
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="h-9 min-w-20" aria-label={limitLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {limitOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
