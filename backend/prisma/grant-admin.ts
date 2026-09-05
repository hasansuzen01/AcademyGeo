/**
 * Promotes an existing account to admin.
 *
 * Run with: npm run admin:grant --workspace backend -- someone@example.com
 *
 * The account has to exist, which means the person must have signed in with
 * Google at least once.
 */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run admin:grant --workspace backend -- someone@example.com');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const user = await prisma.user.findUnique({ where: { email } });

if (!user) {
  console.error(`No account for ${email}. Ask them to sign in with Google first.`);
  process.exitCode = 1;
} else {
  await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  console.log(`${email} is now an admin.`);
}

await prisma.$disconnect();
