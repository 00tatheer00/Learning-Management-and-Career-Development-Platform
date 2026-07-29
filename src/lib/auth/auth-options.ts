import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
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

const DEFAULT_SYSTEM_ACCOUNTS = [
  {
    id: "admin-1",
    email: "admin@eest.com",
    defaultPassword: process.env.SEED_ADMIN_PASSWORD?.trim() || undefined,
    role: "admin" as const,
    name: "Tatheer Hussain",
    phone: "03374005515",
  },
  {
    id: "admin-komal",
    email: "komal@eest.com",
    defaultPassword: process.env.SEED_KOMAL_PASSWORD?.trim() || undefined,
    role: "admin" as const,
    name: "Komal",
    phone: "03115969527",
  },
  {
    id: "trainer-tatheer",
    email: "tatheer@eest.com",
    defaultPassword: process.env.SEED_TRAINER_TATHEER_PASSWORD?.trim() || undefined,
    role: "trainer" as const,
    name: "S Tatheer Hussain",
    phone: "03374005515",
    programSlug: "web-development",
    trainerId: "trainer-tatheer",
  },
  {
    id: "trainer-talha",
    email: "talha@eest.com",
    defaultPassword: process.env.SEED_TRAINER_TALHA_PASSWORD?.trim() || undefined,
    role: "trainer" as const,
    name: "Talha Iqbal",
    phone: "03001234567",
    programSlug: "app-development",
    trainerId: "trainer-talha",
  },
  {
    id: "trainer-faiza",
    email: "faiza@eest.com",
    defaultPassword: process.env.SEED_TRAINER_FAIZA_PASSWORD?.trim() || undefined,
    role: "trainer" as const,
    name: "Faiza Ghaffar",
    phone: "03000000000",
    programSlug: "artificial-intelligence",
    trainerId: "trainer-faiza",
  },
];

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
          if (!parsed.success) return null;

          const emailLower = parsed.data.email.toLowerCase().trim();
          const password = parsed.data.password.trim();

          let user = await prisma.user.findUnique({
            where: { email: emailLower },
          });

          const defaultAcc = DEFAULT_SYSTEM_ACCOUNTS.find(
            (acc) => acc.email === emailLower
          );

          if (!user && defaultAcc?.defaultPassword && password === defaultAcc.defaultPassword) {
            const passwordHash = await hashPassword(defaultAcc.defaultPassword);
            try {
              user = await prisma.user.create({
                data: {
                  id: defaultAcc.id,
                  email: defaultAcc.email,
                  name: defaultAcc.name,
                  role: defaultAcc.role,
                  phone: defaultAcc.phone,
                  programSlug: defaultAcc.programSlug,
                  trainerId: defaultAcc.trainerId,
                  passwordHash,
                  isActive: true,
                },
              });
            } catch (e) {
              console.error("Auto-provisioning trainer user failed:", e);
              user = await prisma.user.findFirst({
                where: { OR: [{ email: emailLower }, { id: defaultAcc.id }] },
              });
            }
          }

          if (!user || !user.isActive) return null;

          let valid =
            user.role === "student"
              ? await verifyStudentLoginPassword(emailLower, password)
              : await verifyPassword(password, user.passwordHash);

          if (!valid && defaultAcc?.defaultPassword && password === defaultAcc.defaultPassword) {
            const newHash = await hashPassword(defaultAcc.defaultPassword);
            await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: newHash, isActive: true },
            });
            valid = true;
          }

          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Login authorize error:", error);
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
