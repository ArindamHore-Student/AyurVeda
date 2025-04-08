"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { format, subDays } from "date-fns"
import Link from "next/link"

// Types
interface AdherenceRecord {
  id: string
  medicationId: string
  scheduledTime: string
  takenTime?: string
  skipped: boolean
  medication: {
    name: string
    dosage: string
  }
}

interface AdherenceStats {
  overall: number
  byMedication: {
    name: string
    adherence: number
    total: number
    taken: number
  }[]
  byTime: {
    time: string
    adherence: number
    total: number
    taken: number
  }[]
  calendar: Record<string, { total: number; taken: number }>
  streak: {
    current: number
    best: number
  }
}

export default function AdherencePage() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeframe, setTimeframe] = useState("30")
  const [loading, setLoading] = useState(true)
  const [adherenceRecords, setAdherenceRecords] = useState<AdherenceRecord[]>([])
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats>({
    overall: 0,
    byMedication: [],
    byTime: [],
    calendar: {},
    streak: { current: 0, best: 0 },
  })

  // Fetch adherence data
  useEffect(() => {
    const fetchAdherenceData = async () => {
      setLoading(true)

      try {
        // Calculate date range based on timeframe
        const endDate = new Date()
        const startDate = subDays(endDate, Number.parseInt(timeframe))

        const response = await fetch(
          `/api/adherence?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )

        if (!response.ok) throw new Error("Failed to fetch adherence data")

        const records: AdherenceRecord[] = await response.json()
        setAdherenceRecords(records)

        // Calculate adherence statistics
        calculateAdherenceStats(records)
      } catch (error) {
        console.error("Error fetching adherence data:", error)
        toast({
          title: "Error",
          description: "Failed to load adherence data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAdherenceData()
  }, [timeframe, toast])

  // Calculate adherence statistics
  const calculateAdherenceStats = (records: AdherenceRecord[]) => {
    if (records.length === 0) {
      setAdherenceStats({
        overall: 0,
        byMedication: [],
        byTime: [],
        calendar: {},
        streak: { current: 0, best: 0 },
      })
      return
    }

    // Overall adherence
    const totalDoses = records.length
    const takenDoses = records.filter((record) => record.takenTime || record.skipped).length
    const overallAdherence = Math.round((takenDoses / totalDoses) * 100)

    // Adherence by medication
    const medicationMap = new Map<string, { name: string; total: number; taken: number }>()

    records.forEach((record) => {
      const medId = record.medicationId
      const medName = record.medication.name

      if (!medicationMap.has(medId)) {
        medicationMap.set(medId, { name: medName, total: 0, taken: 0 })
      }

      const medStats = medicationMap.get(medId)!
      medStats.total += 1

      if (record.takenTime || record.skipped) {
        medStats.taken += 1
      }
    })

    const byMedication = Array.from(medicationMap.values()).map((stats) => ({
      name: stats.name,
      total: stats.total,
      taken: stats.taken,
      adherence: Math.round((stats.taken / stats.total) * 100),
    }))

    // Adherence by time of day
    const timeMap = new Map<string, { total: number; taken: number }>()
    const timeSlots = ["Morning", "Afternoon", "Evening", "Bedtime"]

    timeSlots.forEach((slot) => {
      timeMap.set(slot, { total: 0, taken: 0 })
    })

    records.forEach((record) => {
      const scheduledTime = new Date(record.scheduledTime)
      const hour = scheduledTime.getHours()

      let timeSlot = "Morning"
      if (hour >= 12 && hour < 17) {
        timeSlot = "Afternoon"
      } else if (hour >= 17 && hour < 20) {
        timeSlot = "Evening"
      } else if (hour >= 20) {
        timeSlot = "Bedtime"
      }

      const slotStats = timeMap.get(timeSlot)!
      slotStats.total += 1

      if (record.takenTime || record.skipped) {
        slotStats.taken += 1
      }
    })

    const byTime = timeSlots
      .map((time) => {
        const stats = timeMap.get(time)!
        return {
          time,
          total: stats.total,
          taken: stats.taken,
          adherence: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0,
        }
      })
      .filter((stats) => stats.total > 0)

    // Calendar data
    const calendarData: Record<string, { total: number; taken: number }> = {}

    records.forEach((record) => {
      const dateStr = record.scheduledTime.split("T")[0]

      if (!calendarData[dateStr]) {
        calendarData[dateStr] = { total: 0, taken: 0 }
      }

      calendarData[dateStr].total += 1

      if (record.takenTime || record.skipped) {
        calendarData[dateStr].taken += 1
      }
    })

    // Calculate streak
    const dateEntries = Object.entries(calendarData)
      .map(([date, stats]) => ({
        date,
        isPerfect: stats.taken === stats.total,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    // Calculate from most recent day backward
    for (let i = dateEntries.length - 1; i >= 0; i--) {
      if (dateEntries[i].isPerfect) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate best streak
    for (const entry of dateEntries) {
      if (entry.isPerfect) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    setAdherenceStats({
      overall: overallAdherence,
      byMedication,
      byTime,
      calendar: calendarData,
      streak: { current: currentStreak, best: bestStreak },
    })
  }

  // Function to render the adherence bar
  const AdherenceBar = ({ percentage }: { percentage: number }) => {
    let color = "bg-green-500"
    if (percentage < 80) color = "bg-red-500"
    else if (percentage < 90) color = "bg-yellow-500"

    return (
      <div className="h-2 w-full rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    )
  }

  // Function to get color class based on adherence percentage
  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500"
    if (percentage >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  // Mark dose as taken
  const markDoseTaken = async (recordId: string) => {
    try {
      const response = await fetch(`/api/adherence/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          takenTime: new Date().toISOString(),
          skipped: false,
        }),
      })

      if (!response.ok) throw new Error("Failed to update adherence record")

      // Update local state
      setAdherenceRecords((prev) =>
        prev.map((record) =>
          record.id === recordId ? { ...record, takenTime: new Date().toISOString(), skipped: false } : record,
        ),
      )

      toast({
        title: "Success",
        description: "Dose marked as taken",
      })

      // Recalculate stats
      calculateAdherenceStats(
        adherenceRecords.map((record) =>
          record.id === recordId ? { ...record, takenTime: new Date().toISOString(), skipped: false } : record,
        ),
      )
    } catch (error) {
      console.error("Error updating adherence record:", error)
      toast({
        title: "Error",
        description: "Failed to update record. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Mark dose as skipped
  const markDoseSkipped = async (recordId: string) => {
    try {
      const response = await fetch(`/api/adherence/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skipped: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to update adherence record")

      // Update local state
      setAdherenceRecords((prev) =>
        prev.map((record) => (record.id === recordId ? { ...record, skipped: true } : record)),
      )

      toast({
        title: "Success",
        description: "Dose marked as skipped",
      })

      // Recalculate stats
      calculateAdherenceStats(
        adherenceRecords.map((record) => (record.id === recordId ? { ...record, skipped: true } : record)),
      )
    } catch (error) {
      console.error("Error updating adherence record:", error)
      toast({
        title: "Error",
        description: "Failed to update record. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get records for selected date
  const getRecordsForDate = (selectedDate: Date) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return adherenceRecords.filter((record) => record.scheduledTime.startsWith(dateStr))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading adherence data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medication Adherence</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Adherence</CardTitle>
            <CardDescription>Last {timeframe} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={`text-5xl font-bold ${getAdherenceColor(adherenceStats.overall)}`}>
                {adherenceStats.overall}%
              </div>
              <AdherenceBar percentage={adherenceStats.overall} />
              <p className="text-sm text-muted-foreground">
                {adherenceStats.overall >= 90
                  ? "Excellent adherence!"
                  : adherenceStats.overall >= 80
                    ? "Good adherence, but room for improvement"
                    : "Needs improvement"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Doses Taken</CardTitle>
            <CardDescription>Last {timeframe} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-5xl font-bold">
                {adherenceRecords.filter((r) => r.takenTime || r.skipped).length}
                <span className="text-lg text-muted-foreground">/{adherenceRecords.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {adherenceRecords.length - adherenceRecords.filter((r) => r.takenTime || r.skipped).length} doses missed
                in the last {timeframe} days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Streak</CardTitle>
            <CardDescription>Consecutive days with perfect adherence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-5xl font-bold">{adherenceStats.streak.current}</div>
              <p className="text-sm text-muted-foreground">Your best streak was {adherenceStats.streak.best} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="by-medication">By Medication</TabsTrigger>
          <TabsTrigger value="by-time">By Time of Day</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Adherence Calendar</CardTitle>
              <CardDescription>View your medication adherence by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    perfect: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return (
                        dateStr in adherenceStats.calendar &&
                        adherenceStats.calendar[dateStr].taken === adherenceStats.calendar[dateStr].total
                      )
                    },
                    partial: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return (
                        dateStr in adherenceStats.calendar &&
                        adherenceStats.calendar[dateStr].taken > 0 &&
                        adherenceStats.calendar[dateStr].taken < adherenceStats.calendar[dateStr].total
                      )
                    },
                    missed: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return dateStr in adherenceStats.calendar && adherenceStats.calendar[dateStr].taken === 0
                    },
                  }}
                  modifiersClassNames={{
                    perfect: "bg-green-100 text-green-900 font-medium",
                    partial: "bg-yellow-100 text-yellow-900 font-medium",
                    missed: "bg-red-100 text-red-900 font-medium",
                  }}
                />
              </div>

              {date && (
                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</h3>

                  {format(date, "yyyy-MM-dd") in adherenceStats.calendar ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Doses taken:</span>
                        <span className="font-medium">
                          {adherenceStats.calendar[format(date, "yyyy-MM-dd")].taken} /{" "}
                          {adherenceStats.calendar[format(date, "yyyy-MM-dd")].total}
                        </span>
                      </div>
                      <div className="space-y-2 mt-4">
                        {getRecordsForDate(date).map((record) => (
                          <div key={record.id} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <span className="text-sm font-medium">
                                {record.medication.name} ({record.medication.dosage})
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(record.scheduledTime), "h:mm a")}
                              </div>
                            </div>
                            {record.takenTime ? (
                              <div className="flex items-center text-green-500 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Taken at {format(new Date(record.takenTime), "h:mm a")}
                              </div>
                            ) : record.skipped ? (
                              <div className="flex items-center text-yellow-500 text-sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Skipped
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => markDoseTaken(record.id)}>
                                  Mark Taken
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => markDoseSkipped(record.id)}>
                                  Skip
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No adherence data available for this date.</p>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs">Perfect</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-xs">Partial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs">Missed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-medication">
          <Card>
            <CardHeader>
              <CardTitle>Adherence by Medication</CardTitle>
              <CardDescription>See which medications you're taking consistently</CardDescription>
            </CardHeader>
            <CardContent>
              {adherenceStats.byMedication.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No medication adherence data available</p>
                  <Link href="/dashboard/medications">
                    <Button variant="outline" className="mt-4">
                      Manage your medications
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {adherenceStats.byMedication.map((med) => (
                    <div key={med.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{med.name}</span>
                        <span className={getAdherenceColor(med.adherence)}>{med.adherence}%</span>
                      </div>
                      <AdherenceBar percentage={med.adherence} />
                      <div className="text-xs text-muted-foreground text-right">
                        {med.taken} of {med.total} doses taken
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-time">
          <Card>
            <CardHeader>
              <CardTitle>Adherence by Time of Day</CardTitle>
              <CardDescription>See which times of day you're most consistent with your medications</CardDescription>
            </CardHeader>
            <CardContent>
              {adherenceStats.byTime.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No time-based adherence data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adherenceStats.byTime.map((time) => (
                    <div key={time.time} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{time.time}</span>
                        <span className={getAdherenceColor(time.adherence)}>{time.adherence}%</span>
                      </div>
                      <AdherenceBar percentage={time.adherence} />
                      <div className="text-xs text-muted-foreground text-right">
                        {time.taken} of {time.total} doses taken
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-lg border p-4">
                <h3 className="font-medium">Insights</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {adherenceStats.byTime.length > 0 ? (
                    <>
                      <li className="flex items-start gap-2">
                        <CalendarIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span>
                          You're most consistent with your{" "}
                          {
                            adherenceStats.byTime.reduce((prev, current) =>
                              prev.adherence > current.adherence ? prev : current,
                            ).time
                          }{" "}
                          medications (
                          {
                            adherenceStats.byTime.reduce((prev, current) =>
                              prev.adherence > current.adherence ? prev : current,
                            ).adherence
                          }
                          %)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CalendarIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span>
                          {
                            adherenceStats.byTime.reduce((prev, current) =>
                              prev.adherence < current.adherence ? prev : current,
                            ).time
                          }{" "}
                          doses have the lowest adherence (
                          {
                            adherenceStats.byTime.reduce((prev, current) =>
                              prev.adherence < current.adherence ? prev : current,
                            ).adherence
                          }
                          %)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span>
                          Consider setting reminders for{" "}
                          {adherenceStats.byTime
                            .reduce((prev, current) => (prev.adherence < current.adherence ? prev : current))
                            .time.toLowerCase()}{" "}
                          medications
                        </span>
                      </li>
                    </>
                  ) : (
                    <li className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>Not enough data to generate insights yet</span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

