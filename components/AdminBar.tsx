"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { PrayaasBrandLink } from "./PrayaasBrandLink";

function AdminProfileMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const email = session?.user?.email ?? "";
  const initials = email ? email[0].toUpperCase() : "A";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        aria-expanded={open}
      >
        {/* avatar circle */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-800 text-xs font-bold text-white">
          {status === "loading" ? "…" : initials}
        </span>
        <span className="hidden max-w-[140px] truncate sm:block">
          {status === "loading" ? "Loading…" : email || "Admin"}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* account info */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
              {email || "Admin"}
            </p>
          </div>

          {/* menu items */}
          <div className="py-1.5">
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <svg className="h-3.5 w-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              Site & QR Codes
            </Link>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
              View Public Site
            </Link>
          </div>

          {/* sign out */}
          <div className="border-t border-slate-100 py-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut({ callbackUrl: "/admin/login" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-700 transition hover:bg-red-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                <svg className="h-3.5 w-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminBar() {
  const pathname = usePathname();
  const onLogin = pathname === "/admin/login";

  if (onLogin) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <div className="mx-auto flex max-w-[120rem] items-center justify-between gap-4">
        {/* left: logo + nav */}
        <div className="flex items-center gap-4">
          <PrayaasBrandLink showTagline={false} />
          <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
          <nav className="flex items-center gap-1">
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname === "/admin"
                  ? "bg-amber-100 text-amber-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Submissions
            </Link>
          </nav>
        </div>

        {/* right: profile dropdown */}
        <AdminProfileMenu />
      </div>
    </header>
  );
}
