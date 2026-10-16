type BasePagePlaceholderProps = {
  title: string;
  description?: string;
};

export function BasePagePlaceholder({
  title,
  description,
}: BasePagePlaceholderProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
