"use client";

import { ApplicantUserMenu } from "./ApplicantUserMenu";
import { PrayaasBrandLink } from "./PrayaasBrandLink";

export function PublicTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sm:h-16 sm:px-6">
      <PrayaasBrandLink />

      <ApplicantUserMenu />
    </header>
  );
}
