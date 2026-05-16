import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSubmissionsForAdmin } from "@/lib/admin-submission-filters";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const submissions = await listSubmissionsForAdmin(searchParams);

  return NextResponse.json({ submissions });
}
