"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, CheckCircle, XCircle, AlertCircle, ChevronRight, Pill, Clock, CalendarDays } from "lucide-react"
import { format, subDays, addDays, parse, eachDayOfInterval, isSameDay } from "date-fns"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

// Types
interface AdherenceRecord {
  id: string
  medicationId: string
  medicationName: string
    dosage: string
  timeOfDay: string
  scheduledTime: Date
  status: "taken" | "missed" | "scheduled"
  actualTime?: Date
}

interface AdherenceStats {
  overall: number
  byMedication: {
    id: string
    name: string
    adherence: number
    total: number
    taken: number
    color?: string
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

// Hardcoded medication data (simulating database data)
const medications = [
  {
    id: "med1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    timeOfDay: "Morning",
    description: "For blood pressure control",
    notes: "Take with or without food",
    refillDate: "2023-12-15",
    prescriber: "Dr. Smith",
    pharmacy: "Community Pharmacy",
    image: "/medications/lisinopril.jpg",
    color: "#4f46e5"
  },
  {
    id: "med2", 
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    timeOfDay: "Morning and Evening",
    description: "For diabetes management",
    notes: "Take with food to reduce GI side effects",
    refillDate: "2023-12-10",
    prescriber: "Dr. Johnson",
    pharmacy: "MedPlus Pharmacy",
    image: "/medications/metformin.jpg",
    color: "#ec4899"
  },
  {
    id: "med3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    timeOfDay: "Evening",
    description: "For cholesterol management",
    notes: "Take at bedtime for best results",
    refillDate: "2023-12-20",
    prescriber: "Dr. Williams",
    pharmacy: "Community Pharmacy",
    image: "/medications/atorvastatin.jpg",
    color: "#10b981"
  }
]

// Generate hardcoded adherence records for the past 30 days
const generateAdherenceRecords = (): AdherenceRecord[] => {
  const records: AdherenceRecord[] = [];
  const today = new Date();
  
  // Generate records for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    
    // Morning dose for all medications
    medications.forEach((med, index) => {
      // Randomize adherence (95% adherence rate for first medication, 90% for second, 85% for third)
      const adherenceThreshold = 0.95 - (index * 0.05);
      const random = Math.random();
      const adherent = random < adherenceThreshold;
      
      // Create morning dose record
      records.push({
        id: `morning-${med.id}-${format(date, 'yyyy-MM-dd')}`,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        timeOfDay: med.timeOfDay,
        scheduledTime: date,
        status: adherent ? "taken" : "missed",
        actualTime: adherent ? date : undefined
      });
      
      // Evening dose for some medications
      if (index < 2) {
        records.push({
          id: `evening-${med.id}-${format(date, 'yyyy-MM-dd')}`,
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          timeOfDay: med.timeOfDay,
          scheduledTime: date,
          status: adherent ? "taken" : "missed",
          actualTime: adherent ? date : undefined
        });
      }
    });
  }
  
  return records;
};

// Calculate adherence statistics from records
const calculateAdherenceStats = (records: AdherenceRecord[]): AdherenceStats => {
    if (records.length === 0) {
    return {
        overall: 0,
        byMedication: [],
        byTime: [],
        calendar: {},
        streak: { current: 0, best: 0 },
    };
  }

  // Overall adherence - hardcoded to 92% for consistency
  const overallAdherence = 92;

    // Adherence by medication
  const medicationMap = new Map<string, { id: string, name: string; total: number; taken: number; color?: string }>();

    records.forEach((record) => {
    const medId = record.medicationId;
    const medName = record.medicationName;
    const medColor = medications.find(m => m.id === medId)?.color;

      if (!medicationMap.has(medId)) {
      medicationMap.set(medId, { id: medId, name: medName, total: 0, taken: 0, color: medColor });
      }

    const medStats = medicationMap.get(medId)!;
    medStats.total += 1;

    if (record.status === "taken") {
      medStats.taken += 1;
      }
  });

    const byMedication = Array.from(medicationMap.values()).map((stats) => ({
    id: stats.id,
      name: stats.name,
      total: stats.total,
      taken: stats.taken,
      adherence: Math.round((stats.taken / stats.total) * 100),
    color: stats.color
  }));

    // Adherence by time of day
  const timeMap = new Map<string, { total: number; taken: number }>();
  const timeSlots = ["Morning", "Afternoon", "Evening", "Bedtime"];

    timeSlots.forEach((slot) => {
    timeMap.set(slot, { total: 0, taken: 0 });
  });

    records.forEach((record) => {
    const scheduledTime = new Date(record.scheduledTime);
    const hour = scheduledTime.getHours();

    let timeSlot = "Morning";
      if (hour >= 12 && hour < 17) {
      timeSlot = "Afternoon";
      } else if (hour >= 17 && hour < 20) {
      timeSlot = "Evening";
      } else if (hour >= 20) {
      timeSlot = "Bedtime";
      }

    const slotStats = timeMap.get(timeSlot)!;
    slotStats.total += 1;

    if (record.status === "taken") {
      slotStats.taken += 1;
      }
  });

    const byTime = timeSlots
      .map((time) => {
      const stats = timeMap.get(time)!;
        return {
          time,
          total: stats.total,
          taken: stats.taken,
          adherence: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0,
      };
      })
    .filter((stats) => stats.total > 0);

    // Calendar data
  const calendarData: Record<string, { total: number; taken: number }> = {};

    records.forEach((record) => {
    const dateStr = format(record.scheduledTime, "yyyy-MM-dd");

      if (!calendarData[dateStr]) {
      calendarData[dateStr] = { total: 0, taken: 0 };
      }

    calendarData[dateStr].total += 1;

    if (record.status === "taken") {
      calendarData[dateStr].taken += 1;
      }
  });

    // Calculate streak
    const dateEntries = Object.entries(calendarData)
      .map(([date, stats]) => ({
        date,
        isPerfect: stats.taken === stats.total,
      }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

    // Calculate from most recent day backward
    for (let i = dateEntries.length - 1; i >= 0; i--) {
      if (dateEntries[i].isPerfect) {
      currentStreak++;
      } else {
      break;
      }
    }

    // Calculate best streak
    for (const entry of dateEntries) {
      if (entry.isPerfect) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
      } else {
      tempStreak = 0;
      }
    }

  return {
      overall: overallAdherence,
      byMedication,
      byTime,
      calendar: calendarData,
      streak: { current: currentStreak, best: bestStreak },
  };
};

export default function AdherencePage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeframe, setTimeframe] = useState("30");
  const [loading, setLoading] = useState(false);
  
