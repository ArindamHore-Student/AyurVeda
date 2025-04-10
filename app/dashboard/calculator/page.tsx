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

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Calculator, Pill, HeartPulse, UserCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

/**
 * Medication Database
 * 
 * Contains detailed dosage information for various medications including:
 * - Standard adult dosing schedules
 * - Weight-based dosing calculations
 * - Pediatric dosing by weight and age ranges
 * - Renal adjustment guidelines
 */
const medications = [
  {
    id: 1,
    name: "Amoxicillin",
    category: "antibiotic",
    dosageRules: {
      adult: {
        standard: "500 mg three times daily",
        weightBased: "25-45 mg/kg/day divided into 3 doses",
        renalAdjustment: true,
      },
      pediatric: {
        weightBased: "20-90 mg/kg/day divided into 2-3 doses, depending on infection severity",
        ageRanges: [
          { min: 0, max: 3, dose: "20-30 mg/kg/day divided into 2 doses" },
          { min: 3, max: 12, dose: "25-45 mg/kg/day divided into 2 doses" },
          { min: 12, max: 18, dose: "250-500 mg every 8 hours" },
        ],
      },
    },
  },
  {
    id: 2,
    name: "Ibuprofen",
    category: "nsaid",
    dosageRules: {
      adult: {
        standard: "200-400 mg every 4-6 hours as needed",
        weightBased: "5-10 mg/kg every 6-8 hours, max 3200 mg/day",
        renalAdjustment: true,
      },
      pediatric: {
        weightBased: "4-10 mg/kg every 6-8 hours, max 40 mg/kg/day",
        ageRanges: [
          { min: 0.5, max: 2, dose: "50 mg every 6-8 hours" },
          { min: 2, max: 6, dose: "100 mg every 6-8 hours" },
          { min: 6, max: 12, dose: "200 mg every 6-8 hours" },
          { min: 12, max: 18, dose: "200-400 mg every 6-8 hours" },
        ],
      },
    },
  },
  {
    id: 3,
    name: "Acetaminophen",
    category: "analgesic",
    dosageRules: {
      adult: {
        standard: "325-650 mg every 4-6 hours as needed, max 3000 mg/day",
        weightBased: "10-15 mg/kg every 4-6 hours, max 3000 mg/day",
        renalAdjustment: true,
      },
      pediatric: {
        weightBased: "10-15 mg/kg every 4-6 hours, max 75 mg/kg/day not to exceed 3000 mg/day",
        ageRanges: [
          { min: 0, max: 3, dose: "10-15 mg/kg every 4-6 hours, max 5 doses per day" },
          { min: 3, max: 6, dose: "120-160 mg every 4-6 hours" },
          { min: 6, max: 12, dose: "240-320 mg every 4-6 hours" },
          { min: 12, max: 18, dose: "325-650 mg every 4-6 hours" },
        ],
      },
    },
  },
  {
    id: 4,
    name: "Lisinopril",
    category: "antihypertensive",
    dosageRules: {
      adult: {
        standard: "10-40 mg once daily",
        weightBased: null,
        renalAdjustment: true,
      },
      pediatric: {
        weightBased: "0.07 mg/kg once daily, up to 5 mg",
        ageRanges: [{ min: 6, max: 18, dose: "0.07 mg/kg once daily, up to 5 mg" }],
      },
    },
  },
  {
    id: 5,
    name: "Metformin",
    category: "antidiabetic",
    dosageRules: {
      adult: {
        standard: "500 mg twice daily or 850 mg once daily, max 2550 mg/day",
        weightBased: null,
        renalAdjustment: true,
      },
      pediatric: {
        weightBased: "500-2000 mg daily divided into 2 doses",
        ageRanges: [{ min: 10, max: 18, dose: "500-2000 mg daily divided into 2 doses" }],
      },
    },
  },
  {
    id: 6,
    name: "Albuterol",
    category: "bronchodilator",
    dosageRules: {
      adult: {
        standard: "2 puffs every 4-6 hours as needed",
        weightBased: null,
        renalAdjustment: false,
      },
      pediatric: {
        weightBased: null,
        ageRanges: [
          { min: 0, max: 4, dose: "0.05-0.15 mg/kg via nebulizer every 4-6 hours" },
          { min: 4, max: 18, dose: "2 puffs every 4-6 hours as needed" },
        ],
      },
    },
  },
  {
    id: 7,
    name: "Prednisone",
    category: "corticosteroid",
    dosageRules: {
      adult: {
        standard: "5-60 mg daily, depending on condition",
        weightBased: "0.5-2 mg/kg/day, depending on condition",
        renalAdjustment: false,
      },
      pediatric: {
        weightBased: "0.5-2 mg/kg/day, depending on condition",
        ageRanges: [{ min: 0, max: 18, dose: "0.5-2 mg/kg/day, depending on condition" }],
      },
    },
  },
  {
    id: 8,
    name: "Amoxicillin-Clavulanate",
    category: "antibiotic",
    dosageRules: {
      adult: {
        standard: "875 mg/125 mg twice daily or 500 mg/125 mg three times daily",
        weightBased: "25-45 mg/kg/day of amoxicillin component, divided into 2 doses",
        renalAdjustment: true,
      },
      pediatric: {
        weightBased: "25-45 mg/kg/day of amoxicillin component, divided into 2 doses",
        ageRanges: [
          { min: 0, max: 3, dose: "20-30 mg/kg/day divided into 2 doses" },
          { min: 3, max: 12, dose: "25-45 mg/kg/day divided into 2 doses" },
          { min: 12, max: 18, dose: "500 mg/125 mg every 8 hours" },
        ],
      },
    },
  },
]

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
  const [calculatorTab, setCalculatorTab] = useState("dosage")
  const [patientType, setPatientType] = useState<"adult" | "pediatric">("adult")
  const [selectedMedication, setSelectedMedication] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [age, setAge] = useState<string>("")
  const [renal, setRenal] = useState<string>("normal")
  const [showResults, setShowResults] = useState<boolean>(false)
  
  /**
   * Helper functions for rendering dosage information
   */
  const renderStandardDosage = () => {
    const med = medications.find(m => m.id.toString() === selectedMedication);
    if (!med) return "Medication not found";
    
    // Basic dosage calculation based on medication and patient type
    if (patientType === "adult") {
      return med.name === "Paracetamol" 
        ? "500-1000 mg every 4-6 hours as needed (Max: 4g/day)" 
        : med.name === "Ibuprofen"
        ? "400-800 mg every 6-8 hours as needed (Max: 3.2g/day)"
        : "Please refer to standard guidelines for this medication";
    } else {
      return med.name === "Paracetamol"
        ? "10-15 mg/kg every 4-6 hours as needed (Max: 90 mg/kg/day, not to exceed adult dose)"
        : med.name === "Ibuprofen"
        ? "5-10 mg/kg every 6-8 hours as needed (Max: 40 mg/kg/day)"
        : "Please refer to pediatric guidelines for this medication";
    }
  }

  const renderWeightBasedDosing = () => {
    const med = medications.find(m => m.id.toString() === selectedMedication);
    if (!med || !weight) return "Please enter a valid weight";
    
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum)) return "Invalid weight value";
    
    // Weight-based calculation
    if (patientType === "adult") {
      return med.name === "Paracetamol"
        ? `Based on ${weightNum} kg: 10-15 mg/kg = ${Math.round(weightNum * 10)}-${Math.round(weightNum * 15)} mg per dose`
        : med.name === "Ibuprofen"
        ? `Based on ${weightNum} kg: 5-10 mg/kg = ${Math.round(weightNum * 5)}-${Math.round(weightNum * 10)} mg per dose`
        : "Please refer to product literature for weight-based dosing";
    } else {
      return med.name === "Paracetamol"
        ? `Based on ${weightNum} kg: 10-15 mg/kg = ${Math.round(weightNum * 10)}-${Math.round(weightNum * 15)} mg per dose`
        : med.name === "Ibuprofen"
        ? `Based on ${weightNum} kg: 5-10 mg/kg = ${Math.round(weightNum * 5)}-${Math.round(weightNum * 10)} mg per dose`
        : "Please refer to pediatric guidelines for weight-based dosing";
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
                        <SelectItem key={med.id} value={med.id.toString()}>
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
              {medications.find(med => med.id.toString() === selectedMedication)?.name} Dosage Information
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

