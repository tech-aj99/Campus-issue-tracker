import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Seed only the admin account ──────────────────────────────────────────────
  // Staff accounts should NOT be seeded here.
  // To create staff members, log in as admin and use the Staff Management page
  // (/admin/staff) to generate an invite link. The invite link allows staff to
  // self-register securely via POST /api/auth/register-with-token.
  const adminHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@campus.edu',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Admin account:');
  console.log('  admin@campus.edu / admin123');
  console.log('');
  console.log('To create staff accounts:');
  console.log('  1. Log in as admin@campus.edu');
  console.log('  2. Navigate to Admin → Staff Management');
  console.log('  3. Use "Generate Invite Link" to invite staff members');
  console.log('  4. Share the link — it expires in 24 hours');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
