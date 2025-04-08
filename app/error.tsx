"use client"

/**
 * Global Error Boundary Component
 * 
 * This component displays when an unhandled error occurs in the application.
 * It provides users with information about the error and options to recover.
 */

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log the error to console for debugging purposes
  useEffect(() => {
    console.error("Global application error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">Something went wrong</h1>
            <p className="mb-6 text-muted-foreground">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            {error.message && (
              <div className="mb-6 w-full overflow-auto rounded-lg border bg-muted p-4 text-left text-sm">
                <p className="font-mono">{error.message}</p>
                {error.digest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={reset} variant="default">
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 