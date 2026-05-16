"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function scrollToApply() {
  const el = document.getElementById("apply");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ApplicantUserMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = Boolean(session?.user?.email);

  async function handleSignOut() {
    setOpen(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="touch-manipulation flex items-center gap-2 rounded-full border border-rose-200/80 bg-white px-2 py-2 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50/50 sm:px-3 sm:py-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-amber-600 text-xs font-bold text-white">
          {isAdmin
            ? (session!.user!.email?.[0] ?? "A").toUpperCase()
            : "U"}
        </div>
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-800 sm:inline">
          {isAdmin ? session!.user!.email : "For applicants"}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-slate-900/20"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="z-[90] max-lg:fixed max-lg:left-3 max-lg:right-3 max-lg:top-[3.75rem] max-lg:max-h-[min(70vh,calc(100dvh-5rem))] max-lg:overflow-y-auto sm:max-lg:left-auto sm:max-lg:right-4 sm:max-lg:w-64 lg:absolute lg:right-0 lg:top-full lg:mt-2 lg:w-64 rounded-xl border border-stone-200 bg-white py-1 shadow-lg shadow-stone-200/60"
            role="menu"
          >
            {status === "loading" ? (
              <p className="px-4 py-3 text-sm text-slate-500">Loading…</p>
            ) : isAdmin ? (
              <>
                <div className="border-b border-stone-100 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-800/90">
                    Signed in
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                    {session!.user!.email}
                  </p>
                </div>
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-rose-50"
                >
                  Submissions
                </Link>
                <Link
                  href="/admin/settings"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-rose-50"
                >
                  Site & QR codes
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  className="flex w-full items-center gap-3 border-t border-stone-100 px-4 py-2.5 text-left text-sm font-medium text-rose-800 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="border-b border-stone-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Applicants
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Register and submit your biodata in one place.
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    scrollToApply();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-rose-50"
                >
                  Submit biodata
                </button>
                <Link
                  href="/"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-rose-50"
                >
                  Home
                </Link>
                <p className="border-t border-stone-100 px-4 py-2 text-xs text-slate-500">
                  Organisers sign in at{" "}
                  <Link
                    href="/admin/login"
                    className="font-medium text-amber-800 underline-offset-2 hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
