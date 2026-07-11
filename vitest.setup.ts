process.env.DATABASE_URL ??= "mongodb://localhost:27017/eest-vitest";
process.env.NEXTAUTH_SECRET ??= "vitest-nextauth-secret";
process.env.PORTAL_PASSWORD_SECRET ??= "vitest-portal-password-secret";

import { vi } from "vitest";

vi.mock("server-only", () => ({}));
