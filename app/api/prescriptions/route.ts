import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema
const prescriptionSchema = z.object({
  prescribedBy: z.string().min(1, "Prescriber name is required"),
  prescribedDate: z.string().transform((str) => new Date(str)),
  refills: z.number().int().min(0).default(0),
  refillsRemaining: z.number().int().min(0).optional(),
  nextRefillDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  pharmacy: z.string().optional(),
  medications: z
    .array(
      z.object({
        name: z.string().min(1, "Medication name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        frequency: z.string().min(1, "Frequency is required"),
        instructions: z.string().optional(),
        startDate: z.string().transform((str) => new Date(str)),
        endDate: z
          .string()
          .optional()
          .transform((str) => (str ? new Date(str) : undefined)),
        purpose: z.string().optional(),
      }),
    )
    .optional(),
})

// GET all prescriptions for the current user
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        medications: true,
      },
      orderBy: {
        prescribedDate: "desc",
      },
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ message: "Error fetching prescriptions" }, { status: 500 })
  }
}

// POST a new prescription
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = prescriptionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { medications, ...prescriptionData } = result.data

    // Set refillsRemaining to refills if not provided
    if (prescriptionData.refillsRemaining === undefined) {
      prescriptionData.refillsRemaining = prescriptionData.refills
    }

    // Create prescription with medications in a transaction
    const prescription = await prisma.$transaction(async (tx) => {
      // Create prescription
      const newPrescription = await tx.prescription.create({
        data: {
          ...prescriptionData,
          userId: session.user.id,
        },
      })

      // Create medications if provided
      if (medications && medications.length > 0) {
        await Promise.all(
          medications.map((med) =>
            tx.medication.create({
              data: {
                ...med,
                userId: session.user.id,
                prescriptionId: newPrescription.id,
              },
            }),
          ),
        )
      }

      // Return prescription with medications
      return tx.prescription.findUnique({
        where: { id: newPrescription.id },
        include: { medications: true },
      })
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error("Error creating prescription:", error)
    return NextResponse.json({ message: "Error creating prescription" }, { status: 500 })
  }
}

