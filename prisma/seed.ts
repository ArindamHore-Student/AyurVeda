// @ts-nocheck - Disable TypeScript checking for this file
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create a test user
  const passwordHash = await hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      role: 'PATIENT',
    },
  });
  
  console.log('Created user:', user.id);

  // Create some medications for the test user
  const medications = [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      instructions: 'Take in the morning with water',
      purpose: 'Blood pressure',
      startDate: new Date('2023-01-01'),
      userId: user.id,
    },
    {
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      purpose: 'Cholesterol',
      startDate: new Date('2023-01-01'),
      userId: user.id,
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      purpose: 'Diabetes',
      startDate: new Date('2023-01-01'),
      userId: user.id,
    },
  ];

  for (const medicationData of medications) {
    const medication = await prisma.medication.create({
      data: medicationData,
    });
    console.log('Created medication:', medication.id);
  }

  // Create some adherence records
  const meds = await prisma.medication.findMany({
    where: { userId: user.id },
  });

  if (meds.length > 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const med of meds) {
      // Yesterday's record - taken
      await prisma.adherenceRecord.create({
        data: {
          medicationId: med.id,
          userId: user.id,
          scheduledTime: yesterday,
          takenTime: new Date(yesterday.getTime() + 1000 * 60 * 60), // 1 hour after scheduled
          skipped: false,
        },
      });

      // Today's record - not taken yet
      await prisma.adherenceRecord.create({
        data: {
          medicationId: med.id,
          userId: user.id,
          scheduledTime: today,
          takenTime: null,
          skipped: false,
        },
      });
    }
    
    console.log('Created adherence records');
  }

  // Create prescription
  const prescription = await prisma.prescription.create({
    data: {
      prescribedBy: 'Dr. Smith',
      prescribedDate: new Date('2023-01-01'),
      refills: 3,
      refillsRemaining: 2,
      nextRefillDate: new Date('2023-05-01'),
      pharmacy: 'Local Pharmacy',
      userId: user.id,
    },
  });
  
  console.log('Created prescription:', prescription.id);

  // Create medication interactions
  const lisinopril = meds.find((med) => med.name === 'Lisinopril');
  const atorvastatin = meds.find((med) => med.name === 'Atorvastatin');
  
  if (lisinopril && atorvastatin) {
    const interaction = await prisma.medicationInteraction.create({
      data: {
        medicationId: lisinopril.id,
        interactingMedId: atorvastatin.id,
        severity: 'LOW',
        description: 'Minor interaction between Lisinopril and Atorvastatin',
        recommendation: 'Monitor for side effects',
      },
    });
    
    console.log('Created interaction:', interaction.id);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 