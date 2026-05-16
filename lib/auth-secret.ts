/** Shared secret for JWT session signing (NextAuth + middleware getToken). */
export function getAuthSecret(): string {
  const adminSecret = process.env.AUTH_SECRET;
  const isProdRuntime =
    process.env.NODE_ENV === "production" &&
    process.env.npm_lifecycle_event !== "build";

  if (isProdRuntime && !adminSecret) {
    throw new Error(
      "AUTH_SECRET must be set when running the production server",
    );
  }

  return adminSecret ?? "dev-or-build-placeholder-change-me";
}
