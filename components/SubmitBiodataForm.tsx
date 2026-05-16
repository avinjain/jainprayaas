"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  communityName: string;
  upiId: string;
  feeInr: number;
  qrSrc: string;
  /** Public URL for WhatsApp group QR, if configured by admin */
  whatsappQrSrc: string | null;
};

const FEE_DEFAULT = 501;

function StepBadge({
  num,
  active,
  done,
}: {
  num: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
        done
          ? "bg-emerald-500 text-white"
          : active
            ? "bg-amber-600 text-white shadow-md"
            : "bg-slate-200 text-slate-500"
      }`}
    >
      {done ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        num
      )}
    </div>
  );
}

function FileDropZone({
  id,
  label,
  hint,
  accept,
  required,
  file,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  required?: boolean;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onChange(f);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? "border-amber-400 bg-amber-50"
            : file
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50"
        }`}
      >
        {file ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-emerald-700">{file.name}</p>
            <p className="text-xs text-slate-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB · click to change
            </p>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">
              Drop file or <span className="text-amber-700">browse</span>
            </p>
            <p className="text-xs text-slate-400">{hint}</p>
          </>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          required={required}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

export function SubmitBiodataForm({
  communityName,
  upiId,
  feeInr,
  qrSrc,
  whatsappQrSrc,
}: Props) {
  const fee = Number.isFinite(feeInr) ? feeInr : FEE_DEFAULT;

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [biodata, setBiodata] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const step1Done = fullName.trim() && gender && age && mobileNumber.length === 10;
  const step2Done = biodata !== null;
  const step3Done = paymentScreenshot !== null;

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);
    setSubmissionId(null);

    const fd = new FormData();
    fd.set("fullName", fullName);
    fd.set("gender", gender);
    fd.set("age", age);
    fd.set("mobileNumber", mobileNumber);
    if (biodata) fd.set("biodata", biodata);
    if (paymentScreenshot) fd.set("paymentScreenshot", paymentScreenshot);

    try {
      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(typeof data.error === "string" ? data.error : "Submission failed");
        return;
      }
      setStatus("success");
      setMessage(
        typeof data.message === "string" ? data.message : "Thank you for your submission.",
      );
      if (typeof data.submissionCode === "string") setSubmissionId(data.submissionCode);
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  /* ─────────────────────────── SUCCESS STATE ─────────────────────────── */
  if (status === "success") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 text-center">
        {/* animated tick */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-inner">
          <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">Biodata Submitted!</h2>
        <p className="mt-2 text-slate-500">{message}</p>

        {submissionId && (
          <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Your Submission ID
            </p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-slate-900">
              {submissionId}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Save this ID to track your registration status.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Our team will verify your payment and get in touch on your registered
          mobile number within 24–48 hours.
        </div>

        {whatsappQrSrc && (
          <div className="mt-8 w-full rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">💬</span>
              <h3 className="text-lg font-semibold text-slate-900">Join WhatsApp Group</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Scan this QR code with WhatsApp to join our community group and get
              updates.
            </p>
            <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
              <Image
                src={whatsappQrSrc}
                alt="WhatsApp group QR code"
                width={220}
                height={220}
                className="h-52 w-52 object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
            setSubmissionId(null);
            setFullName("");
            setGender("Male");
            setAge("");
            setMobileNumber("");
            setBiodata(null);
            setPaymentScreenshot(null);
          }}
          className="mt-8 text-sm font-medium text-amber-700 underline-offset-2 hover:underline"
        >
          Submit another biodata
        </button>
      </div>
    );
  }

  /* ─────────────────────────── MAIN FORM ─────────────────────────────── */
  return (
    <form id="apply" onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* ── STEP 1: PERSONAL DETAILS ──────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* step header */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <StepBadge num={1} active={true} done={!!step1Done} />
          <div>
            <p className="text-sm font-semibold text-slate-900">Personal Details</p>
            <p className="text-xs text-slate-500">Tell us about yourself</p>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="As per your documents"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gender" className="text-sm font-medium text-slate-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              required
              className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="age" className="text-sm font-medium text-slate-700">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              id="age"
              required
              type="number"
              min={18}
              max={80}
              className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="e.g. 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="mobile" className="text-sm font-medium text-slate-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 select-none">
                +91
              </span>
              <input
                id="mobile"
                required
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                placeholder="10-digit number"
                className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                autoComplete="tel"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 2: BIODATA UPLOAD ──────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <StepBadge num={2} active={!!step1Done} done={!!step2Done} />
          <div>
            <p className="text-sm font-semibold text-slate-900">Upload Biodata</p>
            <p className="text-xs text-slate-500">PDF, Word, or image — max 10 MB</p>
          </div>
        </div>
        <div className="p-5">
          <FileDropZone
            id="biodata"
            label="Biodata File"
            hint="PDF · DOC · DOCX · JPG · PNG — max 10 MB"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
            required
            file={biodata}
            onChange={setBiodata}
          />
        </div>
      </div>

      {/* ── STEP 3: PAYMENT ──────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50 px-5 py-4">
          <StepBadge num={3} active={!!step2Done} done={!!step3Done} />
          <div>
            <p className="text-sm font-semibold text-slate-900">Pay Registration Fee</p>
            <p className="text-xs text-slate-500">
              ₹{fee} via UPI · then upload screenshot
            </p>
          </div>
        </div>
        <div className="p-5">
          {/* amount highlight */}
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3">
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">
                Amount to pay
              </p>
              <p className="text-2xl font-bold text-amber-900">₹{fee}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* QR */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Image
                  src={qrSrc}
                  alt="UPI QR code"
                  width={180}
                  height={180}
                  className="h-44 w-44 object-contain"
                  priority
                  unoptimized={qrSrc.startsWith("/api/")}
                />
              </div>
              <p className="text-xs text-slate-500">Scan to pay</p>
            </div>

            {/* UPI ID + instructions */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  UPI ID
                </p>
                <p className="mt-1 break-all font-mono text-base font-semibold text-slate-900">
                  {upiId}
                </p>
              </div>
              <button
                type="button"
                onClick={copyUpi}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition active:scale-95 ${
                  copied
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-900 hover:border-amber-400 hover:bg-amber-50"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy UPI ID
                  </>
                )}
              </button>
              <ol className="list-inside list-decimal space-y-1 text-xs text-slate-500">
                <li>Open your UPI app (PhonePe, GPay, Paytm…)</li>
                <li>Scan the QR or enter the UPI ID above</li>
                <li>Pay ₹{fee} and save the screenshot</li>
                <li>Upload the screenshot below</li>
              </ol>
            </div>
          </div>

          <div className="mt-5">
            <FileDropZone
              id="paymentScreenshot"
              label="Payment Screenshot"
              hint="JPG · PNG · PDF — max 5 MB"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              required
              file={paymentScreenshot}
              onChange={setPaymentScreenshot}
            />
          </div>
        </div>
      </div>

      {/* ── ERROR ─────────────────────────────────────────── */}
      {status === "error" && message && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}

      {/* ── SUBMIT ────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-900 to-amber-700 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting…
          </>
        ) : (
          <>
            Submit Biodata
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        By submitting, you agree to let {communityName} share your biodata within
        the Jain matrimony community.
      </p>
    </form>
  );
}
