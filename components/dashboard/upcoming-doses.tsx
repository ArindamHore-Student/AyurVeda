import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

// Mock data for upcoming doses
const upcomingDoses = [
  {
    id: 1,
    medication: "Lisinopril",
    dosage: "10mg",
    time: "8:00 AM",
    taken: true,
  },
  {
    id: 2,
    medication: "Metformin",
    dosage: "500mg",
    time: "9:00 AM",
    taken: true,
  },
  {
    id: 3,
    medication: "Metformin",
    dosage: "500mg",
    time: "6:00 PM",
    taken: false,
  },
  {
    id: 4,
    medication: "Atorvastatin",
    dosage: "20mg",
    time: "9:00 PM",
    taken: false,
  },
]

export function UpcomingDoses() {
  return (
    <div className="space-y-4">
      {upcomingDoses.map((dose) => (
        <div key={dose.id} className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="font-medium">
              {dose.medication} ({dose.dosage})
            </div>
            <div className="text-sm text-muted-foreground">{dose.time}</div>
          </div>
          <Button
            variant={dose.taken ? "outline" : "default"}
            size="sm"
            className={dose.taken ? "cursor-default" : ""}
            disabled={dose.taken}
          >
            {dose.taken ? (
              <>
                <Check className="mr-1 h-4 w-4" /> Taken
              </>
            ) : (
              "Mark as Taken"
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}

