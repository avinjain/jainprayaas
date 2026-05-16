import { NextResponse } from "next/server";
import { saveUploadedFile, type UploadKind } from "@/lib/storage";

/**
 * Optional two-step upload: POST multipart with fields `kind` (biodata|payment) and `file`.
 * Returns `{ key }` for use with a future submit endpoint if the client prefers splitting uploads.
 * The default public flow posts everything to POST /api/submissions instead.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const kindRaw = formData.get("kind");
    const file = formData.get("file");

    if (kindRaw !== "biodata" && kindRaw !== "payment") {
      return NextResponse.json(
        { error: "kind must be biodata or payment" },
        { status: 400 },
      );
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const kind = kindRaw as UploadKind;
    const saved = await saveUploadedFile(kind, file);
    return NextResponse.json({ key: saved.key });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
