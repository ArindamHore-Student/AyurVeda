import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

// GET medication schedule for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date()

    // Set time to beginning of day
    targetDate.setHours(0, 0, 0, 0)

    // Get end of day
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get active medications for the user
    const medications = await prisma.medication.findMany({
      where: {
        userId: session.user.id,
        startDate: { lte: endOfDay },
        OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
      },
    })

    // Get adherence records for the day
    const adherenceRecords = await prisma.adherenceRecord.findMany({
      where: {
        userId: session.user.id,
        scheduledTime: {
          gte: targetDate,
          lte: endOfDay,
        },
      },
    })

    // Map adherence records by medication ID for easy lookup
    const adherenceByMedication = adherenceRecords.reduce(
      (acc, record) => {
        if (!acc[record.medicationId]) {
          acc[record.medicationId] = []
        }
        acc[record.medicationId].push(record)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Generate schedule based on medication frequency
    const schedule = medications.flatMap((medication) => {
      const doses = generateDosesFromFrequency(medication, targetDate)

      return doses.map((dose) => {
        // Check if there's an adherence record for this dose
        const adherenceRecord = adherenceByMedication[medication.id]?.find((record) => {
          const scheduledTime = new Date(record.scheduledTime)
          const doseTime = new Date(dose.time)

          // Match if scheduled times are within 15 minutes of each other
          return Math.abs(scheduledTime.getTime() - doseTime.getTime()) < 15 * 60 * 1000
        })

        return {
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          instructions: medication.instructions,
          time: dose.time,
          label: dose.label,
          adherenceRecordId: adherenceRecord?.id || null,
          taken: adherenceRecord?.takenTime ? true : false,
          skipped: adherenceRecord?.skipped || false,
        }
      })
    })

    // Sort by time
    schedule.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching medication schedule:", error)
    return NextResponse.json({ message: "Error fetching medication schedule" }, { status: 500 })
  }
}

// Helper function to generate doses based on frequency
function generateDosesFromFrequency(medication: any, date: Date) {
  const doses = []
  const frequency = medication.frequency.toLowerCase()

  // Set date to beginning of day
  const baseDate = new Date(date)
  baseDate.setHours(0, 0, 0, 0)

  // Parse frequency and generate doses
  if (frequency.includes("once daily") || frequency.includes("daily")) {
    let hour = 8 // Default to 8 AM

    if (frequency.includes("morning")) {
      hour = 8
    } else if (frequency.includes("afternoon")) {
      hour = 14
    } else if (frequency.includes("evening")) {
      hour = 18
    } else if (frequency.includes("bedtime") || frequency.includes("night")) {
      hour = 21
    }

    const doseTime = new Date(baseDate)
    doseTime.setHours(hour, 0, 0, 0)

    doses.push({
      time: doseTime.toISOString(),
      label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`,
    })
  } else if (frequency.includes("twice daily") || frequency.includes("bid")) {
    // Morning dose
    const morningDose = new Date(baseDate)
    morningDose.setHours(8, 0, 0, 0)

    // Evening dose
    const eveningDose = new Date(baseDate)
    eveningDose.setHours(20, 0, 0, 0)

    doses.push({ time: morningDose.toISOString(), label: "8AM" }, { time: eveningDose.toISOString(), label: "8PM" })
  } else if (frequency.includes("three times daily") || frequency.includes("tid")) {
    // Morning dose
    const morningDose = new Date(baseDate)
    morningDose.setHours(8, 0, 0, 0)

    // Afternoon dose
    const afternoonDose = new Date(baseDate)
    afternoonDose.setHours(14, 0, 0, 0)

    // Evening dose
    const eveningDose = new Date(baseDate)
    eveningDose.setHours(20, 0, 0, 0)

    doses.push(
      { time: morningDose.toISOString(), label: "8AM" },
      { time: afternoonDose.toISOString(), label: "2PM" },
      { time: eveningDose.toISOString(), label: "8PM" },
    )
  } else if (frequency.includes("four times daily") || frequency.includes("qid")) {
    // Four times a day
    const times = [8, 12, 16, 20]

    times.forEach((hour) => {
      const doseTime = new Date(baseDate)
      doseTime.setHours(hour, 0, 0, 0)

      doses.push({
        time: doseTime.toISOString(),
        label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`,
      })
    })
  } else if (frequency.includes("every") && frequency.includes("hours")) {
    // Extract hours from frequency (e.g., "every 6 hours")
    const hoursMatch = frequency.match(/every\s+(\d+)\s+hours/i)
    if (hoursMatch && hoursMatch[1]) {
      const intervalHours = Number.parseInt(hoursMatch[1], 10)
      const startHour = 8 // Start at 8 AM

      for (let hour = startHour; hour < 24; hour += intervalHours) {
        const doseTime = new Date(baseDate)
        doseTime.setHours(hour, 0, 0, 0)

        doses.push({
          time: doseTime.toISOString(),
          label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`,
        })
      }
    }
  } else if (frequency.includes("weekly")) {
    // Check if today is the day for the weekly dose
    const dayMatch = frequency.match(/on\s+(\w+)/i)
    if (dayMatch && dayMatch[1]) {
      const dayOfWeek = dayMatch[1].toLowerCase()
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      const targetDayIndex = daysOfWeek.indexOf(dayOfWeek)

      if (targetDayIndex !== -1 && date.getDay() === targetDayIndex) {
        const doseTime = new Date(baseDate)
        doseTime.setHours(8, 0, 0, 0)

        doses.push({
          time: doseTime.toISOString(),
          label: "8AM",
        })
      }
    } else {
      // If no specific day mentioned, default to once a week on the same day as start date
      const startDay = medication.startDate.getDay()

      if (date.getDay() === startDay) {
        const doseTime = new Date(baseDate)
        doseTime.setHours(8, 0, 0, 0)

        doses.push({
          time: doseTime.toISOString(),
          label: "8AM",
        })
      }
    }
  } else {
    // Default to once daily at 8 AM if frequency format is not recognized
    const doseTime = new Date(baseDate)
    doseTime.setHours(8, 0, 0, 0)

    doses.push({
      time: doseTime.toISOString(),
      label: "8AM",
    })
  }

  return doses
}

