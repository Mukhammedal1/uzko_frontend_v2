import { SquarePen } from "lucide-react";

import { Button } from "@/component/ui/button";
import { cn } from "@/lib/utils";

type BaseButtonEditProps = {
  label: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export function BaseButtonEdit({
  label,
  title,
  disabled,
  className,
  onClick,
}: BaseButtonEditProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "border-primary/30 bg-background text-primary hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:bg-background dark:hover:bg-primary/15",
        className,
      )}
      onClick={onClick}
    >
      <SquarePen />
    </Button>
  );
}
