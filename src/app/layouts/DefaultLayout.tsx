import type { ReactElement, ReactNode } from "react";

import { DefaultFooter } from "@/layouts/default/DefaultFooter";
import { DefaultHeader } from "@/layouts/default/DefaultHeader";
import { DefaultRouteGuard } from "@/layouts/default/DefaultRouteGuard";
import { DefaultSubNav } from "@/layouts/default/DefaultSubNav";

export function DefaultLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      <DefaultHeader />
      <DefaultSubNav />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DefaultRouteGuard>{children}</DefaultRouteGuard>
      </main>
      <DefaultFooter />
    </div>
  );
}

export const getDefaultLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
);
