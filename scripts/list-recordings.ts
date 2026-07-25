import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  const recordings = await prisma.classRecording.findMany({
    orderBy: { classNumber: "asc" },
  });
  console.log("Total recordings in database:", recordings.length);
  console.log(JSON.stringify(recordings, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
