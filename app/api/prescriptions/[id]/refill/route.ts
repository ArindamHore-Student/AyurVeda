import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

// POST to process a prescription refill
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if prescription exists and belongs to user
    const prescription = await prisma.prescription.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!prescription) {
      return NextResponse.json({ message: "Prescription not found" }, { status: 404 })
    }

    // Check if refills are available
    if (prescription.refillsRemaining <= 0) {
      return NextResponse.json({ message: "No refills remaining for this prescription" }, { status: 400 })
    }

    // Process refill
    const updatedPrescription = await prisma.prescription.update({
      where: {
        id: params.id,
      },
      data: {
        refillsRemaining: prescription.refillsRemaining - 1,
        nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set next refill date to 30 days from now
      },
    })

    return NextResponse.json({
      message: "Refill processed successfully",
      prescription: updatedPrescription,
    })
  } catch (error) {
    console.error("Error processing refill:", error)
    return NextResponse.json({ message: "Error processing refill" }, { status: 500 })
  }
}

