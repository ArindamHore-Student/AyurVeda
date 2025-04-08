"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  Pill, 
  AlertCircle, 
  Calculator, 
  Calendar, 
  Loader2, 
  Key, 
  MessageSquare,
  BookOpen,
  ListChecks,
  Lightbulb,
  UserRound,
  BotIcon,
  Search,
  BookMarked,
  Stethoscope,
  Sparkles,
  Brain,
  Shield
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AssistantPage Component
 * 
 * Provides an AI-powered assistant interface for medication information,
 * dosage calculations, interaction checking, and health advice.
 */
export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [apiKeyError, setApiKeyError] = useState(false)
  
  // Custom chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Common medication questions
  const commonMedicationQuestions = [
    "What are the side effects of metformin?",
    "How should I take lisinopril?",
    "Is it safe to take ibuprofen with my blood pressure medication?",
    "Can I drink alcohol while on atorvastatin?",
    "How long does it take for sertraline to work?",
    "What should I do if I miss a dose of my medication?",
    "Are there any dietary restrictions with my medications?",
    "How should I store my medications properly?"
  ]

  // Categories for medication information
  const medicationCategories = [
    { name: "Common Medications", icon: Pill, description: "Information about frequently prescribed medications" },
    { name: "Dosage Calculations", icon: Calculator, description: "Help with calculating proper medication doses" },
    { name: "Side Effects", icon: AlertCircle, description: "Understanding potential medication side effects" },
    { name: "Interactions", icon: Shield, description: "Check for drug-drug or drug-food interactions" },
    { name: "Adherence Tips", icon: ListChecks, description: "Advice for maintaining medication schedules" },
    { name: "Latest Research", icon: BookMarked, description: "Recent findings in pharmaceutical research" }
  ]

  // Featured medication information cards
  const featuredMedications = [
    {
      name: "Lisinopril",
      category: "Blood Pressure",
      description: "An ACE inhibitor used to treat high blood pressure and heart failure",
      dosage: "10-40 mg once daily",
      common_side_effects: ["Dry cough", "Dizziness", "Headache", "Low blood pressure"],
      precautions: "Monitor kidney function and potassium levels. Avoid potassium supplements."
    },
    {
      name: "Metformin",
      category: "Diabetes",
      description: "First-line medication for the treatment of type 2 diabetes",
      dosage: "500-2000 mg daily, divided into 2-3 doses",
      common_side_effects: ["Nausea", "Diarrhea", "Stomach upset", "Vitamin B12 deficiency"],
      precautions: "Take with meals to reduce GI side effects. Monitor kidney function."
    },
    {
      name: "Atorvastatin",
      category: "Cholesterol",
      description: "A statin medication used to prevent cardiovascular disease and treat abnormal lipid levels",
      dosage: "10-80 mg once daily, usually at night",
      common_side_effects: ["Muscle pain or weakness", "Elevated liver enzymes", "Headache"],
      precautions: "Avoid grapefruit juice. Report muscle pain or weakness to your doctor."
    }
  ]

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    
    try {
      // Call our API with the chat history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });
      
      if (!response.ok) {
        // Check for error responses
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response');
      }
      
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        // Handle API error responses
        const errorData = await response.json();
        if (errorData.error) {
          throw new Error(errorData.error);
        }
      }
      
      // Create a message to accumulate the streamed response
      const assistantMessage: Message = {
        role: 'assistant',
        content: ''
      };
      
      // Add empty message to state that will be updated
      setMessages(prev => [...prev, assistantMessage]);
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('Could not read response');
      
      let done = false;
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const text = decoder.decode(value);
          
          // Update the last message with the accumulated text
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content += text;
            return newMessages;
          });
        }
      }
    } catch (err: any) {
      console.error('Error in chat submission:', err);
      setError(err.message);
      
      // Check if this is an API key error
      if (err.message && err.message.includes('API key')) {
        setApiKeyError(true);
      }
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Helper function for suggestion clicks
  const handleSuggestionClick = (text: string) => {
    setInput(text);
    
    // Submit the form after a short delay
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
    }, 100);
  };

  // Quick action suggestions
  const suggestions = [
    { text: "What are common side effects of lisinopril?", icon: Pill },
    { text: "Can I take ibuprofen with my blood pressure medication?", icon: AlertCircle },
    { text: "How should I calculate pediatric dosage for amoxicillin?", icon: Calculator },
    { text: "Tips for remembering to take my medications", icon: Calendar },
  ]

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between card-header">
        <div>
          <h1 className="text-3xl font-bold">Ayurveda AI</h1>
          <p className="text-muted-foreground">Your personal medication assistant powered by AI</p>
        </div>
      </div>

      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="chat" className="data-[state=active]:bg-background">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-background">
            <BookOpen className="h-4 w-4 mr-2" />
            Medication Knowledge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <Card className="flex-1 flex flex-col card">
            <CardHeader className="pb-2 card-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BotIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Chat with Ayurveda AI</CardTitle>
                  <CardDescription>Ask questions about medications, dosages, side effects, and more</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-16rem)]" ref={scrollAreaRef}>
                <div className="px-6 py-4">
                  {apiKeyError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <AlertDescription>
                        <div className="flex flex-col gap-2">
                          <p>API key error. Please add a valid Gemini API key to your .env.local file:</p>
                          <p className="font-mono text-xs">GEMINI_API_KEY="your-api-key-here"</p>
                          <p>You can get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">Google AI Studio</a></p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && !apiKeyError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <AlertDescription>
                        Error: {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center py-12">
                      <div className="max-w-md space-y-6">
                        <div className="text-center space-y-2">
                          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                            <Sparkles className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-medium">Welcome to Ayurveda AI</h3>
                          <p className="text-sm text-muted-foreground">
                            I can help you with medication information, dosage calculations, drug interactions, and more.
                            What would you like to know?
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm font-medium text-muted-foreground">Popular questions</div>
                          <div className="grid grid-cols-1 gap-2">
                            {suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-start text-left h-auto py-3"
                                onClick={() => handleSuggestionClick(suggestion.text)}
                              >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <suggestion.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-sm">{suggestion.text}</div>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">Capabilities</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="border rounded-lg p-3 flex flex-col items-center text-center">
                              <Pill className="h-5 w-5 mb-2 text-primary" />
                              <div className="text-sm font-medium">Medication Info</div>
                              <div className="text-xs text-muted-foreground">Detailed information about medications</div>
                            </div>
                            <div className="border rounded-lg p-3 flex flex-col items-center text-center">
                              <AlertCircle className="h-5 w-5 mb-2 text-primary" />
                              <div className="text-sm font-medium">Drug Interactions</div>
                              <div className="text-xs text-muted-foreground">Check for potential interactions</div>
                            </div>
                            <div className="border rounded-lg p-3 flex flex-col items-center text-center">
                              <Calculator className="h-5 w-5 mb-2 text-primary" />
                              <div className="text-sm font-medium">Dosage Help</div>
                              <div className="text-xs text-muted-foreground">Dosage and timing information</div>
                            </div>
                            <div className="border rounded-lg p-3 flex flex-col items-center text-center">
                              <Calendar className="h-5 w-5 mb-2 text-primary" />
                              <div className="text-sm font-medium">Reminders</div>
                              <div className="text-xs text-muted-foreground">Tips for medication adherence</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4 pb-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-start gap-3 max-w-[85%]">
                            {message.role === "assistant" && (
                              <Avatar className="h-8 w-8 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-4 py-3 ${
                                message.role === "user" 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            {message.role === "user" && (
                              <Avatar className="h-8 w-8 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/20">U</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-3 max-w-[85%]">
                            <Avatar className="h-8 w-8 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg px-4 py-3 bg-muted flex">
                              <div className="flex items-center">
                                <div className="flex space-x-1">
                                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                  <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <Input
                  placeholder="Type your question about medications..."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading || apiKeyError}
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim() || apiKeyError}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="flex-1 mt-0 data-[state=inactive]:hidden overflow-auto">
          <div className="space-y-6">
            {/* Search Box */}
            <Card className="card">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search medication information..." 
                      className="pl-9"
                      onChange={(e) => {
                        setInput(e.target.value);
                        setActiveTab("chat");
                      }}
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      if (input.trim()) {
                        setActiveTab("chat");
                        setTimeout(() => {
                          const form = document.querySelector("form");
                          if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
                        }, 100);
                      }
                    }}
                  >
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {medicationCategories.map((category, index) => (
                <Card key={index} className="card hover:shadow-md transition-all cursor-pointer" onClick={() => {
                  setInput(`Tell me about ${category.name.toLowerCase()}`);
                  setActiveTab("chat");
                  setTimeout(() => {
                    const form = document.querySelector("form");
                    if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
                  }, 100);
                }}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Medications */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-primary" />
                  Featured Medications
                </CardTitle>
                <CardDescription>
                  Detailed information about commonly prescribed medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featuredMedications.map((med, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="h-2 bg-primary"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{med.name}</CardTitle>
                            <CardDescription>{med.category}</CardDescription>
                          </div>
                          <Badge>{med.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p>{med.description}</p>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">DOSAGE</p>
                          <p>{med.dosage}</p>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">COMMON SIDE EFFECTS</p>
                          <ul className="list-disc list-inside">
                            {med.common_side_effects.map((effect, i) => (
                              <li key={i}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-xs text-muted-foreground">PRECAUTIONS</p>
                          <p>{med.precautions}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => {
                          setInput(`Tell me more about ${med.name}`);
                          setActiveTab("chat");
                          setTimeout(() => {
                            const form = document.querySelector("form");
                            if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
                          }, 100);
                        }}>
                          Learn More
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Questions */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Common Medication Questions
                </CardTitle>
                <CardDescription>
                  Frequently asked questions about medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {commonMedicationQuestions.map((question, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setInput(question);
                        setActiveTab("chat");
                        setTimeout(() => {
                          const form = document.querySelector("form");
                          if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
                        }, 100);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-sm">{question}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medical Disclaimer */}
            <Alert className="bg-muted/50">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <div className="font-medium">Medical Disclaimer</div>
              </div>
              <AlertDescription className="mt-2 text-sm">
                The information provided by Ayurveda AI is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

