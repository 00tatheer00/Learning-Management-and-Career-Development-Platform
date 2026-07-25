import { PrismaClient } from "@prisma/client";

async function main() {
  const dbUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No DATABASE_URL or DATABASE_URL_DIRECT found in env.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });

  try {
    const tokens = await prisma.passwordResetToken.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`Latest 5 tokens in DB:`);
    for (const t of tokens) {
      console.log(`- Email: ${t.email}, Created: ${t.createdAt}, Expires: ${t.expiresAt}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
