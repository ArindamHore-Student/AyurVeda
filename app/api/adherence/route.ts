import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema
const adherenceRecordSchema = z.object({
  medicationId: z.string(),
  scheduledTime: z.string().transform((str) => new Date(str)),
  takenTime: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  skipped: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET adherence records for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const medicationId = searchParams.get("medicationId")

    // Build query filters
    const filters: any = {
      userId: session.user.id,
    }

    if (startDate && endDate) {
      filters.scheduledTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      filters.scheduledTime = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      filters.scheduledTime = {
        lte: new Date(endDate),
      }
    }

    if (medicationId) {
      filters.medicationId = medicationId
    }

    const adherenceRecords = await prisma.adherenceRecord.findMany({
      where: filters,
      include: {
        medication: true,
      },
      orderBy: {
        scheduledTime: "desc",
      },
    })

    return NextResponse.json(adherenceRecords)
  } catch (error) {
    console.error("Error fetching adherence records:", error)
    return NextResponse.json({ message: "Error fetching adherence records" }, { status: 500 })
  }
}

// POST a new adherence record
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = adherenceRecordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    // Verify medication belongs to user
    const medication = await prisma.medication.findUnique({
      where: {
        id: result.data.medicationId,
        userId: session.user.id,
      },
    })

    if (!medication) {
      return NextResponse.json({ message: "Medication not found or does not belong to user" }, { status: 404 })
    }

    const adherenceRecord = await prisma.adherenceRecord.create({
      data: {
        ...result.data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(adherenceRecord, { status: 201 })
  } catch (error) {
    console.error("Error creating adherence record:", error)
    return NextResponse.json({ message: "Error creating adherence record" }, { status: 500 })
  }
}

