import { Badge } from "@/components/ui/badge"

// Mock data for interactions
const interactions = [
  {
    id: 1,
    medications: ["Lisinopril", "Potassium supplements"],
    severity: "high",
    description: "May increase risk of hyperkalemia (high potassium levels)",
  },
  {
    id: 2,
    medications: ["Atorvastatin", "Grapefruit juice"],
    severity: "medium",
    description: "May increase statin concentration and risk of side effects",
  },
  {
    id: 3,
    medications: ["Sertraline", "Ibuprofen"],
    severity: "medium",
    description: "May increase risk of bleeding",
  },
]

export function RecentInteractions() {
  return (
    <div className="space-y-4">
      {interactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No interactions detected</p>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{interaction.medications.join(" + ")}</div>
                <Badge
                  variant={
                    interaction.severity === "high"
                      ? "destructive"
                      : interaction.severity === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {interaction.severity}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{interaction.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

