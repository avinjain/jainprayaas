"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SubmissionRow = {
  id: string;
  submissionCode: string;
  fullName: string;
  gender: string;
  age: number;
  mobileNumber: string;
  biodataFileKey: string;
  paymentScreenshotKey: string;
  paymentStatus: string;
  createdAt: string;
};

function fileUrl(key: string) {
  const [kind, name] = key.split("/");
  if (!kind || !name) return "#";
  return `/api/admin/files/${kind}/${encodeURIComponent(name)}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "badge-pending",
    Verified: "badge-verified",
    Rejected: "badge-rejected",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-700 border border-slate-200"}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border p-4 ${color}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

async function downloadExcel(queryString: string) {
  const res = await fetch(`/api/admin/submissions/export${queryString}`);
  if (!res.ok) {
    alert("Export failed. Please try again.");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prayaas-submissions-${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboardPage() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (gender) p.set("gender", gender);
    if (status) p.set("status", status);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [q, gender, status, dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/submissions${queryString}`);
        if (!res.ok) {
          if (!cancelled) setRows([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) setRows(data.submissions ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  async function refreshList() {
    const res = await fetch(`/api/admin/submissions${queryString}`);
    if (!res.ok) return;
    const data = await res.json();
    setRows(data.submissions ?? []);
  }

  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  async function setPaymentStatus(id: string, paymentStatus: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) await refreshList();
    } finally {
      setSavingId(null);
    }
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Are you sure you want to delete this submission? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (res.ok) await refreshList();
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => r.paymentStatus === "Pending").length,
      verified: rows.filter((r) => r.paymentStatus === "Verified").length,
      rejected: rows.filter((r) => r.paymentStatus === "Rejected").length,
    }),
    [rows],
  );

  const hasActiveFilters = q || gender || status || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[120rem]">

        {/* ── PAGE HEADER ─────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Review biodata & payment proofs · update status after UPI verification.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refreshList()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                await downloadExcel(queryString);
                setExporting(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100 disabled:opacity-60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? "Exporting…" : "Export Excel"}
            </button>
          </div>
        </div>

        {/* ── STATS ───────────────────────────────────── */}
        {!loading && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total"
              value={stats.total}
              color="border-slate-200 bg-white text-slate-900"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              color="border-amber-200 bg-amber-50 text-amber-900"
            />
            <StatCard
              label="Verified"
              value={stats.verified}
              color="border-emerald-200 bg-emerald-50 text-emerald-900"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              color="border-red-200 bg-red-50 text-red-900"
            />
          </div>
        )}

        {/* ── FILTERS ─────────────────────────────────── */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Search
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, ID, or mobile"
              />
            </label>
            <label className="flex min-w-[8rem] flex-col gap-1 text-xs font-medium text-slate-600">
              Gender
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label className="flex min-w-[8rem] flex-col gap-1 text-xs font-medium text-slate-600">
              Payment
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>
            <label className="flex min-w-[9rem] flex-col gap-1 text-xs font-medium text-slate-600">
              From
              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>
            <label className="flex min-w-[9rem] flex-col gap-1 text-xs font-medium text-slate-600">
              To
              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setGender("");
                  setStatus("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="self-end rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* ── TABLE ───────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    "ID",
                    "Name",
                    "Gender",
                    "Age",
                    "Mobile",
                    "Submitted",
                    "Biodata",
                    "Payment Proof",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-sm">Loading submissions…</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium">No submissions found</p>
                        {hasActiveFilters && (
                          <p className="text-xs">Try adjusting your filters</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-slate-800">
                          {r.submissionCode}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {r.fullName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.gender === "Male" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-pink-50 text-pink-700 border border-pink-200"}`}>
                          {r.gender}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {r.age}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-700">
                        {r.mobileNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <br />
                        <span className="text-xs">
                          {new Date(r.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={fileUrl(r.biodataFileKey)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={fileUrl(r.paymentScreenshotKey)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Screenshot
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.paymentStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative" ref={openMenuId === r.id ? menuRef : null}>
                          <button
                            type="button"
                            aria-label="Row actions"
                            disabled={savingId === r.id || deletingId === r.id}
                            onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                          >
                            {savingId === r.id || deletingId === r.id ? (
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            )}
                          </button>

                          {openMenuId === r.id && (
                            <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                              <div className="p-1">
                                <button
                                  type="button"
                                  onClick={() => { setOpenMenuId(null); void setPaymentStatus(r.id, "Verified"); }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                                >
                                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Mark Verified
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setOpenMenuId(null); void setPaymentStatus(r.id, "Rejected"); }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Mark Rejected
                                </button>
                                {r.paymentStatus !== "Pending" && (
                                  <button
                                    type="button"
                                    onClick={() => { setOpenMenuId(null); void setPaymentStatus(r.id, "Pending"); }}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                  >
                                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Reset to Pending
                                  </button>
                                )}
                              </div>
                              <div className="border-t border-slate-100" />
                              <div className="p-1">
                                <button
                                  type="button"
                                  onClick={() => { setOpenMenuId(null); void deleteSubmission(r.id); }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete Entry
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && rows.length > 0 && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Showing {rows.length} submission{rows.length !== 1 ? "s" : ""} ·
            Verify UPI payments in your bank app before marking as verified.
          </p>
        )}
      </div>
    </div>
  );
}
