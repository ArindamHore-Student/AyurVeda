"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Pill, AlertCircle, Info } from "lucide-react"

interface MedicationInfoProps {
  medicationName: string
}

interface MedicationInfo {
  name: string
  description: string
  usedFor: string[]
  sideEffects: string[]
  warnings: string[]
  interactions: string[]
  dosageInfo: string
}

export function MedicationInfoPanel({ medicationName }: MedicationInfoProps) {
  const { toast } = useToast()
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedicationInfo = async () => {
      if (!medicationName) return

      setLoading(true)
      try {
        const response = await fetch(`/api/medications/info?name=${encodeURIComponent(medicationName)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch medication information")
        }

        const data = await response.json()
        setMedicationInfo(data)
      } catch (error) {
        console.error("Error fetching medication info:", error)
        toast({
          title: "Error",
          description: "Failed to load medication information. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMedicationInfo()
  }, [medicationName, toast])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!medicationInfo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40 text-center">
            <div>
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No information available for this medication</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          <CardTitle>{medicationInfo.name}</CardTitle>
        </div>
        <CardDescription>{medicationInfo.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sideEffects">Side Effects</TabsTrigger>
            <TabsTrigger value="warnings">Warnings</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Used For</h4>
              <div className="flex flex-wrap gap-2">
                {medicationInfo.usedFor.map((condition, index) => (
                  <Badge key={index} variant="secondary">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Dosage Information</h4>
              <p className="text-sm text-muted-foreground">{medicationInfo.dosageInfo}</p>
            </div>
          </TabsContent>

          <TabsContent value="sideEffects" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Common Side Effects</h4>
              <ul className="list-disc pl-5 space-y-1">
                {medicationInfo.sideEffects.map((effect, index) => (
                  <li key={index} className="text-sm">
                    {effect}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Important Warnings</h4>
              <ul className="list-disc pl-5 space-y-1">
                {medicationInfo.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Potential Interactions</h4>
              <ul className="list-disc pl-5 space-y-1">
                {medicationInfo.interactions.map((interaction, index) => (
                  <li key={index} className="text-sm">
                    {interaction}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 rounded-md bg-muted p-3 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            This information is for educational purposes only. Always consult with your healthcare provider for medical
            advice.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

