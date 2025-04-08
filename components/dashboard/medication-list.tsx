import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"

// Mock data for medications
const medications = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    purpose: "Blood pressure",
    refillDate: "2025-05-15",
  },
  {
    id: 2,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    purpose: "Cholesterol",
    refillDate: "2025-05-20",
  },
  {
    id: 3,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily with meals",
    purpose: "Diabetes",
    refillDate: "2025-04-30",
  },
  {
    id: 4,
    name: "Levothyroxine",
    dosage: "75mcg",
    frequency: "Once daily on empty stomach",
    purpose: "Thyroid",
    refillDate: "2025-06-10",
  },
  {
    id: 5,
    name: "Sertraline",
    dosage: "50mg",
    frequency: "Once daily in the morning",
    purpose: "Depression/Anxiety",
    refillDate: "2025-05-05",
  },
]

export function MedicationList() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium">
          <div className="col-span-2">Medication</div>
          <div>Dosage</div>
          <div>Frequency</div>
          <div>Next Refill</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y">
          {medications.map((medication) => (
            <div key={medication.id} className="grid grid-cols-6 gap-4 p-4 text-sm">
              <div className="col-span-2">
                <div className="font-medium">{medication.name}</div>
                <div className="text-xs text-muted-foreground">{medication.purpose}</div>
              </div>
              <div className="flex items-center">{medication.dosage}</div>
              <div className="flex items-center">{medication.frequency}</div>
              <div className="flex items-center">
                {new Date(medication.refillDate) < new Date() ? (
                  <Badge variant="destructive">Overdue</Badge>
                ) : (
                  medication.refillDate
                )}
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

