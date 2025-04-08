import { getGeminiModel } from "./api-config"

export interface MedicationInfo {
  name: string
  description: string
  usedFor: string[]
  sideEffects: string[]
  warnings: string[]
  interactions: string[]
  dosageInfo: string
}

export async function getMedicationInfo(medicationName: string): Promise<MedicationInfo | null> {
  const model = getGeminiModel()

  const prompt = `
  Please provide detailed information about the medication "${medicationName}" in the following JSON format:
  {
    "name": "Full medication name",
    "description": "Brief description of the medication",
    "usedFor": ["Condition 1", "Condition 2"],
    "sideEffects": ["Side effect 1", "Side effect 2"],
    "warnings": ["Warning 1", "Warning 2"],
    "interactions": ["Interaction 1", "Interaction 2"],
    "dosageInfo": "General dosage information"
  }
  
  Only return the JSON object, nothing else.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return null
    }

    const jsonStr = jsonMatch[0]
    return JSON.parse(jsonStr) as MedicationInfo
  } catch (error) {
    console.error("Error getting medication info:", error)
    return null
  }
}

