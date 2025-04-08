import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schema
const adherenceUpdateSchema = z.object({
  takenTime: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  skipped: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET a specific adherence record
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const adherenceRecord = await prisma.adherenceRecord.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        medication: true,
      },
    })

    if (!adherenceRecord) {
      return NextResponse.json({ message: "Adherence record not found" }, { status: 404 })
    }

    return NextResponse.json(adherenceRecord)
  } catch (error) {
    console.error("Error fetching adherence record:", error)
    return NextResponse.json({ message: "Error fetching adherence record" }, { status: 500 })
  }
}

// PUT (update) an adherence record
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if record exists and belongs to user
    const existingRecord = await prisma.adherenceRecord.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingRecord) {
      return NextResponse.json({ message: "Adherence record not found" }, { status: 404 })
    }

    const body = await req.json()

    // Validate input
    const result = adherenceUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const updatedRecord = await prisma.adherenceRecord.update({
      where: {
        id: params.id,
      },
      data: result.data,
    })

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating adherence record:", error)
    return NextResponse.json({ message: "Error updating adherence record" }, { status: 500 })
  }
}

