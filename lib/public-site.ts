import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export type PublicSiteDisplay = {
  communityName: string;
  upiId: string;
  feeInr: number;
  /** Payment UPI QR — static path or `/api/public/qr/payment` */
  qrSrc: string;
  /** Contact QR (admin uploaded) used to save the community contact / open WhatsApp */
  contactQrSrc: string | null;
  /** Contact phone applicants should save to send biodata in future */
  contactPhone: string | null;
};

export async function getPublicSiteDisplay(): Promise<PublicSiteDisplay> {
  const env = getSiteConfig();
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const upiId = row?.upiId?.trim() ? row.upiId.trim() : env.upiId;
  const feeInr =
    row?.registrationFeeInr != null ? row.registrationFeeInr : env.feeInr;
  const contactPhone = row?.contactPhone?.trim() || null;

  return {
    communityName: env.communityName,
    upiId,
    feeInr: Number.isFinite(feeInr) ? feeInr : 501,
    qrSrc: row?.paymentQrFileKey ? "/api/public/qr/payment" : env.qrSrc,
    contactQrSrc: row?.whatsappQrFileKey
      ? "/api/public/qr/whatsapp"
      : null,
    contactPhone,
  };
}
