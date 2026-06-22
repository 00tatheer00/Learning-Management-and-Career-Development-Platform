import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types/portal";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
    sessionId?: string;
    sessionInvalid?: boolean;
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    sessionId?: string;
    sessionInvalid?: boolean;
  }
}
