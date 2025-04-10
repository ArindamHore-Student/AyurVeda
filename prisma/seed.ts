// @ts-nocheck - Disable TypeScript checking for this file
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function seedMedicationCatalog() {
  console.log('Seeding medication catalog...');
  
  const medications = [
    {
      name: "Amoxicillin",
      category: "antibiotic",
      standardDosage: "500 mg three times daily",
      weightBasedDose: "25-45 mg/kg/day divided into 3 doses",
      pediatricDose: "20-90 mg/kg/day divided into 2-3 doses, depending on infection severity",
      renalAdjustment: true,
      ageRanges: JSON.stringify([
        { min: 0, max: 3, dose: "20-30 mg/kg/day divided into 2 doses" },
        { min: 3, max: 12, dose: "25-45 mg/kg/day divided into 2 doses" },
        { min: 12, max: 18, dose: "250-500 mg every 8 hours" },
      ]),
    },
    {
      name: "Ibuprofen",
      category: "nsaid",
      standardDosage: "200-400 mg every 4-6 hours as needed",
      weightBasedDose: "5-10 mg/kg every 6-8 hours, max 3200 mg/day",
      pediatricDose: "4-10 mg/kg every 6-8 hours, max 40 mg/kg/day",
      renalAdjustment: true,
      ageRanges: JSON.stringify([
        { min: 0.5, max: 2, dose: "50 mg every 6-8 hours" },
        { min: 2, max: 6, dose: "100 mg every 6-8 hours" },
        { min: 6, max: 12, dose: "200 mg every 6-8 hours" },
        { min: 12, max: 18, dose: "200-400 mg every 6-8 hours" },
      ]),
    },
    {
      name: "Acetaminophen",
      category: "analgesic",
      standardDosage: "325-650 mg every 4-6 hours as needed, max 3000 mg/day",
      weightBasedDose: "10-15 mg/kg every 4-6 hours, max 3000 mg/day",
      pediatricDose: "10-15 mg/kg every 4-6 hours, max 75 mg/kg/day not to exceed 3000 mg/day",
      renalAdjustment: true,
      ageRanges: JSON.stringify([
        { min: 0, max: 3, dose: "10-15 mg/kg every 4-6 hours, max 5 doses per day" },
        { min: 3, max: 6, dose: "120-160 mg every 4-6 hours" },
        { min: 6, max: 12, dose: "240-320 mg every 4-6 hours" },
        { min: 12, max: 18, dose: "325-650 mg every 4-6 hours" },
      ]),
    },
    {
      name: "Lisinopril",
      category: "antihypertensive",
      standardDosage: "10-40 mg once daily",
      weightBasedDose: null,
      pediatricDose: "0.07 mg/kg once daily, up to 5 mg",
      renalAdjustment: true,
      ageRanges: JSON.stringify([
        { min: 6, max: 18, dose: "0.07 mg/kg once daily, up to 5 mg" }
      ]),
    },
    {
      name: "Metformin",
      category: "antidiabetic",
      standardDosage: "500 mg twice daily or 850 mg once daily, max 2550 mg/day",
      weightBasedDose: null,
      pediatricDose: "500-2000 mg daily divided into 2 doses",
      renalAdjustment: true,
      ageRanges: JSON.stringify([
        { min: 10, max: 18, dose: "500-2000 mg daily divided into 2 doses" }
      ]),
    },
  ];

  for (const med of medications) {
    const exists = await prisma.medicationCatalog.findUnique({
      where: { name: med.name },
    });

    if (!exists) {
      await prisma.medicationCatalog.create({
        data: med,
      });
      console.log('Created medication catalog entry:', med.name);
    }
  }
}

async function main() {
  console.log('Start seeding...');

  // Seed medication catalog
  await seedMedicationCatalog();

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