import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export type PublicSiteDisplay = {
  communityName: string;
  upiId: string;
  feeInr: number;
  /** Payment UPI QR — static path or `/api/public/qr/payment` */
  qrSrc: string;
  whatsappQrSrc: string | null;
};

export async function getPublicSiteDisplay(): Promise<PublicSiteDisplay> {
  const env = getSiteConfig();
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const upiId = row?.upiId?.trim() ? row.upiId.trim() : env.upiId;
  const feeInr =
    row?.registrationFeeInr != null ? row.registrationFeeInr : env.feeInr;

  return {
    communityName: env.communityName,
    upiId,
    feeInr: Number.isFinite(feeInr) ? feeInr : 501,
    qrSrc: row?.paymentQrFileKey ? "/api/public/qr/payment" : env.qrSrc,
    whatsappQrSrc: row?.whatsappQrFileKey
      ? "/api/public/qr/whatsapp"
      : null,
  };
}
