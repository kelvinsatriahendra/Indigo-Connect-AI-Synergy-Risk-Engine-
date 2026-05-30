import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const startups = await prisma.startup.findMany({
    select: { id: true, name: true, sector: true, logoUrl: true }
  });
  console.log(JSON.stringify(startups, null, 2));
  await prisma.$disconnect();
}

main();
