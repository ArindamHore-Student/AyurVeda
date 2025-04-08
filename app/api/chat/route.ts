import { getGeminiModel, PHARMACY_SYSTEM_PROMPT, createSpecializedPrompt } from "@/lib/api-config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const session = await getServerSession()

    // Add user context if authenticated
    let enhancedSystemPrompt = PHARMACY_SYSTEM_PROMPT

    if (session?.user?.email) {
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Get user's medications
        const medications = await prisma.medication.findMany({
          where: {
            userId: user.id,
          },
          select: {
            name: true,
            dosage: true,
            frequency: true,
            purpose: true,
          },
        })

        if (medications.length > 0) {
          const medicationList = medications
            .map((med: any) => `- ${med.name} (${med.dosage}, ${med.frequency})${med.purpose ? ` for ${med.purpose}` : ""}`)
            .join("\n")

          enhancedSystemPrompt += `\n\nThe user is currently taking the following medications:\n${medicationList}\n\nYou may reference this information when relevant, but do not share this list unless specifically asked.`
        }
      } catch (error) {
        console.error("Error fetching user medications:", error)
        // Continue without medication context if there's an error
      }
    }

    // Get user's last message
    const userLastMessage = messages[messages.length - 1].content.toString()
    
    // Create a specialized prompt based on the query type
    const specializedPrompt = createSpecializedPrompt(userLastMessage, enhancedSystemPrompt)

    // Get the Gemini model
    const model = getGeminiModel()

    // Send request to Gemini
    try {
      // Use the generateContentStream method directly
      const result = await model.generateContentStream({
        contents: [
          { role: "user", parts: [{ text: specializedPrompt }] },
          { role: "user", parts: [{ text: userLastMessage }] }
        ],
        generationConfig: {
          temperature: 0.4, // Lower temperature for more factual responses
          maxOutputTokens: 2000,
        }
      });

      // Create a simple text stream
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (error: any) {
            console.error("Error in stream processing:", error);
            controller.error(error);
          }
        }
      });

      // Return as streaming response
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch (err: any) {
      console.error("Gemini API error:", err)
      // Check if this is an API key error
      if (err.message && err.message.includes("API key not valid")) {
        return new Response(JSON.stringify({ 
          error: "Invalid API key. Please update your GEMINI_API_KEY in .env.local file."
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      
      // Check for model availability issues
      if (err.message && (
        err.message.includes("model not found") || 
        err.message.includes("not supported") ||
        err.message.includes("not available"))) {
        
        return new Response(JSON.stringify({ 
          error: "The selected model is not available. Please try again with a different model."
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      
      throw err;
    }
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
} 