import NextAuth from "next-auth";
import type { Session, User } from "@auth/core/types";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";

const authSecret = getAuthSecret();

// @ts-expect-error — next-auth@5 default export is callable at runtime; types + "moduleResolution": "bundler" currently lose the call signature.
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email },
        });
        if (!admin) return null;

        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok) return null;

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user) {
        session.user.email =
          (token.email as string | undefined) ?? session.user.email;
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
});
