import type { Metadata } from "next";
import { AppProviders } from "@/components/AppProviders";
import { PublicShell } from "@/components/PublicShell";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prayaas — Biodata & registration",
  description:
    "Prayaas — submit matrimony biodata and registration. रिश्तों को जोड़ने का प्रयास।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <AppProviders>
          <PublicShell>{children}</PublicShell>
        </AppProviders>
      </body>
    </html>
  );
}
