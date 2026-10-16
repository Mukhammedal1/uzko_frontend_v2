import { Search, X } from "lucide-react";

import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";

type BaseInputSearchProps = {
  id: string;
  value: string;
  placeholder: string;
  clearLabel: string;
  onChange: (value: string) => void;
};

export function BaseInputSearch({
  id,
  value,
  placeholder,
  clearLabel,
  onChange,
}: BaseInputSearchProps) {
  return (
    <div className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label={clearLabel}
          onClick={() => onChange("")}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
