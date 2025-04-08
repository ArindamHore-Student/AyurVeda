import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicationList } from "@/components/dashboard/medication-list"
import { RecentInteractions } from "@/components/dashboard/recent-interactions"
import { UpcomingDoses } from "@/components/dashboard/upcoming-doses"
import Link from "next/link"
import { 
  Plus, 
  PieChart, 
  LineChart, 
  CalendarDays, 
  Clock, 
  AlarmClock, 
  Pill, 
  AlertTriangle,
  Activity,
  CalendarCheck,
  ShieldCheck,
  BarChart3,
  ArrowUpRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * Dashboard Component
 * 
 * Main dashboard page showing medication overview, adherence statistics,
 * upcoming doses, and potential interactions in a visually appealing format.
 */
export default function Dashboard() {
  // Adherence data for the chart
  const adherenceData = [
    { day: "Mon", adherence: 100 },
    { day: "Tue", adherence: 100 },
    { day: "Wed", adherence: 75 },
    { day: "Thu", adherence: 100 },
    { day: "Fri", adherence: 100 },
    { day: "Sat", adherence: 50 },
    { day: "Sun", adherence: 100 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between card-header">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your medication regimen.
          </p>
        </div>
        <Link href="/dashboard/medications/add">
          <Button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            <PieChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="medications" className="data-[state=active]:bg-background">
            <Pill className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="interactions" className="data-[state=active]:bg-background">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Interactions
          </TabsTrigger>
          <TabsTrigger value="adherence" className="data-[state=active]:bg-background">
            <Activity className="h-4 w-4 mr-2" />
            Adherence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card relative overflow-hidden">
              <div className="absolute right-0 top-0 h-16 w-16 opacity-30">
                <Pill className="h-12 w-12 text-primary/50 absolute right-1 top-1" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <span>Active Medications</span>
                </CardTitle>
                <CardDescription>Currently prescribed medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    <Pill className="h-3 w-3 mr-1" />
                    3 Daily
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10">
                    <Clock className="h-3 w-3 mr-1" />
                    2 As needed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card relative overflow-hidden">
              <div className="absolute right-0 top-0 h-16 w-16 opacity-30">
                <AlarmClock className="h-12 w-12 text-secondary/50 absolute right-1 top-1" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Doses</CardTitle>
                <CardDescription>Doses scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="bg-secondary/10">
                    <Clock className="h-3 w-3 mr-1" />
                    Next: Lisinopril 10mg (8:00 AM)
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="card relative overflow-hidden">
              <div className="absolute right-0 top-0 h-16 w-16 opacity-30">
                <Activity className="h-12 w-12 text-accent/50 absolute right-1 top-1" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle>Adherence Rate</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92%</div>
                <div className="mt-2">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: "92%" }}></div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="text-accent font-medium">4% improvement</span> from last month
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <span className="flex items-center">
                        <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                        Today's Schedule
                      </span>
                    </CardTitle>
                    <CardDescription>Your medication schedule for today</CardDescription>
                  </div>
                  <Link href="/dashboard/adherence">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span className="text-xs">View All</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-sm font-medium">Morning</span>
                      <span className="text-xs text-muted-foreground">8:00 AM - 10:00 AM</span>
                    </div>
                    <div className="rounded-lg border border-border p-3 relative">
                      <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-lg"></div>
                      <div className="pl-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10">
                              <Clock className="h-3 w-3 mr-1" />
                              8:00 AM
                            </Badge>
                            <span className="font-medium">Lisinopril 10mg</span>
                          </div>
                          <Badge>Taken</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Take with water, before breakfast</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-sm font-medium">Afternoon</span>
                      <span className="text-xs text-muted-foreground">12:00 PM - 2:00 PM</span>
                    </div>
                    <div className="rounded-lg border border-border p-3 relative">
                      <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-lg"></div>
                      <div className="pl-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10">
                              <Clock className="h-3 w-3 mr-1" />
                              12:00 PM
                            </Badge>
                            <span className="font-medium">Metformin 500mg</span>
                          </div>
                          <Badge>Taken</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Take with food to reduce stomach upset</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-sm font-medium">Evening</span>
                      <span className="text-xs text-muted-foreground">6:00 PM - 10:00 PM</span>
                    </div>
                    <div className="rounded-lg border border-border p-3 relative">
                      <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 rounded-l-lg"></div>
                      <div className="pl-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-secondary/10">
                              <Clock className="h-3 w-3 mr-1" />
                              6:00 PM
                            </Badge>
                            <span className="font-medium">Metformin 500mg</span>
                          </div>
                          <Button size="sm" variant="default">Mark as Taken</Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Take with dinner</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3 relative">
                      <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 rounded-l-lg"></div>
                      <div className="pl-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-secondary/10">
                              <Clock className="h-3 w-3 mr-1" />
                              9:00 PM
                            </Badge>
                            <span className="font-medium">Atorvastatin 20mg</span>
                          </div>
                          <Button size="sm" variant="default">Mark as Taken</Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Take at the same time each night</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <span className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                        Potential Interactions
                      </span>
                    </CardTitle>
                    <CardDescription>Identified medication interactions</CardDescription>
                  </div>
                  <Link href="/dashboard/interactions">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span className="text-xs">Check Interactions</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-destructive flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Lisinopril + Potassium supplements
                      </div>
                      <Badge variant="destructive">HIGH risk</Badge>
                    </div>
                    <p className="mt-2 text-sm">May increase risk of hyperkalemia (high potassium levels)</p>
                    <div className="mt-2 flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Monitor potassium levels closely. Consider lowering potassium supplement dose.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full">View Details</Button>
                  </div>

                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-amber-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Atorvastatin + Grapefruit juice
                      </div>
                      <Badge className="bg-amber-500">MEDIUM risk</Badge>
                    </div>
                    <p className="mt-2 text-sm">May increase statin concentration and risk of side effects</p>
                    <div className="mt-2 flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Avoid drinking grapefruit juice while taking atorvastatin.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full">View Details</Button>
                  </div>

                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-amber-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Sertraline + Ibuprofen
                      </div>
                      <Badge className="bg-amber-500">MEDIUM risk</Badge>
                    </div>
                    <p className="mt-2 text-sm">May increase risk of bleeding</p>
                    <div className="mt-2 flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Use caution when combining these medications. Consider acetaminophen instead.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <span className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Weekly Adherence
                      </span>
                    </CardTitle>
                    <CardDescription>Your medication adherence for the past week</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full">
                  <div className="flex justify-between items-end h-[200px] pt-6 pb-2">
                    {adherenceData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center w-1/7">
                        <div className="relative w-8 mx-auto">
                          <div className="bg-muted h-[180px] w-8 rounded-md"></div>
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-md w-8" 
                            style={{ height: `${item.adherence}%` }}
                          ></div>
                          <div className="absolute top-0 left-0 right-0 flex items-center justify-center w-8 h-8 text-xs font-medium text-white">
                            {item.adherence}%
                          </div>
                        </div>
                        <div className="mt-2 text-xs font-medium">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <span className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                        Medication Health Impact
                      </span>
                    </CardTitle>
                    <CardDescription>How medications are affecting your health metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Blood Pressure</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-700">
                        Improved
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lisinopril has reduced your blood pressure from 150/95 to 128/82 mmHg
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Blood Glucose</span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700">
                        Stabilizing
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Metformin is helping to stabilize your fasting glucose levels
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cholesterol</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-700">
                        Improved
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Atorvastatin has reduced your LDL from 160 to 112 mg/dL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mood</span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-700">
                        Improved
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sertraline has helped stabilize mood and reduce anxiety symptoms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications">
          <Card className="card">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-primary" />
                  Your Medications
                </span>
              </CardTitle>
              <CardDescription>Manage your current medications and prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <MedicationList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card className="card">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                  Drug Interactions
                </span>
              </CardTitle>
              <CardDescription>Check for potential interactions between your medications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/dashboard/interactions">
                  <Button className="w-full">Check for Interactions</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adherence">
          <Card className="card">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Medication Adherence
                </span>
              </CardTitle>
              <CardDescription>Track your medication adherence over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Overall Adherence</div>
                    <div className="text-2xl font-bold">92%</div>
                    <div className="text-xs text-green-600 mt-1">+4% from last month</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Doses Taken</div>
                    <div className="text-2xl font-bold">86/90</div>
                    <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">Perfect Days</div>
                    <div className="text-2xl font-bold">26/30</div>
                    <div className="text-xs text-muted-foreground mt-1">Days all doses taken</div>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Medication Adherence Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lisinopril 10mg</span>
                        <span className="text-sm font-medium">98%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "98%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Taken 29/30 days</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Metformin 500mg (AM)</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Taken 30/30 days</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Metformin 500mg (PM)</span>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Taken 27/30 days</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Atorvastatin 20mg</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "87%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Taken 26/30 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

