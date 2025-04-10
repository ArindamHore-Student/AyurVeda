/**
 * Medications Management Page
 * 
 * This component provides a comprehensive interface for users to manage their medications.
 * Key features include:
 * - Viewing a list of all medications with filtering and search capabilities
 * - Adding new medications
 * - Editing existing medications
 * - Deleting medications
 * - Detailed view of each medication
 * 
 * The component uses the MedicationProvider context for data fetching and state management,
 * which improves performance by avoiding redundant API calls and centralizing medication data.
 */

"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Trash2, Plus, Search, Filter, Calendar, Clock, AlertCircle, Info, Pill } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { useMedications, Medication } from "./medication-context"

/**
 * MedicationsPage Component
 * The main component that handles medication management functionality
 */
export default function MedicationsPage() {
  const { toast } = useToast()
  const { medications, loading, deleteMedication } = useMedications()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [filterCategory, setFilterCategory] = useState("all")

  /**
   * Filter and search medications based on user input
   * Applies filters for search term, status, and category
   * Memoized to prevent unnecessary recalculations
   */
  const filteredMedications = useMemo(() => {
    return medications.filter((med) => {
      // Search filter
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.purpose && med.purpose.toLowerCase().includes(searchTerm.toLowerCase()))

      // Status filter
      let matchesStatus = true
      if (filterStatus !== "all") {
        const today = new Date()
        const endDate = med.endDate ? new Date(med.endDate) : null
        
        if (filterStatus === "active" && endDate && endDate < today) {
          matchesStatus = false
        }
        if (filterStatus === "inactive" && (!endDate || endDate >= today)) {
          matchesStatus = false
        }
      }

      // Category filter
      let matchesCategory = true
      if (filterCategory !== "all") {
        matchesCategory = med.category === filterCategory
      }

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [medications, searchTerm, filterStatus, filterCategory])

  /**
   * Get unique medication categories for filtering
   * Memoized to prevent unnecessary recalculations
   */
  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(medications.map(med => med.category).filter(Boolean))
    )
  }, [medications])

  /**
   * Delete medication handler
   * Confirms with user before deleting
   */
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteMedication(id)
      
      if (success) {
        setSelectedMedication(null)
      }
    } catch (error) {
      console.error("Error deleting medication:", error)
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      })
    }
  }

  /**
   * Calculate medication adherence rate
   * @param medication - The medication to calculate adherence for
   * @returns Adherence percentage
   */
  const calculateAdherence = (medication: Medication) => {
    if (medication.remainingDoses === undefined || medication.totalDoses === undefined) return null
    const taken = medication.totalDoses - medication.remainingDoses
    return Math.round((taken / medication.totalDoses) * 100)
  }

  /**
   * Generate a status badge for a medication
   * @param medication - The medication to get status for
   * @returns UI component with appropriate status badge
   */
  const getMedicationStatusBadge = (medication: Medication) => {
    const today = new Date()
    const endDate = medication.endDate ? new Date(medication.endDate) : null
    
    if (endDate && endDate < today) {
      return <Badge variant="outline" className="bg-muted text-muted-foreground">Completed</Badge>
    }
    
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medications</h2>
          <p className="text-muted-foreground">
            Manage your medication regimen and track adherence
          </p>
        </div>

        <Link href="/dashboard/medications/add">
          <Button className="space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Medication</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Search</CardTitle>
            <CardDescription>Find medications by name or purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search medications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Status Filter</CardTitle>
            <CardDescription>Filter by medication status</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Medications</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Completed/Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Category Filter</CardTitle>
            <CardDescription>Filter by medication type</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category as string}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medication List</CardTitle>
              <CardDescription>
                {filteredMedications.length} medications found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                // Loading skeleton
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                      <Skeleton className="h-8 w-[90px]" />
                    </div>
                  ))}
                </div>
              ) : filteredMedications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Pill className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No medications found</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first medication to get started"}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Medication</DialogTitle>
                        <DialogDescription>
                          Enter the details for your new medication
                        </DialogDescription>
                      </DialogHeader>
                      {/* Add Medication Form */}
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMedications.map((medication) => (
                    <div
                      key={medication.id}
                      className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center"
                    >
                      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                        <div
                          className="h-8 w-8 rounded-full"
                          style={{ backgroundColor: medication.color || "#4f46e5" }}
                        />
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                            <h3 className="font-semibold">{medication.name}</h3>
                            {getMedicationStatusBadge(medication)}
                            {medication.category && (
                              <Badge variant="secondary" className="mr-2 mt-1 md:mt-0">
                                {medication.category}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" /> {medication.frequency}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(medication.startDate)}
                              {medication.endDate && ` to ${formatDate(medication.endDate)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:flex-col md:items-end">
                        {medication.remainingDoses !== undefined && medication.totalDoses !== undefined && (
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground">
                              {medication.remainingDoses}/{medication.totalDoses} doses
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMedication(medication)}
                          >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Details</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {medication.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(medication.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grid" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medication Grid</CardTitle>
              <CardDescription>
                {filteredMedications.length} medications found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3 rounded-md border p-4">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredMedications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Pill className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No medications found</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Add your first medication to get started"}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Medication</DialogTitle>
                        <DialogDescription>
                          Enter the details for your new medication
                        </DialogDescription>
                      </DialogHeader>
                      {/* Add Medication Form */}
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMedications.map((medication) => (
                    <Card key={medication.id} className="overflow-hidden">
                      <div
                        className="h-2 w-full"
                        style={{ backgroundColor: medication.color || "#4f46e5" }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{medication.name}</CardTitle>
                          {getMedicationStatusBadge(medication)}
                        </div>
                        <CardDescription>
                          {medication.dosage}, {medication.frequency}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {medication.purpose && (
                          <div className="mb-2">
                            <span className="font-semibold">Purpose:</span> {medication.purpose}
                          </div>
                        )}
                        {(medication.remainingDoses !== undefined && medication.totalDoses !== undefined) && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Remaining doses:</span>
                              <span className="font-medium">
                                {medication.remainingDoses}/{medication.totalDoses}
                              </span>
                            </div>
                            <Progress value={calculateAdherence(medication) || 0} className="h-2" />
                          </div>
                        )}
                        {medication.nextDose && (
                          <div className="mt-2 flex items-center text-sm">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>Next dose: {medication.nextDose}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={() => setSelectedMedication(medication)}
                        >
                          <Info className="mr-1 h-4 w-4" />
                          Details
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {medication.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(medication.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Medication Details Dialog */}
      {selectedMedication && (
        <Dialog open={!!selectedMedication} onOpenChange={(open) => !open && setSelectedMedication(null)}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedMedication.color || "#4f46e5" }}
                />
                {selectedMedication.name}
              </DialogTitle>
              <DialogDescription>Detailed medication information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Dosage</h4>
                  <p>{selectedMedication.dosage}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Frequency</h4>
                  <p>{selectedMedication.frequency}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Start Date</h4>
                  <p>{formatDate(selectedMedication.startDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">End Date</h4>
                  <p>{selectedMedication.endDate ? formatDate(selectedMedication.endDate) : "Ongoing"}</p>
                </div>
              </div>

              {selectedMedication.instructions && (
                <div>
                  <h4 className="text-sm font-medium">Instructions</h4>
                  <p className="text-sm">{selectedMedication.instructions}</p>
                </div>
              )}

              {selectedMedication.purpose && (
                <div>
                  <h4 className="text-sm font-medium">Purpose</h4>
                  <p className="text-sm">{selectedMedication.purpose}</p>
                </div>
              )}

              {selectedMedication.prescriptionId && (
                <div>
                  <h4 className="text-sm font-medium">Prescription ID</h4>
                  <p className="text-sm">{selectedMedication.prescriptionId}</p>
                </div>
              )}

              {selectedMedication.remainingDoses !== undefined && selectedMedication.totalDoses !== undefined && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Adherence Tracking</h4>
                  <div className="flex justify-between text-sm">
                    <span>Remaining doses:</span>
                    <span className="font-medium">
                      {selectedMedication.remainingDoses}/{selectedMedication.totalDoses}
                    </span>
                  </div>
                  <Progress value={calculateAdherence(selectedMedication) || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {calculateAdherence(selectedMedication)}% adherence rate
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedMedication.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(selectedMedication.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

