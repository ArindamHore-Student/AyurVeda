"use client"

/**
 * Medication Calculator Module
 * 
 * This component provides three primary calculation tools for healthcare professionals:
 * 1. Medication Dosage Calculator - Calculate appropriate dosing for various medications
 * 2. Unit Converter - Convert between different medical units of measurement
 * 3. IV Infusion Calculator - Calculate drip rates, concentrations and durations
 * 
 * The component supports both adult and pediatric patients, with specialized
 * calculation rules for each medication type and patient category.
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Calculator, Pill, HeartPulse, UserCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Import the medication catalog interfaces
import { AgeRange, MedicationCatalogWithAgeRanges } from "@/lib/medication-catalog"

/**
 * DosageCalculatorPage Component
 * 
 * Main component that renders the medication calculator interface with three tabs:
 * 1. Dosage Calculator - For medication dosage calculations
 * 2. Unit Converter - For converting between different units
 * 3. IV Infusion - For calculating IV infusion rates
 * 
 * The component maintains state for:
 * - Currently active calculator tab
 * - Patient type (adult/pediatric)
 * - Selected medication
 */
export default function DosageCalculatorPage() {
  const { toast } = useToast()
  const [calculatorTab, setCalculatorTab] = useState("dosage")
  const [patientType, setPatientType] = useState<"adult" | "pediatric">("adult")
  const [selectedMedication, setSelectedMedication] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [age, setAge] = useState<string>("")
  const [renal, setRenal] = useState<string>("normal")
  const [showResults, setShowResults] = useState<boolean>(false)
  const [medications, setMedications] = useState<MedicationCatalogWithAgeRanges[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  // Fetch medications from the database
  useEffect(() => {
    async function fetchMedications() {
      try {
        const response = await fetch('/api/medications');
        if (!response.ok) {
          throw new Error('Failed to fetch medications');
        }
        const data = await response.json();
        setMedications(data);
      } catch (error) {
        console.error('Error fetching medications:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load medication data"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMedications();
  }, [toast]);
  
  /**
   * Helper functions for rendering dosage information
   */
  const renderStandardDosage = () => {
    const med = medications.find(m => m.id === selectedMedication);
    if (!med) return "Medication not found";
    
    // Basic dosage calculation based on medication and patient type
    if (patientType === "adult") {
      return med.standardDosage;
    } else {
      return med.pediatricDose || "Please refer to pediatric guidelines for this medication";
    }
  }

  const renderWeightBasedDosing = () => {
    const med = medications.find(m => m.id === selectedMedication);
    if (!med || !weight) return "Please enter a valid weight";
    
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum)) return "Invalid weight value";
    
    // Find age-specific dosing if available
    if (patientType === "pediatric" && med.ageRanges && age) {
      const ageNum = parseFloat(age);
      if (!isNaN(ageNum)) {
        const ageRange = med.ageRanges.find(range => ageNum >= range.min && ageNum <= range.max);
        if (ageRange) {
          return `Age-specific dosing (${ageNum} years): ${ageRange.dose}`;
        }
      }
    }
    
    // Weight-based calculation
    if (med.weightBasedDose) {
      return `Based on ${weightNum} kg: ${med.weightBasedDose}`;
    } else {
      return "Weight-based dosing not available for this medication";
    }
  }
  
  /**
   * Render the medication calculator interface with tabs for different calculation tools
   */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medication Calculator</h1>
          <p className="text-muted-foreground">Calculate medication dosages, unit conversions and IV drip rates</p>
        </div>
      </div>

      <Tabs value={calculatorTab} onValueChange={(value) => setCalculatorTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="dosage" className="flex items-center gap-2">
            <Pill className="h-4 w-4" /> Dosage Calculator
          </TabsTrigger>
          <TabsTrigger value="conversion" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Unit Converter
          </TabsTrigger>
          <TabsTrigger value="infusion" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" /> IV Infusion
          </TabsTrigger>
        </TabsList>

        {/* Dosage Calculator Tab Content */}
        <TabsContent value="dosage">
          <Card>
            <CardHeader>
              <CardTitle>Medication Dosage Calculator</CardTitle>
              <CardDescription>
                Calculate appropriate dosages based on medication, patient type, weight, and other factors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-center">
                    <p>Loading medication data...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="patient-type" 
                        checked={patientType === "pediatric"}
                        onCheckedChange={(checked) => setPatientType(checked ? "pediatric" : "adult")}
                      />
                      <Label htmlFor="patient-type" className="font-medium">
                        {patientType === "adult" ? "Adult Patient" : "Pediatric Patient"}
                      </Label>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <UserCircle className="h-3.5 w-3.5 mr-1" />
                      {patientType === "adult" ? "Adult Dosing" : "Pediatric Dosing"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="medication">Medication</Label>
                      <Select onValueChange={(value) => setSelectedMedication(value)}>
                        <SelectTrigger id="medication">
                          <SelectValue placeholder="Select a medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Patient Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Enter weight in kg"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                  </div>

                  {patientType === "pediatric" && (
                    <div className="space-y-2">
                      <Label htmlFor="age">Patient Age (years)</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter age in years"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  )}

                  {patientType === "adult" && (
                    <div className="space-y-2">
                      <Label htmlFor="renal">Renal Function</Label>
                      <Select defaultValue="normal" onValueChange={(value) => setRenal(value)}>
                        <SelectTrigger id="renal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (CrCl &gt; 60 mL/min)</SelectItem>
                          <SelectItem value="mild">Mild Impairment (CrCl 30-60 mL/min)</SelectItem>
                          <SelectItem value="moderate">Moderate Impairment (CrCl 15-30 mL/min)</SelectItem>
                          <SelectItem value="severe">Severe Impairment (CrCl &lt; 15 mL/min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        if (!selectedMedication || !weight) {
                          toast({
                            variant: "destructive",
                            title: "Missing information",
                            description: "Please select a medication and enter patient weight"
                          });
                          return;
                        }
                        setShowResults(true);
                        toast({
                          title: "Dosage calculated",
                          description: "Dosage information has been calculated based on your inputs"
                        });
                      }}
                      className="w-full"
                    >
                      Calculate Dosage
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Unit Converter Tab Content */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Medical Unit Converter</CardTitle>
              <CardDescription>
                Convert between different units of measurement including weight, volume, and concentration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  The unit converter functionality is being updated with more conversion types and improved accuracy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* IV Infusion Calculator Tab Content */}
        <TabsContent value="infusion">
          <Card>
            <CardHeader>
              <CardTitle>IV Infusion Calculator</CardTitle>
              <CardDescription>
                Calculate IV drip rates, infusion times, and total volumes for various medications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  The IV infusion calculator functionality is being updated with more medication options and improved calculations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showResults && selectedMedication && (
        <Card className="mt-6 border-primary/20">
          <CardHeader className="pb-2 bg-primary/5">
            <CardTitle className="text-lg flex items-center">
              <Pill className="h-5 w-5 mr-2 text-primary" />
              {medications.find(med => med.id === selectedMedication)?.name} Dosage Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Standard Dosage:</h4>
                <p className="text-muted-foreground">
                  {renderStandardDosage()}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Weight-Based Dosing:</h4>
                <p className="text-muted-foreground">
                  {renderWeightBasedDosing()}
                </p>
              </div>
              
              {patientType === "adult" && renal !== "normal" && (
                <div>
                  <h4 className="font-medium">Renal Adjustment:</h4>
                  <p className="text-muted-foreground">
                    {renal === "mild" 
                      ? "For mild renal impairment: Consider reducing dose by 25% or extending dosing interval."
                      : renal === "moderate"
                      ? "For moderate renal impairment: Consider reducing dose by 50% or extending dosing interval."
                      : "For severe renal impairment: Consider alternative medication or consult with nephrologist."}
                  </p>
                </div>
              )}
              
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription className="text-xs">
                  This calculator provides general dosing guidelines. Always verify dosages using 
                  approved resources and adjust based on clinical judgment and patient-specific factors.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

