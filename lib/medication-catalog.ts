import prisma from './prisma';

export interface AgeRange {
  min: number;
  max: number;
  dose: string;
}

export interface MedicationCatalogWithAgeRanges {
  id: string;
  name: string;
  category: string;
  standardDosage: string;
  weightBasedDose: string | null;
  pediatricDose: string | null;
  renalAdjustment: boolean;
  ageRanges: AgeRange[] | null;
  createdAt: Date;
  updatedAt: Date;
}

// Get all medications from the catalog
export async function getAllMedications(): Promise<MedicationCatalogWithAgeRanges[]> {
  const medications = await prisma.medicationCatalog.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return medications.map(med => ({
    ...med,
    ageRanges: med.ageRanges ? JSON.parse(med.ageRanges) : null,
  }));
}

// Get a medication by ID
export async function getMedicationById(id: string): Promise<MedicationCatalogWithAgeRanges | null> {
  const medication = await prisma.medicationCatalog.findUnique({
    where: { id },
  });

  if (!medication) return null;

  return {
    ...medication,
    ageRanges: medication.ageRanges ? JSON.parse(medication.ageRanges) : null,
  };
}

// Get a medication by name
export async function getMedicationByName(name: string): Promise<MedicationCatalogWithAgeRanges | null> {
  const medication = await prisma.medicationCatalog.findUnique({
    where: { name },
  });

  if (!medication) return null;

  return {
    ...medication,
    ageRanges: medication.ageRanges ? JSON.parse(medication.ageRanges) : null,
  };
}

// Create a new medication in the catalog
export async function createMedication(data: {
  name: string;
  category: string;
  standardDosage: string;
  weightBasedDose?: string;
  pediatricDose?: string;
  renalAdjustment?: boolean;
  ageRanges?: AgeRange[];
}): Promise<MedicationCatalogWithAgeRanges> {
  const medication = await prisma.medicationCatalog.create({
    data: {
      ...data,
      renalAdjustment: data.renalAdjustment ?? false,
      ageRanges: data.ageRanges ? JSON.stringify(data.ageRanges) : null,
    },
  });

  return {
    ...medication,
    ageRanges: medication.ageRanges ? JSON.parse(medication.ageRanges) : null,
  };
}

// Update a medication in the catalog
export async function updateMedication(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    standardDosage: string;
    weightBasedDose: string | null;
    pediatricDose: string | null;
    renalAdjustment: boolean;
    ageRanges: AgeRange[] | null;
  }>
): Promise<MedicationCatalogWithAgeRanges | null> {
  // If ageRanges is provided, convert to string
  const updateData = {
    ...data,
    ageRanges: data.ageRanges ? JSON.stringify(data.ageRanges) : undefined,
  };

  const medication = await prisma.medicationCatalog.update({
    where: { id },
    data: updateData,
  });

  return {
    ...medication,
    ageRanges: medication.ageRanges ? JSON.parse(medication.ageRanges) : null,
  };
}

// Delete a medication from the catalog
export async function deleteMedication(id: string): Promise<boolean> {
  try {
    await prisma.medicationCatalog.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting medication:", error);
    return false;
  }
}

// Seed the database with initial medications
export async function seedMedicationCatalog() {
  const medications = [
    {
      name: "Amoxicillin",
      category: "antibiotic",
      standardDosage: "500 mg three times daily",
      weightBasedDose: "25-45 mg/kg/day divided into 3 doses",
      pediatricDose: "20-90 mg/kg/day divided into 2-3 doses, depending on infection severity",
      renalAdjustment: true,
      ageRanges: [
        { min: 0, max: 3, dose: "20-30 mg/kg/day divided into 2 doses" },
        { min: 3, max: 12, dose: "25-45 mg/kg/day divided into 2 doses" },
        { min: 12, max: 18, dose: "250-500 mg every 8 hours" },
      ],
    },
    {
      name: "Ibuprofen",
      category: "nsaid",
      standardDosage: "200-400 mg every 4-6 hours as needed",
      weightBasedDose: "5-10 mg/kg every 6-8 hours, max 3200 mg/day",
      pediatricDose: "4-10 mg/kg every 6-8 hours, max 40 mg/kg/day",
      renalAdjustment: true,
      ageRanges: [
        { min: 0.5, max: 2, dose: "50 mg every 6-8 hours" },
        { min: 2, max: 6, dose: "100 mg every 6-8 hours" },
        { min: 6, max: 12, dose: "200 mg every 6-8 hours" },
        { min: 12, max: 18, dose: "200-400 mg every 6-8 hours" },
      ],
    },
    // Add more medications from your original list as needed
  ];

  for (const med of medications) {
    const exists = await prisma.medicationCatalog.findUnique({
      where: { name: med.name },
    });

    if (!exists) {
      await createMedication(med);
    }
  }
} 