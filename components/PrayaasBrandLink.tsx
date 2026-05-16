"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  /** Show Hindi tagline on sm+ (default true). */
  showTagline?: boolean;
};

export function PrayaasBrandLink({ showTagline = true }: Props) {
  const brand =
    typeof process.env.NEXT_PUBLIC_COMMUNITY_NAME === "string" &&
    process.env.NEXT_PUBLIC_COMMUNITY_NAME.trim().length > 0
      ? process.env.NEXT_PUBLIC_COMMUNITY_NAME.trim()
      : "Prayaas";

  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center rounded-lg py-1 transition-opacity hover:opacity-80"
      aria-label={`${brand} — home`}
    >
      <Image
        src="/prayaas-logo.png"
        alt={brand}
        width={120}
        height={48}
        className={`object-contain ${showTagline ? "h-10 w-auto sm:h-12" : "h-9 w-auto sm:h-10"}`}
        priority
      />
    </Link>
  );
}
