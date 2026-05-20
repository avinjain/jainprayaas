import { randomBytes } from "node:crypto";

/** Human-friendly charset: no 0/O, 1/I/L to reduce confusion. */
const CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const PREFIX = "JP";

/** e.g. JP-A3K9P2 (short, easy to read over phone) */
export function generateSubmissionCode(): string {
  const buf = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CHARSET[buf[i]! % CHARSET.length]!;
  }
  return `${PREFIX}-${suffix}`;
}
