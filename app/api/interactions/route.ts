import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { checkInteractions } from "@/lib/interaction-checker"

const prisma = new PrismaClient()

// Validation schema for checking interactions
const interactionCheckSchema = z.object({
  medicationIds: z.array(z.string()).min(1, "At least one medication ID is required"),
})

// POST to check interactions for a set of medications
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const body = await req.json()

    // Validate input
    const result = interactionCheckSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { medicationIds } = result.data

    // Verify medications belong to user
    const medications = await prisma.medication.findMany({
      where: {
        id: { in: medicationIds },
        userId: user.id,
      },
    })

    if (medications.length !== medicationIds.length) {
      return NextResponse.json(
        { message: "One or more medications not found or do not belong to user" },
        { status: 404 },
      )
    }

    // Check for interactions using Gemini
    const interactions = await checkInteractions(medications)

    return NextResponse.json(interactions)
  } catch (error) {
    console.error("Error checking interactions:", error)
    return NextResponse.json({ message: "Error checking interactions" }, { status: 500 })
  }
}

