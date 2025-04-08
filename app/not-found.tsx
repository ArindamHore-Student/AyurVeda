/**
 * 404 Not Found Page
 * 
 * This component displays when a user navigates to a page that doesn't exist.
 * It provides a user-friendly error message and navigation options.
 */

import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
        <div className="mb-4 text-7xl font-bold">404</div>
        <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Page Not Found</h1>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}