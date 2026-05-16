import type { Prisma, Submission } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function parseAdminSubmissionFilters(searchParams: URLSearchParams): {
  where: Prisma.SubmissionWhereInput;
  q: string;
} {
  const gender = searchParams.get("gender");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: Prisma.SubmissionWhereInput = {};

  if (gender === "Male" || gender === "Female") {
    where.gender = gender;
  }
  if (status === "Pending" || status === "Verified" || status === "Rejected") {
    where.paymentStatus = status;
  }

  const createdAt: Prisma.DateTimeFilter = {};
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!Number.isNaN(d.getTime())) {
      createdAt.gte = d;
    }
  }
  if (dateTo) {
    const d = new Date(dateTo);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      createdAt.lte = d;
    }
  }
  if (Object.keys(createdAt).length > 0) {
    where.createdAt = createdAt;
  }

  const q = (searchParams.get("q") ?? "").trim();

  return { where, q };
}

export async function listSubmissionsForAdmin(
  searchParams: URLSearchParams,
): Promise<Submission[]> {
  const { where, q } = parseAdminSubmissionFilters(searchParams);
  const rows = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  if (!q) return rows;

  const qq = q.toLowerCase();
  return rows.filter(
    (r) =>
      r.fullName.toLowerCase().includes(qq) ||
      r.mobileNumber.includes(q) ||
      r.submissionCode.toLowerCase().includes(qq),
  );
}
