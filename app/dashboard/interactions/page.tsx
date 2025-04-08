"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  AlertCircle, 
  X, 
  Info, 
  ExternalLink, 
  Search, 
  Shield, 
  Pill, 
  BookOpen, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

/**
 * Types for the Interactions page
 */
interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  purpose?: string
}

interface Interaction {
  id: string
  medications: { id: string; name: string }[]
  severity: string
  description: string
  recommendation?: string
}

/**
 * InteractionsPage Component
 * 
 * Provides a user interface to check potential drug interactions either by
 * selecting from saved medications or by describing medications in text.
 * 
 * Features:
 * - Text input for entering medication descriptions
 * - Interactive analysis of potential drug interactions
 * - Detailed information about interaction severity and recommendations
 * - Educational information about drug interaction risks
 */
export default function InteractionsPage() {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const [currentSelection, setCurrentSelection] = useState<string>("")
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  
  // Text-based interaction checker state
  const [medicationText, setMedicationText] = useState("")
  const [textInteractions, setTextInteractions] = useState<Interaction[]>([])
  const [checkingText, setCheckingText] = useState(false)

  // Example medications for the animation
  const exampleMedications = [
    "Lisinopril 10mg", 
    "Atorvastatin 20mg", 
    "Metformin 500mg", 
    "Sertraline 50mg",
    "Ibuprofen 200mg",
    "Vitamin D 1000IU"
  ]

  // Common combinations people ask about
  const commonCombinations = [
    {
      combo: "Blood pressure medications + Pain relievers",
      description: "Check interactions between medications like Lisinopril and over-the-counter pain medications"
    },
    {
      combo: "Statins + Grapefruit juice",
      description: "Learn how grapefruit affects cholesterol medications like Atorvastatin"
    },
    {
      combo: "Antidepressants + Sleep aids",
      description: "Understand potential risks when combining these types of medications"
    },
    {
      combo: "Diabetes medications + Supplements",
      description: "Discover how vitamins and supplements might affect your diabetes treatment"
    }
  ]

  /**
   * Fetch user's saved medications on component mount
   */
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch("/api/medications")
        if (!response.ok) throw new Error("Failed to fetch medications")
        const data = await response.json()
        setMedications(data)
      } catch (error) {
        console.error("Error fetching medications:", error)
        toast({
          title: "Error",
          description: "Failed to load medications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMedications()
  }, [toast])

  const handleAddMedication = () => {
    if (currentSelection && !selectedMedications.includes(currentSelection)) {
      setSelectedMedications([...selectedMedications, currentSelection])
      setCurrentSelection("")
    }
  }

  const handleRemoveMedication = (medicationId: string) => {
    setSelectedMedications(selectedMedications.filter((id) => id !== medicationId))
  }

  const handleCheckInteractions = async () => {
    if (selectedMedications.length < 2) {
      toast({
        title: "Not enough medications",
        description: "Please select at least two medications to check for interactions",
        variant: "destructive",
      })
      return
    }

    setChecking(true)

    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicationIds: selectedMedications,
        }),
      })

      if (!response.ok) throw new Error("Failed to check interactions")

      const data = await response.json()
      setInteractions(data)

      if (data.length === 0) {
        toast({
          title: "No interactions found",
          description: "No known interactions were found between the selected medications",
        })
      }
    } catch (error) {
      console.error("Error checking interactions:", error)
      toast({
        title: "Error",
        description: "Failed to check interactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setChecking(false)
    }
  }

  /**
   * Get medication name by ID
   * @param {string} id - Medication ID to look up
   * @returns {string} The medication name or "Unknown Medication" if not found
   */
  const getMedicationName = (id: string) => {
    const medication = medications.find((med) => med.id === id)
    return medication ? medication.name : "Unknown Medication"
  }

  /**
   * Get appropriate badge variant based on interaction severity
   * @param {string} severity - Severity level (high/severe, medium/moderate, low/minor)
   * @returns {string} The badge variant name for styling
   */
  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
      case "severe":
        return "destructive"
      case "medium":
      case "moderate":
        return "default"
      case "low":
      case "minor":
        return "secondary"
      default:
        return "outline"
    }
  }

  /**
   * Get severity color for UI elements
   */
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
      case "severe":
        return "bg-red-500"
      case "medium":
      case "moderate":
        return "bg-amber-500"
      case "low":
      case "minor":
        return "bg-green-600"
      default:
        return "bg-gray-400"
    }
  }

  /**
   * Handle text-based interaction check submission
   * Sends text to API for analysis and updates UI with results
   */
  const handleCheckTextInteractions = async () => {
    if (!medicationText.trim() || medicationText.length < 3) {
      toast({
        title: "Invalid input",
        description: "Please enter at least 3 characters to describe your medications",
        variant: "destructive",
      })
      return
    }

    setCheckingText(true)

    try {
      const response = await fetch("/api/interactions/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicationText,
        }),
      })

      if (!response.ok) throw new Error("Failed to check interactions")

      const data = await response.json()
      setTextInteractions(data)

      if (data.length === 0) {
        toast({
          title: "No interactions found",
          description: "No known interactions were found between the medications you entered",
        })
      }
    } catch (error) {
      console.error("Error checking text interactions:", error)
      toast({
        title: "Error",
        description: "Failed to check interactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckingText(false)
    }
  }

  /**
   * Return example text for the text input
   */
  const generatePlaceholderText = () => {
    const examples = [
      "I take lisinopril 10mg, atorvastatin 20mg daily, and occasionally use ibuprofen for pain.",
      "My medications include metformin twice daily, a blood pressure pill, and over-the-counter allergy medicine.",
      "I'm on sertraline 50mg each morning, vitamin D supplements, and sometimes take melatonin for sleep.",
      "Daily regimen: aspirin, simvastatin at night, and metoprolol twice a day.",
    ]
    return examples[Math.floor(Math.random() * examples.length)]
  }

  /**
   * Render the list of interactions or a message if none are found
   * @param {Interaction[]} interactionList - List of interactions to render
   * @returns {JSX.Element} Rendered interaction cards or message
   */
  const renderInteractions = (interactionList: Interaction[]) => {
    if (interactionList.length === 0) {
      return (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed flex flex-col items-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No interactions found. Please check medications for potential interactions.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {interactionList.map((interaction, index) => {
          const severityColor = getSeverityColor(interaction.severity);
          return (
            <div 
              key={index} 
              className="rounded-lg border shadow-sm hover:shadow-md transition-all p-1 overflow-hidden"
            >
              <div className={`h-1.5 w-full ${severityColor} rounded-t-md mb-2`}></div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center">
                    <div className="flex items-center gap-1 text-lg">
                      {interaction.medications.map((med, i) => (
                        <span key={i} className="flex items-center">
                          {i > 0 && <span className="text-muted-foreground mx-2">+</span>}
                          <span>{med.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <Badge 
                    variant={getSeverityVariant(interaction.severity)}
                    className="ml-2 uppercase font-semibold text-xs"
                  >
                    {interaction.severity} risk
                  </Badge>
                </div>
                
                <div className="mt-3 space-y-3">
                  <p className="text-sm">{interaction.description}</p>
                  
                  {interaction.recommendation && (
                    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">RECOMMENDATION</p>
                        <p className="text-sm">{interaction.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setSelectedInteraction(interaction)}
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span>Learn more</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      {selectedInteraction && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <div className={`h-3 w-3 ${getSeverityColor(selectedInteraction.severity)} rounded-full`}></div>
                              Interaction Details
                            </DialogTitle>
                            <DialogDescription>
                              {selectedInteraction.medications.map((med) => med.name).join(" and ")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">SEVERITY</h4>
                              <Badge variant={getSeverityVariant(selectedInteraction.severity)} className="uppercase">
                                {selectedInteraction.severity}
                              </Badge>
                              <p className="text-sm mt-1">
                                {selectedInteraction.severity === "high" && "This interaction has significant clinical importance. The risks generally outweigh the benefits."}
                                {selectedInteraction.severity === "medium" && "This interaction has moderate clinical significance. Take caution when combining these medications."}
                                {selectedInteraction.severity === "low" && "This interaction has minimal clinical significance but is worth noting."}
                              </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">DESCRIPTION</h4>
                              <p className="text-sm">{selectedInteraction.description}</p>
                            </div>

                            {selectedInteraction.recommendation && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm text-muted-foreground">RECOMMENDATION</h4>
                                  <div className="p-3 bg-muted/30 rounded-md">
                                    <p className="text-sm flex gap-2">
                                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                                      <span>{selectedInteraction.recommendation}</span>
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="rounded-md bg-muted p-3 text-sm">
                              <p className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                This information is for educational purposes only. Always consult with your
                                healthcare provider about drug interactions.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className="w-full">
                              <Pill className="mr-2 h-4 w-4" />
                              Learn About These Medications
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 card-header">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Drug Interactions</h1>
            <p className="text-muted-foreground">
              Check for potential interactions between medications, supplements, and food
            </p>
          </div>
        </div>
      </div>

      <Card className="card overflow-hidden border-none shadow-lg">
        <div className="absolute right-4 top-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Info className="h-4 w-4" />
                <span>Learn About Interactions</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Drug Interactions</DialogTitle>
                <DialogDescription>What drug interactions are and why they matter</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm">
                  Drug interactions occur when a drug's effects are changed by food, another drug, or a medical condition. These can:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Decrease effectiveness</h3>
                      <p className="text-sm text-muted-foreground">
                        Some interactions can reduce how well your medications work
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Increase side effects</h3>
                      <p className="text-sm text-muted-foreground">
                        Interactions can amplify side effects or create new ones
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Change how drugs are processed</h3>
                      <p className="text-sm text-muted-foreground">
                        The way your body absorbs, distributes or eliminates medications can be altered
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-medium">Severity Levels</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive">High</Badge>
                      <p className="text-sm">
                        Potentially life-threatening or serious interactions that should be avoided. Alternative
                        medications should be considered.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <Badge className="bg-amber-500">Medium</Badge>
                      <p className="text-sm">
                        Significant interactions that may require close monitoring, dosage adjustments, or timing
                        changes.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">Low</Badge>
                      <p className="text-sm">
                        Minor interactions with limited clinical significance, but should still be noted.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    Always consult with your healthcare provider or pharmacist about potential drug
                    interactions.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-2xl font-bold">Medication Interaction Checker</h2>
              <p className="text-muted-foreground">
                Enter your medications below to check for potential interactions
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-background rounded-2xl shadow-sm p-6 border">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <FileText className="h-4 w-4" />
                    <span>Enter your medications and supplements</span>
                  </div>
                  
                  <Textarea
                    placeholder={generatePlaceholderText()}
                    className="min-h-[120px] text-base focus-visible:ring-primary"
                    value={medicationText}
                    onChange={(e) => setMedicationText(e.target.value)}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Button 
                      onClick={handleCheckTextInteractions} 
                      disabled={!medicationText.trim() || checkingText}
                      className="w-full sm:w-auto sm:flex-1 bg-primary hover:bg-primary/90 text-base h-12"
                    >
                      {checkingText ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          Check Interactions
                        </>
                      )}
                    </Button>
                    <Link href="/dashboard/medications">
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Pill className="mr-2 h-4 w-4" />
                        Manage Medications
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Common combinations to check</span>
                  </h3>
                  <div className="space-y-2">
                    {commonCombinations.map((item, index) => (
                      <div 
                        key={index}
                        className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => {
                          setMedicationText(item.combo);
                        }}
                      >
                        <div className="font-medium">{item.combo}</div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    <span>Medication examples</span>
                  </h3>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Be specific when listing your medications. Include dosages and frequency when possible:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exampleMedications.map((med, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/5">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl shadow-sm p-6 border mt-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Potential Interactions</span>
                    </h3>
                  </div>
                  
                  <div className="list-container">
                    {checkingText ? (
                      <div className="text-center py-12 border rounded-lg">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <div className="mt-6 space-y-2">
                          <p className="text-muted-foreground">Analyzing your medications for interactions</p>
                          <p className="text-xs text-muted-foreground">This may take a few moments</p>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px] pr-4">
                        {renderInteractions(textInteractions)}
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/20 border-t">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Data source: Ayurveda Medication Database
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

