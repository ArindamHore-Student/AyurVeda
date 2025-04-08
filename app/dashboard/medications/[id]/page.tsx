"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Edit, Trash2, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { MedicationInfoPanel } from "@/components/dashboard/medication-info"
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

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  instructions?: string
  startDate: string
  endDate?: string
  purpose?: string
  prescriptionId?: string
}

export default function MedicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  const [medication, setMedication] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await fetch(`/api/medications/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch medication")
        }

        const data = await response.json()
        setMedication(data)
      } catch (error) {
        console.error("Error fetching medication:", error)
        toast({
          title: "Error",
          description: "Failed to load medication details",
          variant: "destructive",
        })
        router.push("/dashboard/medications")
      } finally {
        setLoading(false)
      }
    }

    fetchMedication()
  }, [id, router, toast])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete medication")
      }

      toast({
        title: "Success",
        description: "Medication deleted successfully",
      })

      router.push("/dashboard/medications")
    } catch (error) {
      console.error("Error deleting medication:", error)
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading medication details...</p>
        </div>
      </div>
    )
  }

  if (!medication) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/dashboard/medications" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Medication Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The requested medication could not be found.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/medications")}>
              Back to Medications
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard/medications" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{medication.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/medications/edit/${id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this medication? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Medication Details</CardTitle>
            <CardDescription>Information about your medication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dosage</h3>
                <p>{medication.dosage}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Frequency</h3>
                <p>{medication.frequency}</p>
              </div>
            </div>

            {medication.purpose && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Purpose</h3>
                <p>{medication.purpose}</p>
              </div>
            )}

            {medication.instructions && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Instructions</h3>
                <p>{medication.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Start Date</h3>
                  <p className="text-sm">{format(new Date(medication.startDate), "PPP")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">End Date</h3>
                  <p className="text-sm">
                    {medication.endDate ? format(new Date(medication.endDate), "PPP") : "Ongoing"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/dashboard/medications/edit/${id}`} className="w-full">
              <Button className="w-full">Edit Medication</Button>
            </Link>
          </CardFooter>
        </Card>

        <MedicationInfoPanel medicationName={medication.name} />
      </div>
    </div>
  )
}

