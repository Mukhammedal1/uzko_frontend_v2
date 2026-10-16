"use client";

import { useMemo } from "react";

import { useMeQuery } from "@/rest/query/auth/auth.query";
import { extractMenu } from "@/utils/menu";

export function useMenu() {
  const me = useMeQuery();
  const modules = useMemo(() => extractMenu(me.data), [me.data]);

  return {
    modules,
    isPending: me.isPending || me.isFetching,
    isEmpty: !me.isPending && modules.length === 0,
  };
}
