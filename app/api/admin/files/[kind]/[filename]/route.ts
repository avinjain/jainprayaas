import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mimeForFilename, readUploadBytes } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string; filename: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kind, filename } = await context.params;
  if (kind !== "biodata" && kind !== "payment") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const key = `${kind}/${filename}`;
  const file = readUploadBytes(key);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": mimeForFilename(file.filename),
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
