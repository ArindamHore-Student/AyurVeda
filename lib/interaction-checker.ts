import { getGeminiModel } from "./api-config"

export interface Medication {
  id: string
  name: string
  dosage: string
}

export interface Interaction {
  id: string
  medications: { id: string; name: string }[]
  severity: string
  description: string
  recommendation?: string
}

export async function checkInteractions(medications: Medication[]): Promise<Interaction[]> {
  if (medications.length < 2) {
    return []
  }

  const model = getGeminiModel()

  const medicationNames = medications.map((med) => `${med.name} (${med.dosage})`).join(", ")

  const prompt = `
  I need to check for potential drug interactions between the following medications:
  ${medicationNames}
  
  Please provide a detailed analysis of any potential interactions in the following JSON format:
  [
    {
      "medications": [{"name": "MedicationA"}, {"name": "MedicationB"}],
      "severity": "HIGH|MEDIUM|LOW",
      "description": "Detailed description of the interaction",
      "recommendation": "Recommendation for managing this interaction"
    }
  ]
  
  If there are no known interactions, return an empty array.
  Only return the JSON array, nothing else.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return []
    }

    const jsonStr = jsonMatch[0]
    const interactions = JSON.parse(jsonStr) as Omit<Interaction, "id">[]

    // Add IDs to the interactions
    return interactions.map((interaction, index) => ({
      ...interaction,
      id: `generated-${index}`,
      medications: interaction.medications.map((med, medIndex) => ({
        ...med,
        id: medications.find((m) => m.name === med.name)?.id || `unknown-${medIndex}`,
      })),
    }))
  } catch (error) {
    console.error("Error checking interactions:", error)
    return []
  }
}

export async function checkTextInteractions(medicationText: string): Promise<Interaction[]> {
  if (!medicationText.trim()) {
    return [];
  }

  const model = getGeminiModel();

  const prompt = `
  I need to check for potential drug interactions between medications listed in the following text:
  "${medicationText}"
  
  First, identify all distinct medications mentioned. If brand names are provided, convert to generic names.
  Then analyze all possible interactions between these medications.

  Please provide a detailed analysis of any potential interactions in the following JSON format:
  [
    {
      "medications": [{"name": "MedicationA"}, {"name": "MedicationB"}],
      "severity": "HIGH|MEDIUM|LOW",
      "description": "Detailed description of the interaction and mechanism",
      "recommendation": "Clinical recommendation for managing this interaction"
    }
  ]
  
  Follow these guidelines:
  1. Always classify severity as exactly "HIGH", "MEDIUM", or "LOW" (uppercase)
  2. For HIGH severity interactions, include urgent precautions in the recommendation
  3. For all interactions, explain the mechanism and clinical consequences
  4. If there are no known interactions, return an empty array
  5. Only return the JSON array, nothing else
  `

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const jsonStr = jsonMatch[0];
    const interactions = JSON.parse(jsonStr) as Omit<Interaction, "id">[];

    // Add IDs to the interactions
    return interactions.map((interaction, index) => ({
      ...interaction,
      id: `text-generated-${index}`,
      medications: interaction.medications.map((med, medIndex) => ({
        ...med,
        id: `text-${medIndex}`,
      })),
    }));
  } catch (error) {
    console.error("Error checking text interactions:", error);
    return [];
  }
}

