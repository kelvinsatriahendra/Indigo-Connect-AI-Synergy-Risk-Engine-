import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const logoMap: Record<string, string> = {
  "s1": "/startups/logee.jpg",
  "s2": "/startups/agrolink.png",
  "s3": "/startups/finaccess.png",
  "s4": "/startups/edukita.png",
  "s5": "/startups/healthsync.png",
  "s6": "/startups/greenenergy.png",
  "s7": "/startups/tourlocal.png",
  "s8": "/startups/paydesa.png",
};

async function main() {
  for (const [id, logoUrl] of Object.entries(logoMap)) {
    await prisma.startup.update({
      where: { id },
      data: { logoUrl },
    });
    console.log(`Updated ${id} -> ${logoUrl}`);
  }
  console.log("Done!");
  await prisma.$disconnect();
}

main();
