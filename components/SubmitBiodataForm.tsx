"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  communityName: string;
  upiId: string;
  feeInr: number;
  qrSrc: string;
  contactQrSrc: string | null;
  contactPhone: string | null;
};

const FEE_DEFAULT = 501;

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

function formatPhone(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("+")) return raw;
  if (raw.length === 10) return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  return raw;
}

function whatsappLink(phone: string | null, text: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function SubmitBiodataForm({
  communityName,
  upiId,
  feeInr,
  qrSrc,
  contactQrSrc,
  contactPhone,
}: Props) {
  const fee = Number.isFinite(feeInr) ? feeInr : FEE_DEFAULT;

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [biodata, setBiodata] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [copied, setCopied] = useState<null | "upi" | "code" | "phone">(null);

  async function copyValue(value: string, kind: "upi" | "code" | "phone") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
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
    fd.set("mobileNumber", whatsappNumber);
    if (biodata) fd.set("biodata", biodata);

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
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  if (status === "success" && submissionId) {
    const displayPhone = formatPhone(contactPhone);
    const waLink = whatsappLink(
      contactPhone,
      `Hello! I have just registered with Prayaas. My reference ID is ${submissionId}. Please share details on next steps.`,
    );

    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-2 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-inner">
          <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Biodata Submitted</h2>
          <p className="mt-2 text-slate-600">{message}</p>
        </div>

        {/* JP transaction ID */}
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Your Payment Reference ID
          </p>
          <p className="mt-3 font-mono text-3xl font-bold tracking-wider text-amber-900 sm:text-4xl">
            {submissionId}
          </p>
          <p className="mt-3 text-xs text-amber-800/80">
            Enter this ID in the <strong>remarks / note</strong> field when you pay via UPI so we can match the payment to your biodata.
          </p>
          <button
            type="button"
            onClick={() => copyValue(submissionId, "code")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            {copied === "code" ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy ID
              </>
            )}
          </button>
        </div>

        {/* Payment instructions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💳</span>
            <h3 className="font-semibold text-slate-900">
              Pay registration fee ₹{fee}
            </h3>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Image
                  src={qrSrc}
                  alt="UPI QR code"
                  width={180}
                  height={180}
                  className="h-44 w-44 object-contain"
                  unoptimized={qrSrc.startsWith("/api/")}
                />
              </div>
              <p className="text-xs text-slate-500">Scan to pay</p>
            </div>
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
                onClick={() => copyValue(upiId, "upi")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                  copied === "upi"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-900 hover:border-amber-400 hover:bg-amber-50"
                }`}
              >
                {copied === "upi" ? "Copied!" : "Copy UPI ID"}
              </button>
              <ol className="list-inside list-decimal space-y-1 text-xs text-slate-500">
                <li>Open any UPI app (PhonePe, GPay, Paytm…)</li>
                <li>Pay ₹{fee} to the UPI ID above</li>
                <li>
                  Enter <span className="font-mono font-semibold text-slate-700">{submissionId}</span> in the
                  remarks/notes
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Contact info to save */}
        {(displayPhone || contactQrSrc) && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">📱</span>
              <h3 className="font-semibold text-slate-900">
                Save our contact for further communication
              </h3>
            </div>
            <p className="text-sm text-emerald-900/80">
              Save the number below — you can send your biodata or any future
              updates to this contact on WhatsApp.
            </p>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
              {contactQrSrc && (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
                    <Image
                      src={contactQrSrc}
                      alt="Contact QR code"
                      width={180}
                      height={180}
                      className="h-44 w-44 object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-emerald-800">Scan to save contact</p>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-3">
                {displayPhone && (
                  <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                      Contact Number
                    </p>
                    <p className="mt-1 break-all font-mono text-base font-semibold text-slate-900">
                      {displayPhone}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {contactPhone && (
                    <button
                      type="button"
                      onClick={() => copyValue(contactPhone, "phone")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                        copied === "phone"
                          ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                          : "border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100"
                      }`}
                    >
                      {copied === "phone" ? "Copied!" : "Copy number"}
                    </button>
                  )}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                      </svg>
                      Open WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Our team will verify your payment using the reference ID above and
          get in touch on your WhatsApp number within 24–48 hours.
        </div>

        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
            setSubmissionId(null);
            setFullName("");
            setGender("Male");
            setAge("");
            setWhatsappNumber("");
            setBiodata(null);
          }}
          className="mt-2 self-center text-sm font-medium text-amber-700 underline-offset-2 hover:underline"
        >
          Submit another biodata
        </button>
      </div>
    );
  }

  return (
    <form id="apply" onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* ── PERSONAL DETAILS ──────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white shadow-md">
            1
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Personal Details</p>
            <p className="text-xs text-slate-500">Tell us about yourself</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              required
              className="h-12 rounded-xl border border-slate-300 px-4 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="As per your documents"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>

          {/* Gender + Age — always side-by-side, equal height */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gender" className="text-sm font-medium text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                required
                className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                className="h-12 rounded-xl border border-slate-300 px-4 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp" className="text-sm font-medium text-slate-700">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 select-none">
                +91
              </span>
              <input
                id="whatsapp"
                required
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                placeholder="10-digit WhatsApp number"
                className="h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 text-base text-slate-900 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={whatsappNumber}
                onChange={(e) =>
                  setWhatsappNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                autoComplete="tel"
              />
            </div>
            <p className="text-xs text-slate-500">
              We&apos;ll use this to send you match updates on WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* ── BIODATA UPLOAD ──────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white shadow-md">
            2
          </div>
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

      {/* ── PAYMENT NOTE ──────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Payment after submission
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Once you submit, you&apos;ll receive a unique <span className="font-mono font-semibold">JP-XXXXXX</span> reference ID along with UPI payment details. Use that ID as the remark when paying ₹{fee} so we can match your payment to your biodata.
            </p>
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
