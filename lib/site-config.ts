export function getSiteConfig() {
  return {
    communityName:
      process.env.NEXT_PUBLIC_COMMUNITY_NAME ?? "Prayaas",
    upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "your-community@upi",
    feeInr: Number(process.env.NEXT_PUBLIC_REGISTRATION_FEE_INR ?? "501"),
    qrSrc: process.env.NEXT_PUBLIC_UPI_QR_IMAGE ?? "/upi-qr.svg",
  };
}
