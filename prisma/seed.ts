import { PrismaClient, Role, StartupStatus, PipelineStatus, AlertType, AlertSeverity } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();

// Demo users from auth.ts
const DEMO_USERS = [
  {
    id: "demo-admin-id",
    name: "Hendra Wijaya",
    email: "hendra.wijaya@telkom.co.id",
    nik: "940123",
    passwordHash: "$2b$10$r84H0sR36wQ1Jhjx.51Y.OSKQroRDncUlkD14NCf/JT5Ts4Q.GRxa", // admin123
    role: Role.ADMIN,
  },
  {
    id: "demo-synergy-id",
    name: "Rina Kusuma",
    email: "rina.kusuma@telkom.co.id",
    nik: "940789",
    passwordHash: "$2b$10$9ej0NlHfT6JqD8OjlxcLGuDn6nlQHKKu8heYnLvuOzbu67m1XWjC6", // synergy123
    role: Role.SYNERGY,
  },
  {
    id: "demo-founder-id",
    name: "Yusuf Pratama",
    email: "yusuf@antarestar.com",
    nik: "850456",
    passwordHash: "$2b$10$FnD1lqdqrsNR1Bp8SHgPCOjPzRWYeEBcwLzkJZzvRHeVl1YikRTAS", // founder123
    role: Role.FOUNDER,
  },
];

async function main() {
  console.log('Seeding Database...');

  // 1. Seed Users
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        nik: user.nik,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });
  }
  console.log('Users seeded.');

  // 2. Read JSON Files
  const startups = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/startups.json'), 'utf8'));
  const telkomBus = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/telkom-bus.json'), 'utf8'));
  const alerts = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/alerts.json'), 'utf8'));
  
  // 3. Seed Startups
  for (const s of startups) {
    await prisma.startup.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        founderName: s.founderName,
        sector: s.sector,
        batch: s.batch,
        description: s.description,
        status: StartupStatus.ACTIVE,
      },
    });
  }
  console.log('Startups seeded.');

  // 4. Seed Telkom BU
  for (const bu of telkomBus) {
    await prisma.telkomBU.upsert({
      where: { id: bu.id },
      update: {},
      create: {
        id: bu.id,
        name: bu.name,
        description: bu.description,
        sector: bu.sector,
        keywords: bu.keywords || [],
      },
    });
  }
  console.log('Telkom BUs seeded.');

  // 5. Seed Alerts (Optional)
  for (const a of alerts) {
    if (!a.startupId) continue;
    await prisma.alertLog.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        startupId: a.startupId,
        alertType: a.type === 'GROWTH_DROP' ? AlertType.GROWTH_DROP : AlertType.RISK,
        severity: a.severity === 'HIGH' ? AlertSeverity.HIGH : a.severity === 'LOW' ? AlertSeverity.LOW : AlertSeverity.MEDIUM,
        emailSentTo: "founder@example.com",
        aiSummary: a.message,
        sentAt: a.date ? new Date(a.date) : new Date(),
      },
    });
  }
  console.log('Alerts seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
