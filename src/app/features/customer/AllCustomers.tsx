"use client";

import { DefaultChildTabs } from "@/layouts/default/DefaultChildTabs";

export function AllCustomers() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <DefaultChildTabs />
        <div className="flex min-h-0 flex-1 flex-col" />
      </section>
    </div>
  );
}
