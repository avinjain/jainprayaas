import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteUploadFile,
  saveUploadedFile,
} from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) {
    return NextResponse.json({ error: "Settings missing" }, { status: 500 });
  }

  return NextResponse.json({
    upiId: row.upiId ?? "",
    registrationFeeInr:
      row.registrationFeeInr != null ? String(row.registrationFeeInr) : "",
    contactPhone: row.contactPhone ?? "",
    hasPaymentQr: Boolean(row.paymentQrFileKey),
    hasWhatsappQr: Boolean(row.whatsappQrFileKey),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const existing = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  let paymentQrFileKey = existing.paymentQrFileKey;
  let whatsappQrFileKey = existing.whatsappQrFileKey;

  const paymentQr = formData.get("paymentQr");
  if (paymentQr instanceof File && paymentQr.size > 0) {
    try {
      const saved = await saveUploadedFile("site-payment-qr", paymentQr);
      deleteUploadFile(existing.paymentQrFileKey);
      paymentQrFileKey = saved.key;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const whatsappQr = formData.get("whatsappQr");
  if (whatsappQr instanceof File && whatsappQr.size > 0) {
    try {
      const saved = await saveUploadedFile("site-whatsapp-qr", whatsappQr);
      deleteUploadFile(existing.whatsappQrFileKey);
      whatsappQrFileKey = saved.key;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const data: Prisma.SiteSettingsUpdateInput = {
    paymentQrFileKey,
    whatsappQrFileKey,
  };

  const upiId = formData.get("upiId");
  if (typeof upiId === "string") {
    const t = upiId.trim();
    data.upiId = t.length ? t : null;
  }

  const feeRaw = formData.get("registrationFeeInr");
  if (typeof feeRaw === "string") {
    const t = feeRaw.trim();
    if (t.length === 0) {
      data.registrationFeeInr = null;
    } else {
      const n = Number.parseInt(t, 10);
      if (Number.isNaN(n) || n < 1) {
        return NextResponse.json(
          { error: "Registration fee must be a positive number" },
          { status: 400 },
        );
      }
      data.registrationFeeInr = n;
    }
  }

  const contactPhone = formData.get("contactPhone");
  if (typeof contactPhone === "string") {
    const t = contactPhone.replace(/\s+/g, "").trim();
    if (t.length === 0) {
      data.contactPhone = null;
    } else if (!/^\+?[0-9]{8,15}$/.test(t)) {
      return NextResponse.json(
        { error: "Contact phone must be 8–15 digits (optionally starting with +)" },
        { status: 400 },
      );
    } else {
      data.contactPhone = t;
    }
  }

  await prisma.siteSettings.update({
    where: { id: 1 },
    data,
  });

  return NextResponse.json({ ok: true });
}
