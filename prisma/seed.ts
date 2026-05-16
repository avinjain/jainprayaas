import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-me-after-setup";
  if (password === "change-me-after-setup") {
    console.warn(
      "Using default ADMIN_PASSWORD. Set ADMIN_PASSWORD in .env for production.",
    );
  }
  const hash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash: hash },
    update: { passwordHash: hash },
  });
  console.info(`Seeded admin: ${email}`);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  console.info("Site settings row ready (id: 1).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
