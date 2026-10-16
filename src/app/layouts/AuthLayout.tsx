import type { ReactElement, ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh w-full lg:grid-cols-2">
      <aside className="hidden items-center justify-center bg-primary p-8 text-primary-foreground lg:flex">
        <span className="select-none text-[clamp(4rem,10vw,9rem)] font-bold leading-none tracking-[0.12em]">
          UZKO
        </span>
      </aside>
      <section className="flex min-w-0 flex-col items-center justify-center gap-8 px-4 py-10 sm:px-8">
        <span className="select-none text-3xl font-bold tracking-[0.12em] lg:hidden">
          UZKO
        </span>
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}

export const getAuthLayout = (page: ReactElement) => (
  <AuthLayout>{page}</AuthLayout>
);
