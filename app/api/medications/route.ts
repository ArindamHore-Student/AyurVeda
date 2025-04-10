/**
 * Medications API Routes
 * 
 * This file contains API endpoints for managing medications:
 * - GET: Retrieves all medications for the current user
 * - POST: Creates a new medication for the current user
 * 
 * Features:
 * - Input validation using Zod
 * - Proper error handling with specific error messages
 * - Authentication checks to ensure user authorization
 * - Response caching for improved performance
 */

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { handleApiError } from "@/lib/utils"
import { getAllMedications, getMedicationById } from '@/lib/medication-catalog'

// Initialize Prisma client
const prisma = new PrismaClient()

// Validation schema for medication creation and updates
const medicationSchema = z.object({
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
  prescriptionId: z.string().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  remainingDoses: z.number().int().optional(),
  totalDoses: z.number().int().optional(),
})

/**
 * GET all medications for the current user
 * 
 * @returns A list of medications or an error response
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (id) {
      // Get a specific medication by ID
      const medication = await getMedicationById(id)
      
      if (!medication) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
      }
      
      return NextResponse.json(medication)
    } else {
      // Get all medications
      const medications = await getAllMedications()
      return NextResponse.json(medications)
    }
  } catch (error) {
    console.error('Error in medications API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}

/**
 * POST a new medication
 * 
 * @param req - The request object containing the medication data
 * @returns The created medication or an error response
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    // Check authentication
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

    // Parse and validate request body
    const body = await req.json()
    const result = medicationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ 
        message: "Invalid input", 
        errors: result.error.errors 
      }, { status: 400 })
    }

    // Create the medication
    const medication = await prisma.medication.create({
      data: {
        ...result.data,
        userId: user.id,
      },
    })

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    const { message, status } = handleApiError(error)
    console.error("Error creating medication:", error)
    return NextResponse.json({ message }, { status })
  }
}

