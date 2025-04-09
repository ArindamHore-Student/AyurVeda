import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    });

    // Create demo user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Demo User',
        passwordHash: userPassword,
        role: 'PATIENT',
      },
    });

    // Create some medications for the demo user
    await prisma.medication.create({
      data: {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        instructions: 'Take with food',
        startDate: new Date(),
        purpose: 'Pain relief',
        userId: user.id,
      },
    });

    await prisma.medication.create({
      data: {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'Once daily',
        instructions: 'Take with meal',
        startDate: new Date(),
        purpose: 'Vitamin supplement',
        userId: user.id,
      },
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 