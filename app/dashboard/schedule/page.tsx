"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isBefore } from "date-fns"
import { Check, X, Calendar as CalendarIcon, Clock } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Types
interface MedicationDose {
  medicationId: string
  medicationName: string
  dosage: string
  instructions?: string
  time: string
  label: string
  adherenceRecordId: string | null
  taken: boolean
  skipped: boolean
}

export default function SchedulePage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<MedicationDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDates, setCalendarDates] = useState<Record<string, { total: number; taken: number }>>({});
  
  // Fetch schedule for selected date
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(
          `/api/medications/schedule?date=${selectedDate.toISOString()}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch schedule");
        
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast({
          title: "Error",
          description: "Failed to load medication schedule. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [selectedDate, toast]);
  
  // Fetch calendar data
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Get start and end of month
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const response = await fetch(
          `/api/adherence?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch adherence data");
        
        const records = await response.json();
        
        // Process records into calendar data
        const calendarData: Record<string, { total: number; taken: number }> = {};
        
        records.forEach((record: any) => {
          const dateStr = record.scheduledTime.split("T")[0];
          
          if (!calendarData[dateStr]) {
            calendarData[dateStr] = { total: 0, taken: 0 };
          }
          
          calendarData[dateStr].total += 1;
          
          if (record.takenTime || record.skipped) {
            calendarData[dateStr].taken += 1;
          }
        });
        
        setCalendarDates(calendarData);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    };
    
    fetchCalendarData();
  }, [selectedDate]);
  
  // Mark dose as taken
  const markDoseTaken = async (dose: MedicationDose) => {
    if (!dose.adherenceRecordId) {
      // Create new adherence record
      try {
        const response = await fetch("/api/adherence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicationId: dose.medicationId,
            scheduledTime: dose.time,
            takenTime: new Date().toISOString(),
          }),
        });
        
        if (!response.ok) throw new Error("Failed to create adherence record");
        
        const newRecord = await response.json();
        
        // Update local state
        setSchedule(prev => 
          prev.map(d => 
            d.medicationId === dose.medicationId && d.time === dose.time
              ? { ...d, adherenceRecordId: newRecord.id, taken: true, skipped: false }
              : d
          )
        );
        
        toast({
          title: "Success",
          description: "Dose marked as taken",
        });
      } catch (error) {
        console.error("Error creating adherence record:", error);
        toast({
          title: "Error",
          description: "Failed to mark dose as taken. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Update existing adherence record
      try {
        const response = await fetch(`/api/adherence/${dose.adherenceRecordId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            takenTime: new Date().toISOString(),
            skipped: false,
          }),
        });
        
        if (!response.ok) throw new Error("Failed to update adherence record");
        
        // Update local state
        setSchedule(prev => 
          prev.map(d => 
            d.adherenceRecordId === dose.adherenceRecordId
              ? { ...d, taken: true, skipped: false }
              : d
          )
        );
        
        toast({
          title: "Success",
          description: "Dose marked as taken",
        });
      } catch (error) {
        console.error("Error updating adherence record:", error);
        toast({
          title: "Error",
          description: "Failed to mark dose as taken. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Mark dose as skipped
  const markDoseSkipped = async (dose: MedicationDose) => {
    if (!dose.adherenceRecordId) {
      // Create new adherence record
      try {
        const response = await fetch("/api/adherence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicationId: dose.medicationId,
            scheduledTime: dose.time,
            skipped: true,
          }),
        });
        
        if (!response.ok) throw new Error("Failed to create adherence record");
        
        const newRecord = await response.json();
        
        // Update local state
        setSchedule(prev => 
          prev.map(d => 
            d.medicationId === dose.medicationId && d.time === dose.time
              ? { ...d, adherenceRecordId: newRecord.id, taken: false, skipped: true }
              : d
          )
        );
        
        toast({
          title: "Success",
          description: "Dose marked as skipped",
        });
      } catch (error) {
        console.error("Error creating adherence record:", error);
        toast({
          title: "Error",
          description: "Failed to mark dose as skipped. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Update existing adherence record
      try {
        const response = await fetch(`/api/adherence/${dose.adherenceRecordId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            takenTime: null,
            skipped: true,
          }),
        });
        
        if (!response.ok) throw new Error("Failed to update adherence record");
        
        // Update local state
        setSchedule(prev => 
          prev.map(d => 
            d.adherenceRecordId === dose.adherenceRecordId
              ? { ...d, taken: false, skipped: true }
              : d
          )
        );
        
        toast({
          title: "Success",
          description: "Dose marked as skipped",
        });
      } catch (error) {
        console.error("Error updating adherence record:", error);
        toast({
          title: "Error",
          description: "Failed to mark dose as skipped. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Group doses by time
  const groupedSchedule = schedule.reduce((acc, dose) => {
    const timeKey = dose.label;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(dose);
    return acc;
  }, {} as Record<string, MedicationDose[]>);

  // Custom day render function for calendar
  const renderDay = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    const dateData = calendarDates[dateStr];

    // Only render custom day component if there's data for this date
    if (dateData) {
      const percentage = Math.round((dateData.taken / dateData.total) * 100);
      let bgColor = "bg-green-500";
      
      if (percentage < 50) {
        bgColor = "bg-red-500";
      } else if (percentage < 80) {
        bgColor = "bg-yellow-500";
      }

      return (
        <div className="relative flex h-9 w-9 items-center justify-center">
          <div className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${bgColor}`} />
          <span>{day.getDate()}</span>
        </div>
      );
    }

    return <div className="flex h-9 w-9 items-center justify-center">{day.getDate()}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medication Schedule</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-3">
        <Card className="md:col-span-3 lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View your medication schedule by date</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              components={{
                Day: ({ date }) => renderDay(date),
              }}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>90-100%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>50-89%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>0-49%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {isToday(selectedDate) ? "Today's Schedule" : format(selectedDate, "MMMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  Your medication schedule for {isToday(selectedDate) ? "today" : format(selectedDate, "EEEE")}
                </CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 w-9 p-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading schedule...</span>
              </div>
            ) : schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No medications scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSchedule).map(([timeLabel, doses]) => (
                  <div key={timeLabel} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{timeLabel}</h3>
                    </div>
                    <div className="divide-y rounded-md border">
                      {doses.map((dose) => {
                        const isPast = isBefore(new Date(dose.time), new Date());
                        return (
                          <div key={`${dose.medicationId}-${dose.time}`} className="flex items-center justify-between p-4">
                            <div>
                              <div className="font-medium">{dose.medicationName}</div>
                              <div className="text-sm text-muted-foreground">{dose.dosage}{dose.instructions ? ` - ${dose.instructions}` : ""}</div>
                            </div>
                            {dose.taken ? (
                              <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <Check className="h-3 w-3" />
                                Taken
                              </Badge>
                            ) : dose.skipped ? (
                              <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                <X className="h-3 w-3" />
                                Skipped
                              </Badge>
                            ) : (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => markDoseTaken(dose)}
                                  variant="outline"
                                  className="h-8 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                                >
                                  <Check className="mr-1 h-3 w-3" /> 
                                  Take
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => markDoseSkipped(dose)}
                                  variant="outline"
                                  className="h-8 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
                                >
                                  <X className="mr-1 h-3 w-3" /> 
                                  Skip
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

