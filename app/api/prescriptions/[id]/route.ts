import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema for updates
const prescriptionUpdateSchema = z.object({
  prescribedBy: z.string().min(1, "Prescriber name is required").optional(),
  prescribedDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  refills: z.number().int().min(0).optional(),
  refillsRemaining: z.number().int().min(0).optional(),
  nextRefillDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  pharmacy: z.string().optional(),
})

// GET a specific prescription
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const prescription = await prisma.prescription.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        medications: true,
      },
    })

    if (!prescription) {
      return NextResponse.json({ message: "Prescription not found" }, { status: 404 })
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error("Error fetching prescription:", error)
    return NextResponse.json({ message: "Error fetching prescription" }, { status: 500 })
  }
}

// PUT (update) a prescription
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if prescription exists and belongs to user
    const existingPrescription = await prisma.prescription.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPrescription) {
      return NextResponse.json({ message: "Prescription not found" }, { status: 404 })
    }

    const body = await req.json()

    // Validate input
    const result = prescriptionUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const updatedPrescription = await prisma.prescription.update({
      where: {
        id: params.id,
      },
      data: result.data,
      include: {
        medications: true,
      },
    })

    return NextResponse.json(updatedPrescription)
  } catch (error) {
    console.error("Error updating prescription:", error)
    return NextResponse.json({ message: "Error updating prescription" }, { status: 500 })
  }
}

// DELETE a prescription
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if prescription exists and belongs to user
    const existingPrescription = await prisma.prescription.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPrescription) {
      return NextResponse.json({ message: "Prescription not found" }, { status: 404 })
    }

    // Delete prescription and associated medications in a transaction
    await prisma.$transaction([
      prisma.medication.deleteMany({
        where: {
          prescriptionId: params.id,
        },
      }),
      prisma.prescription.delete({
        where: {
          id: params.id,
        },
      }),
    ])

    return NextResponse.json({ message: "Prescription deleted successfully" })
  } catch (error) {
    console.error("Error deleting prescription:", error)
    return NextResponse.json({ message: "Error deleting prescription" }, { status: 500 })
  }
}

