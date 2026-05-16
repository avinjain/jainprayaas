"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PublicTopBar } from "./PublicTopBar";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }
  return (
    <>
      <PublicTopBar />
      {children}
    </>
  );
}