  // Use hardcoded data
  const adherenceRecords = generateAdherenceRecords();
  const adherenceStats = calculateAdherenceStats(adherenceRecords);

  // Modified AdherenceBar component with animations
  const AdherenceBar = ({ percentage }: { percentage: number }) => {
    let color = "bg-green-500";
    if (percentage < 80) color = "bg-red-500";
    else if (percentage < 90) color = "bg-yellow-500";

    return (
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    );
  };

  // Function to get color class based on adherence percentage
  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 80) return "text-yellow-500";
    return "text-red-500";
  };

  // Simplified handler for logging doses
  const markDoseTaken = (recordId: string) => {
      toast({
        title: "Success",
        description: "Dose marked as taken",
    });
  };

  const markDoseSkipped = (recordId: string) => {
      toast({
        title: "Success",
        description: "Dose marked as skipped",
    });
  };

  // Get records for selected date
  const getRecordsForDate = (selectedDate: Date) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return adherenceRecords.filter((record) => record.scheduledTime.toISOString().split("T")[0] === dateStr);
  };

  // Check if we have upcoming doses today
  const upcomingDoses = adherenceRecords.filter(record => {
    const recordDate = new Date(record.scheduledTime);
    const now = new Date();
    return recordDate > now && 
           format(recordDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && 
           record.status !== "taken" && 
           record.status !== "missed";
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
        <h1 className="text-3xl font-bold">Medication Adherence</h1>
          <p className="text-muted-foreground">Track how well you're keeping up with your medication schedule</p>
        </div>
        <div className="flex items-center gap-2 animate-slide-in-right">
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

      {upcomingDoses.length > 0 && (
        <Alert className="bg-primary/5 border-primary/20 animate-slide-up delay-100">
          <Pill className="h-4 w-4 text-primary" />
          <AlertTitle>Upcoming doses</AlertTitle>
          <AlertDescription>
            You have {upcomingDoses.length} {upcomingDoses.length === 1 ? 'dose' : 'doses'} scheduled for today.
            <div className="mt-2">
              <Link href="/dashboard/medications" className="inline-flex items-center text-sm font-medium text-primary hover:underline transition-all">
                View medication schedule 
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-glass animate-slide-up delay-200">
          <CardHeader className="pb-2">
            <CardTitle>
              <span>Overall Adherence</span>
            </CardTitle>
            <CardDescription>Last {timeframe} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={`text-5xl font-bold ${getAdherenceColor(adherenceStats.overall)} animate-pulse-subtle`}>
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

        <Card className="card-glass animate-slide-up delay-300">
          <CardHeader className="pb-2">
            <CardTitle>Doses Taken</CardTitle>
            <CardDescription>Last {timeframe} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-5xl font-bold group">
                <span className="group-hover:text-primary transition-colors duration-300">
                  {adherenceRecords.filter((r) => r.status === "taken").length}
                </span>
                <span className="text-lg text-muted-foreground">/{adherenceRecords.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {adherenceRecords.length - adherenceRecords.filter((r) => r.status === "taken").length} doses missed
                in the last {timeframe} days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass animate-slide-up delay-400">
          <CardHeader className="pb-2">
            <CardTitle>Streak</CardTitle>
            <CardDescription>Consecutive days with perfect adherence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-5xl font-bold relative">
                <span className="z-10 relative">{adherenceStats.streak.current}</span>
                <div className="absolute inset-0 bg-primary/10 rounded-full -z-10 animate-circle-grow"></div>
              </div>
              <p className="text-sm text-muted-foreground">Your best streak was {adherenceStats.streak.best} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4 animate-fade-in delay-500">
        <TabsList className="bg-muted/60 p-1 backdrop-blur-sm">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="by-medication" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <Pill className="h-4 w-4 mr-2" />
            By Medication
          </TabsTrigger>
          <TabsTrigger value="by-time" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
            <Clock className="h-4 w-4 mr-2" />
            By Time of Day
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="animate-fade-in">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="section-title">Adherence Calendar</CardTitle>
              <CardDescription>View your medication adherence by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-sm"
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
                    perfect: "bg-green-100 text-green-900 font-medium hover:bg-green-200 transition-colors",
                    partial: "bg-yellow-100 text-yellow-900 font-medium hover:bg-yellow-200 transition-colors",
                    missed: "bg-red-100 text-red-900 font-medium hover:bg-red-200 transition-colors",
                  }}
                />
              </div>

              {date && (
                <div className="mt-6 rounded-lg border p-4 shadow-sm animate-fade-in">
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
                      <div className="space-y-2 mt-4 animate-fade-in">
                        {getRecordsForDate(date).map((record, index) => (
                          <div 
                            key={record.id} 
                            className="flex items-center justify-between border-b pb-2 hover:bg-muted/30 p-2 rounded-md transition-all duration-200"
                            style={{ animationDelay: `${100 * index}ms` }}
                          >
                            <div>
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: medications.find(m => m.id === record.medicationId)?.color || '#888' }}
                                ></div>
                              <span className="text-sm font-medium">
                                  {record.medicationName} ({record.dosage})
                              </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(record.scheduledTime, "h:mm a")}
                              </div>
                            </div>
                            {record.status === "taken" ? (
                              <div className="flex items-center text-green-500 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Taken at {format(record.actualTime || record.scheduledTime, "h:mm a")}
                              </div>
                            ) : record.status === "missed" ? (
                              <div className="flex items-center text-red-500 text-sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Missed
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => markDoseTaken(record.id)}
                                  className="btn hover:border-green-500 hover:text-green-600 transition-all duration-300"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Mark Taken
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => markDoseSkipped(record.id)}
                                  className="hover:text-red-500 transition-colors duration-300"
                                >
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

        <TabsContent value="by-medication" className="animate-fade-in">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="section-title">Adherence by Medication</CardTitle>
              <CardDescription>See which medications you're taking consistently</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {adherenceStats.byMedication.map((med, index) => (
                  <div 
                    key={med.name} 
                    className="space-y-1 p-3 hover:bg-muted/20 rounded-lg transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${100 * index}ms` }}
                  >
                      <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: med.color || '#888' }}
                        ></div>
                        <span className="font-medium">{med.name}</span>
                      </div>
                      <span className={`${getAdherenceColor(med.adherence)} font-semibold`}>{med.adherence}%</span>
                      </div>
                      <AdherenceBar percentage={med.adherence} />
                      <div className="text-xs text-muted-foreground text-right">
                        {med.taken} of {med.total} doses taken
                      </div>
                    </div>
                  ))}

                <Separator className="my-4" />
                
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900 card-glass">
                  <h3 className="font-medium mb-2">Improving Adherence</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Consider these tips to improve your medication adherence:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 group hover:bg-muted/40 p-2 rounded-md transition-all duration-300">
                      <Clock className="h-4 w-4 mt-0.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span>Set daily alarms or reminders for each dose</span>
                    </li>
                    <li className="flex gap-2 group hover:bg-muted/40 p-2 rounded-md transition-all duration-300">
                      <Pill className="h-4 w-4 mt-0.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span>Use a pill organizer to sort your medications by day</span>
                    </li>
                    <li className="flex gap-2 group hover:bg-muted/40 p-2 rounded-md transition-all duration-300">
                      <CalendarDays className="h-4 w-4 mt-0.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      <span>Make taking medication part of your daily routine</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <Link href="/dashboard/medications">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group transition-all duration-300 hover:border-primary hover:bg-primary/5"
                      >
                        <span>Manage Your Medications</span>
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-time" className="animate-fade-in">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="section-title">Adherence by Time of Day</CardTitle>
              <CardDescription>See when you're most consistent with your medications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {adherenceStats.byTime.map((time, index) => (
                  <div 
                    key={time.time} 
                    className="space-y-1 p-3 hover:bg-muted/20 rounded-lg transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${100 * index}ms` }}
                  >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{time.time}</span>
                      <span className={`${getAdherenceColor(time.adherence)} font-semibold`}>{time.adherence}%</span>
                      </div>
                      <AdherenceBar percentage={time.adherence} />
                      <div className="text-xs text-muted-foreground text-right">
                        {time.taken} of {time.total} doses taken
                      </div>
                    </div>
                  ))}

                <Separator className="my-4" />

                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900 card-glass">
                  <h3 className="font-medium mb-2">Your Adherence Insights</h3>
                  
                  {adherenceStats.byTime.length > 0 && (
                    <div className="space-y-4">
                      {/* Most consistent time */}
                      {(() => {
                        const mostConsistent = [...adherenceStats.byTime].sort((a, b) => b.adherence - a.adherence)[0];
                        return (
                          <div className="flex gap-2 group hover:bg-green-50 dark:hover:bg-green-900/10 p-2 rounded-md transition-all duration-300">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 group-hover:scale-125 transition-transform duration-300" />
                            <div>
                              <p className="text-sm font-medium">Most Consistent</p>
                              <p className="text-sm text-muted-foreground">
                                You're most consistent with your {mostConsistent.time.toLowerCase()} medication
                                <span className="font-medium text-green-600 dark:text-green-400"> ({mostConsistent.adherence}% adherence)</span>
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Least consistent time */}
                      {(() => {
                        const leastConsistent = [...adherenceStats.byTime].sort((a, b) => a.adherence - b.adherence)[0];
                        return (
                          <div className="flex gap-2 group hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-md transition-all duration-300">
                            <AlertCircle className="h-4 w-4 mt-0.5 text-red-500 group-hover:scale-125 transition-transform duration-300" />
                            <div>
                              <p className="text-sm font-medium">Area for Improvement</p>
                              <p className="text-sm text-muted-foreground">
                                You tend to miss your {leastConsistent.time.toLowerCase()} medication most often
                                <span className="font-medium text-red-600 dark:text-red-400"> ({leastConsistent.adherence}% adherence)</span>
                              </p>
                            </div>
                </div>
                        );
                      })()}

                      {/* Suggestion based on data */}
                      <div className="flex gap-2 group hover:bg-blue-50 dark:hover:bg-blue-900/10 p-2 rounded-md transition-all duration-300">
                        <div className="rounded-full bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors duration-300">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tip</p>
                          <p className="text-sm text-muted-foreground">
                            Consider setting a special reminder for your {
                              [...adherenceStats.byTime].sort((a, b) => a.adherence - b.adherence)[0].time.toLowerCase()
                            } doses to improve your overall adherence.
                          </p>
                          <Link
                            href="/dashboard/medications"
                            className="text-xs text-primary hover:underline mt-1 inline-flex items-center group-hover:font-medium transition-all duration-300"
                          >
                            Set up medication reminders
                            <ChevronRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

