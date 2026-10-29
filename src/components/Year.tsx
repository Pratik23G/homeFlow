"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Current year, computed on the client so static prerender doesn't freeze or break on it. */
export function Year() {
  const year = useSyncExternalStore(
    subscribe,
    () => String(new Date().getFullYear()),
    () => "2026",
  );
  return <>{year}</>;
}
