"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.fullscreenElement !== null);
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen().catch(() => undefined);
  }, []);

  return { active, toggle };
}
