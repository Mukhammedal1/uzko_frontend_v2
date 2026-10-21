import { cn } from "@/lib/utils";

type BaseBadgeShelfProps = {
  label: string;
  className?: string;
};

export function BaseBadgeShelf({ label, className }: BaseBadgeShelfProps) {
  return (
    <span
      title={label}
      className={cn(
        "inline-flex max-w-full items-center rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[11px] leading-4 font-semibold text-primary",
        className,
      )}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
