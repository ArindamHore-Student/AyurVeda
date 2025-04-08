import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { checkTextInteractions } from "@/lib/interaction-checker"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Validation schema for checking text interactions
const textInteractionCheckSchema = z.object({
  medicationText: z.string().min(3, "Please enter at least 3 characters to describe your medications"),
})

// POST to check interactions from text input
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
    const result = textInteractionCheckSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { medicationText } = result.data

    // Check for interactions using Gemini
    const interactions = await checkTextInteractions(medicationText)

    return NextResponse.json(interactions)
  } catch (error) {
    console.error("Error checking text interactions:", error)
    return NextResponse.json({ message: "Error checking interactions" }, { status: 500 })
  }
} 