import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = join(process.cwd(), "data", "uploads");

export type UploadKind =
  | "biodata"
  | "payment"
  | "site-payment-qr"
  | "site-whatsapp-qr";

const ALLOWED_BIODATA = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

const ALLOWED_PAYMENT = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const ALLOWED_QR = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_BIODATA = 10 * 1024 * 1024;
const MAX_PAYMENT = 5 * 1024 * 1024;
const MAX_QR = 3 * 1024 * 1024;

const UPLOAD_DIRS: UploadKind[] = [
  "biodata",
  "payment",
  "site-payment-qr",
  "site-whatsapp-qr",
];

function extForMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "application/pdf") return "pdf";
  if (m === "application/msword") return "doc";
  if (
    m ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  return "bin";
}

export function ensureUploadDirs(): void {
  for (const dir of UPLOAD_DIRS) {
    const p = join(UPLOAD_ROOT, dir);
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
  }
}

export async function saveUploadedFile(
  kind: UploadKind,
  file: File,
): Promise<{ key: string; mime: string }> {
  ensureUploadDirs();
  const mime = file.type || "application/octet-stream";

  if (kind === "biodata") {
    if (!ALLOWED_BIODATA.has(mime)) {
      throw new Error("Biodata must be PDF, DOC, DOCX, JPG, or PNG");
    }
    if (file.size > MAX_BIODATA) {
      throw new Error("Biodata file must be 10 MB or smaller");
    }
  } else if (kind === "payment") {
    if (!ALLOWED_PAYMENT.has(mime)) {
      throw new Error("Payment proof must be JPG, PNG, or PDF");
    }
    if (file.size > MAX_PAYMENT) {
      throw new Error("Payment screenshot must be 5 MB or smaller");
    }
  } else {
    if (!ALLOWED_QR.has(mime)) {
      throw new Error("QR image must be JPG, PNG, or WebP");
    }
    if (file.size > MAX_QR) {
      throw new Error("QR image must be 3 MB or smaller");
    }
  }

  const ext = extForMime(mime);
  const id = randomUUID();
  const key = `${kind}/${id}.${ext}`;
  const abs = join(UPLOAD_ROOT, kind, `${id}.${ext}`);
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(abs, buf);
  return { key, mime };
}

const ALLOWED_TOP_DIRS = new Set<string>([
  "biodata",
  "payment",
  "site-payment-qr",
  "site-whatsapp-qr",
]);

export function deleteUploadFile(key: string | null | undefined): void {
  if (!key) return;
  const abs = getAbsolutePathForKey(key);
  if (!abs) return;
  try {
    unlinkSync(abs);
  } catch {
    /* ignore */
  }
}

export function readUploadBytes(
  key: string,
): { bytes: Buffer; filename: string } | null {
  const abs = getAbsolutePathForKey(key);
  if (!abs) return null;
  const filename = key.split("/").pop() ?? "file";
  return { bytes: readFileSync(abs), filename };
}

function getAbsolutePathForKey(key: string): string | null {
  if (!key || key.includes("..") || key.startsWith("/")) {
    return null;
  }
  const parts = key.split("/");
  if (parts.length !== 2) return null;
  const [dir, file] = parts;
  if (!ALLOWED_TOP_DIRS.has(dir)) return null;
  if (!/^[\w.-]+$/.test(file)) return null;
  const abs = join(UPLOAD_ROOT, dir, file);
  if (!existsSync(abs)) return null;
  return abs;
}

export function mimeForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}
