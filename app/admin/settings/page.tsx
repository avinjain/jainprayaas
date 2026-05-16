"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function QrUploadZone({
  id,
  label,
  description,
  currentSrc,
  currentAlt,
  file,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  currentSrc?: string;
  currentAlt: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const preview = file ? URL.createObjectURL(file) : null;
  const displaySrc = preview ?? currentSrc;

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onChange(f);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* current / preview */}
        {displaySrc ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 shadow-sm">
              <Image
                src={displaySrc}
                alt={currentAlt}
                width={120}
                height={120}
                className="h-28 w-28 object-contain"
                unoptimized
              />
            </div>
            {preview ? (
              <span className="text-xs font-medium text-amber-700">Preview</span>
            ) : (
              <span className="text-xs text-slate-500">Current</span>
            )}
          </div>
        ) : null}

        {/* drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
            dragging
              ? "border-amber-400 bg-amber-50"
              : file
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-300 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50"
          }`}
        >
          {file ? (
            <>
              <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-emerald-700">{file.name}</p>
              <p className="text-xs text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB · click to change
              </p>
            </>
          ) : (
            <>
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600">
                Drop or <span className="font-medium text-amber-700">browse</span>
              </p>
              <p className="text-xs text-slate-400">PNG · JPG · WebP — max 3 MB</p>
            </>
          )}
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminSiteSettingsPage() {
  const [upiId, setUpiId] = useState("");
  const [fee, setFee] = useState("");
  const [hasPaymentQr, setHasPaymentQr] = useState(false);
  const [hasWhatsappQr, setHasWhatsappQr] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [whatsappFile, setWhatsappFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/site-settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setUpiId(typeof data.upiId === "string" ? data.upiId : "");
          setFee(typeof data.registrationFeeInr === "string" ? data.registrationFeeInr : "");
          setHasPaymentQr(Boolean(data.hasPaymentQr));
          setHasWhatsappQr(Boolean(data.hasWhatsappQr));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("upiId", upiId);
      fd.set("registrationFeeInr", fee);
      if (paymentFile) fd.set("paymentQr", paymentFile);
      if (whatsappFile) fd.set("whatsappQr", whatsappFile);

      const res = await fetch("/api/admin/site-settings", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: "error",
          text: typeof data.error === "string" ? data.error : "Could not save settings",
        });
        return;
      }

      setPaymentFile(null);
      setWhatsappFile(null);
      setMessage({ type: "success", text: "Settings saved. Changes are now live on the public page." });

      const res2 = await fetch("/api/admin/site-settings");
      if (res2.ok) {
        const d = await res2.json();
        setUpiId(typeof d.upiId === "string" ? d.upiId : "");
        setFee(typeof d.registrationFeeInr === "string" ? d.registrationFeeInr : "");
        setHasPaymentQr(Boolean(d.hasPaymentQr));
        setHasWhatsappQr(Boolean(d.hasWhatsappQr));
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading settings…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure UPI payment details and QR codes shown to applicants on the
          public registration page.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {/* ── PAYMENT DETAILS ─────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <p className="font-semibold text-slate-900">Payment Details</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Override the environment defaults for UPI ID and registration fee.
            </p>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="upiId" className="text-sm font-medium text-slate-700">
                UPI ID
                <span className="ml-1 text-xs text-slate-400">(optional override)</span>
              </label>
              <input
                id="upiId"
                className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="community@upi"
              />
              <p className="text-xs text-slate-400">
                Leave blank to use the{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_UPI_ID</code>{" "}
                env variable.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fee" className="text-sm font-medium text-slate-700">
                Registration Fee (₹)
                <span className="ml-1 text-xs text-slate-400">(optional override)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 select-none">
                  ₹
                </span>
                <input
                  id="fee"
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-4 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="501"
                />
              </div>
              <p className="text-xs text-slate-400">Leave blank to use env default.</p>
            </div>
          </div>
        </div>

        {/* ── QR CODES ──────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <p className="font-semibold text-slate-900">QR Codes</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Upload QR images shown to applicants on the registration form and
              after submission.
            </p>
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            <div className="p-5">
              <QrUploadZone
                id="paymentQr"
                label="UPI Payment QR"
                description="Shown on the registration form so applicants can scan and pay."
                currentSrc={hasPaymentQr ? "/api/public/qr/payment" : undefined}
                currentAlt="Current payment QR"
                file={paymentFile}
                onChange={setPaymentFile}
              />
            </div>
            <div className="p-5">
              <QrUploadZone
                id="whatsappQr"
                label="WhatsApp Group QR"
                description="Shown on the success screen after submission so applicants can join your group."
                currentSrc={hasWhatsappQr ? "/api/public/qr/whatsapp" : undefined}
                currentAlt="Current WhatsApp QR"
                file={whatsappFile}
                onChange={setWhatsappFile}
              />
            </div>
          </div>
        </div>

        {/* ── MESSAGE ──────────────────────────────── */}
        {message && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-sm" role="status">
              {message.text}
            </p>
          </div>
        )}

        {/* ── SAVE BUTTON ──────────────────────────── */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-amber-600 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
