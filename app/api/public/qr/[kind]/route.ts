import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mimeForFilename, readUploadBytes } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const { kind } = await context.params;
  if (kind !== "payment" && kind !== "whatsapp") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const key =
    kind === "payment" ? row?.paymentQrFileKey : row?.whatsappQrFileKey;
  if (!key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = readUploadBytes(key);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": mimeForFilename(file.filename),
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
