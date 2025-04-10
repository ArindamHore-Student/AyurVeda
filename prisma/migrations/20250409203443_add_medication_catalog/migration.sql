-- CreateTable
CREATE TABLE "MedicationCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "standardDosage" TEXT NOT NULL,
    "weightBasedDose" TEXT,
    "pediatricDose" TEXT,
    "renalAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "ageRanges" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicationCatalog_name_key" ON "MedicationCatalog"("name"); 