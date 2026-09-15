import { PrismaClient, ResourceType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder bcrypt hash for the dev password "password" — replace when auth is implemented.
const DEV_PASSWORD_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: DEV_PASSWORD_HASH,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: DEV_PASSWORD_HASH,
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
    },
  });

  const conferenceRoom = await prisma.resource.upsert({
    where: { id: 'seed-resource-room' },
    update: {},
    create: {
      id: 'seed-resource-room',
      name: 'Conference Room A',
      description: 'Meeting room with projector and whiteboard',
      type: ResourceType.ROOM,
    },
  });

  const projector = await prisma.resource.upsert({
    where: { id: 'seed-resource-equipment' },
    update: {},
    create: {
      id: 'seed-resource-equipment',
      name: 'Portable Projector',
      description: 'HD projector for presentations',
      type: ResourceType.EQUIPMENT,
    },
  });

  const companyVan = await prisma.resource.upsert({
    where: { id: 'seed-resource-vehicle' },
    update: {},
    create: {
      id: 'seed-resource-vehicle',
      name: 'Company Van',
      description: 'Van for team travel',
      type: ResourceType.VEHICLE,
    },
  });

  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);
  startTime.setHours(10, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(11, 0, 0, 0);

  await prisma.reservation.upsert({
    where: { id: 'seed-reservation-1' },
    update: {},
    create: {
      id: 'seed-reservation-1',
      userId: user.id,
      resourceId: conferenceRoom.id,
      startTime,
      endTime,
      notes: 'Team standup meeting',
    },
  });

  console.log('Seed data created:');
  console.log(`  Admin: ${admin.email}`);
  console.log(`  User: ${user.email}`);
  console.log(`  Resources: ${conferenceRoom.name}, ${projector.name}, ${companyVan.name}`);
  console.log('  Dev password for all users: password');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
