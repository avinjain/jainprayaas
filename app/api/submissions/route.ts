import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSubmissionCode } from "@/lib/submission-code";
import { saveUploadedFile } from "@/lib/storage";
import { submissionFieldsSchema } from "@/lib/submission-validation";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const biodata = formData.get("biodata");
    const paymentScreenshot = formData.get("paymentScreenshot");

    if (!(biodata instanceof File) || biodata.size === 0) {
      return NextResponse.json(
        { error: "Biodata file is required" },
        { status: 400 },
      );
    }
    if (!(paymentScreenshot instanceof File) || paymentScreenshot.size === 0) {
      return NextResponse.json(
        { error: "Payment screenshot is required" },
        { status: 400 },
      );
    }

    const parsed = submissionFieldsSchema.safeParse({
      fullName: formData.get("fullName"),
      gender: formData.get("gender"),
      age: formData.get("age"),
      mobileNumber: formData.get("mobileNumber"),
    });

    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ?? "Please check the form and try again";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    let biodataKey: string;
    let paymentKey: string;
    try {
      const b = await saveUploadedFile("biodata", biodata);
      biodataKey = b.key;
      const p = await saveUploadedFile("payment", paymentScreenshot);
      paymentKey = p.key;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "File upload failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const baseData = {
      fullName: parsed.data.fullName,
      gender: parsed.data.gender,
      age: parsed.data.age,
      mobileNumber: parsed.data.mobileNumber,
      biodataFileKey: biodataKey,
      paymentScreenshotKey: paymentKey,
      paymentStatus: "Pending" as const,
    };

    let row: { submissionCode: string } | undefined;
    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const submissionCode = generateSubmissionCode();
      try {
        row = await prisma.submission.create({
          data: { ...baseData, submissionCode },
          select: { submissionCode: true },
        });
        break;
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          continue;
        }
        throw e;
      }
    }

    if (!row) {
      return NextResponse.json(
        { error: "Could not assign a submission ID. Please try again." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      submissionCode: row.submissionCode,
      message: "Thank you. Your biodata has been submitted.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
