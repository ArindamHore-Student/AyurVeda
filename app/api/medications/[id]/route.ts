import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema
const medicationUpdateSchema = z.object({
  name: z.string().min(1, "Medication name is required").optional(),
  dosage: z.string().min(1, "Dosage is required").optional(),
  frequency: z.string().min(1, "Frequency is required").optional(),
  instructions: z.string().optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  purpose: z.string().optional(),
  prescriptionId: z.string().optional(),
})

// GET a specific medication
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const medication = await prisma.medication.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        prescription: true,
      },
    })

    if (!medication) {
      return NextResponse.json({ message: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json(medication)
  } catch (error) {
    console.error("Error fetching medication:", error)
    return NextResponse.json({ message: "Error fetching medication" }, { status: 500 })
  }
}

// PUT (update) a medication
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if medication exists and belongs to user
    const existingMedication = await prisma.medication.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingMedication) {
      return NextResponse.json({ message: "Medication not found" }, { status: 404 })
    }

    const body = await req.json()

    // Validate input
    const result = medicationUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const updatedMedication = await prisma.medication.update({
      where: {
        id: params.id,
      },
      data: result.data,
    })

    return NextResponse.json(updatedMedication)
  } catch (error) {
    console.error("Error updating medication:", error)
    return NextResponse.json({ message: "Error updating medication" }, { status: 500 })
  }
}

// DELETE a medication
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if medication exists and belongs to user
    const existingMedication = await prisma.medication.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingMedication) {
      return NextResponse.json({ message: "Medication not found" }, { status: 404 })
    }

    await prisma.medication.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Medication deleted successfully" })
  } catch (error) {
    console.error("Error deleting medication:", error)
    return NextResponse.json({ message: "Error deleting medication" }, { status: 500 })
  }
}

