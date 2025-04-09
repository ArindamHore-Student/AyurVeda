import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// This script is specifically for seeding the production database 
// during the Vercel build process

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding production database...');

    // Create admin user (for demo purposes only)
    const adminPassword = await bcrypt.hash('vercel-admin', 10);
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Demo Admin',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    });

    // Create demo user (for demo purposes only)
    const userPassword = await bcrypt.hash('vercel-demo', 10);
    const user = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        name: 'Vercel Demo User',
        passwordHash: userPassword,
        role: 'PATIENT',
      },
    });

    // Create demo medications
    await prisma.medication.upsert({
      where: { 
        id: 'clfdefault1'
      },
      update: {},
      create: {
        id: 'clfdefault1',
        name: 'Demo Medication 1',
        dosage: '100mg',
        frequency: 'Once daily',
        instructions: 'Take with food',
        startDate: new Date(),
        purpose: 'Demo purposes',
        userId: user.id,
      },
    });

    console.log('Production database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Fail the build if seeding fails
  } finally {
    await prisma.$disconnect();
  }
}

main(); 