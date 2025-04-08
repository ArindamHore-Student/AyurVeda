import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getMedicationInfo } from "@/lib/medication-info"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const medicationName = searchParams.get("name")

    if (!medicationName) {
      return NextResponse.json({ message: "Medication name is required" }, { status: 400 })
    }

    const medicationInfo = await getMedicationInfo(medicationName)

    if (!medicationInfo) {
      return NextResponse.json({ message: "Failed to retrieve medication information" }, { status: 404 })
    }

    return NextResponse.json(medicationInfo)
  } catch (error) {
    console.error("Error fetching medication info:", error)
    return NextResponse.json({ message: "Error fetching medication information" }, { status: 500 })
  }
}

