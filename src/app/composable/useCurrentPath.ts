"use client";

import { useRouter } from "next/router";

export function useCurrentPath() {
  const { asPath } = useRouter();

  return asPath.split(/[?#]/)[0] || "/";
}
