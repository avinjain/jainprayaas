"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = callbackUrl.startsWith("/") ? callbackUrl : "/admin";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{
        background: "linear-gradient(145deg, #fff8f0 0%, #fdf3e7 40%, #fef0f0 70%, #fff5f5 100%)",
      }}
    >
      {/* decorative blobs */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #b91c1c 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }}
      />
      {/* subtle mandala-like ring */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-200/40 opacity-50"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/40 opacity-50"
      />

      {/* back to public site */}
      <Link
        href="/"
        className="absolute left-5 top-5 flex items-center gap-1.5 text-sm font-medium text-red-800/70 transition hover:text-red-900"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Public site
      </Link>

      <div className="relative z-10 w-full max-w-md">
        {/* brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-red-100">
            <Image
              src="/prayaas-logo.png"
              alt="Prayaas"
              width={200}
              height={80}
              className="h-20 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-amber-700/80">Matrimony Portal · Admin</p>
        </div>

        {/* card */}
        <div className="rounded-2xl border border-red-100 bg-white/90 p-8 shadow-xl shadow-red-900/10 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-slate-900">Sign in to continue</h1>
          <p className="mt-1 text-sm text-slate-500">
            Access the admin dashboard to manage submissions.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="admin@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-11 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-3.5 text-base font-semibold text-white shadow-md shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-red-800/50">
          Prayaas · Jain Community Matrimony
        </p>
      </div>
    </div>
  );
}
