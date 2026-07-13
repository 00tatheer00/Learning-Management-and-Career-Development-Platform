import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { verifyStudentLoginPassword } from "@/lib/auth/student-login-password";
import {
  clearActiveSession,
  isActiveSession,
  recordUserLogin,
  rotateActiveSession,
} from "@/lib/auth/session-control";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types/portal";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("[auth] Login rejected: invalid credentials format");
            return null;
          }

          const email = parsed.data.email.toLowerCase();
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.error("[auth] Login rejected: no account found for", email);
            return null;
          }
          if (!user.isActive) {
            console.error("[auth] Login rejected: account inactive for", email);
            return null;
          }

          const password = parsed.data.password.trim();
          const valid =
            user.role === "student"
              ? await verifyStudentLoginPassword(parsed.data.email, password)
              : await verifyPassword(password, user.passwordHash);

          if (!valid) {
            // verifyStudentLoginPassword already logs details for students
            if (user.role !== "student") {
              console.error("[auth] Login rejected: wrong password for", email, "(role:", user.role + ")");
            }
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] Login authorize exception:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
        token.sessionInvalid = false;

        const existing = await prisma.user.findUnique({
          where: { id: user.id },
          select: { firstLoginAt: true },
        });
        token.isFirstLogin = !existing?.firstLoginAt;

        await recordUserLogin(user.id);

        if (token.role === "student") {
          token.sessionId = await rotateActiveSession(user.id);
        }
      } else if (token.id && token.role === "student") {
        const valid = await isActiveSession(
          token.id as string,
          token.sessionId as string | undefined
        );
        token.sessionInvalid = !valid;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      session.sessionId = token.sessionId as string | undefined;
      session.sessionInvalid = Boolean(token.sessionInvalid);
      session.isFirstLogin = Boolean(token.isFirstLogin);

      if (token.sessionInvalid) {
        session.expires = new Date(0).toISOString();
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id && token.role === "student") {
        await clearActiveSession(token.id as string);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};
