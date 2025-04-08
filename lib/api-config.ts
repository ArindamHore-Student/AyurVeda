import { GoogleGenerativeAI } from "@google/generative-ai"

// Get API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// System prompt for pharmacy assistant
export const PHARMACY_SYSTEM_PROMPT = `You are a knowledgeable pharmacy assistant with expertise in medications, drug interactions, and general health information.

Your role is to provide accurate, evidence-based information to help users understand their medications better. You can answer questions about:
- Common and rare side effects of medications
- Drug interactions and their severity
- Proper usage and administration of medications
- General pharmaceutical knowledge
- Over-the-counter medication information

When discussing medication interactions, always classify severity as either "High", "Moderate", or "Low" risk.
Format your responses clearly using proper structure, and include references to medical literature when appropriate.
Always include disclaimers about consulting healthcare professionals when necessary.

Remember that you should not:
- Diagnose medical conditions
- Provide personal medical advice
- Recommend prescription medications without a prescription
- Claim to replace professional medical consultation`

// List of models to try in order of preference
const MODEL_OPTIONS = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-1.0-pro"
];

export const getGeminiModel = (modelIndex = 0): ReturnType<typeof genAI.getGenerativeModel> => {
  if (!process.env.GEMINI_API_KEY || 
      process.env.GEMINI_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
    throw new Error("Gemini API key not configured. Please add your API key to .env.local file.");
  }
  
  if (modelIndex >= MODEL_OPTIONS.length) {
    throw new Error("All model options exhausted. No available Gemini models found.");
  }
  
  try {
    return genAI.getGenerativeModel({ 
      model: MODEL_OPTIONS[modelIndex]
      // API version is set automatically in the latest SDK
    });
  } catch (error) {
    console.error(`Error initializing model ${MODEL_OPTIONS[modelIndex]}:`, error);
    // Try next model in the list
    return getGeminiModel(modelIndex + 1);
  }
}

/**
 * Determines the appropriate specialized prompt based on query content
 * @param query - The user's medication question
 * @param systemPrompt - Base system prompt
 */
export const createSpecializedPrompt = (query: string, systemPrompt: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Interaction query detection
  if (lowerQuery.includes('interact') || 
      lowerQuery.includes('with') || 
      lowerQuery.includes('between') || 
      lowerQuery.includes('together')) {
      
    return `${systemPrompt}

When responding to interaction queries, follow this specific structure:

# Interaction between [Medication 1] and [Medication 2]

## Mechanism
[Explain the pharmacological mechanism of interaction]

## Severity
**[Severity Level]** - [Brief explanation of severity]

## Clinical Consequences
[List specific clinical consequences as bullet points]

## Management
[List specific recommendations as bullet points]

## References
[List credible references]`;
  } 
  
  // Dosage query detection
  else if (lowerQuery.includes('dose') || 
           lowerQuery.includes('dosage') || 
           lowerQuery.includes('take') || 
           lowerQuery.includes('administer')) {
           
    return `${systemPrompt}
    
When responding to dosage queries, follow this structure:
1. Standard dosing information for indicated conditions
2. Adjustments needed for special populations (renal/hepatic impairment, elderly, pediatric)
3. Administration considerations (timing, food interactions)
4. Important monitoring parameters
5. Include references to current guidelines`;
  } 
  
  // Side effect query detection
  else if (lowerQuery.includes('side effect') || 
           lowerQuery.includes('adverse') || 
           lowerQuery.includes('reaction') || 
           lowerQuery.includes('risk')) {
           
    return `${systemPrompt}
    
When responding to side effect queries, follow this structure:
1. Common side effects (>1% incidence)
2. Serious/rare adverse effects requiring monitoring
3. Risk factors that increase likelihood
4. Monitoring recommendations
5. Management strategies
6. Include references to drug information sources`;
  }
  
  // Default - return the original system prompt
  return systemPrompt;
}

