import CollapsibleSidebar from "@/components/dashboard/collapsible-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Bell, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MedicationProvider } from "./medications/medication-context"

/**
 * DashboardLayout Component
 * 
 * Provides the main layout structure for all dashboard pages:
 * - Collapsible sidebar for navigation
 * - Header with user controls and theme toggle
 * - Main content area with responsive padding
 * - Footer with copyright information
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="layout-wrapper bg-background">
      <div className="flex flex-1">
        <CollapsibleSidebar />
        <div className="flex flex-col flex-1">
          {/* Header with user controls */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          
          {/* Main content area */}
          <main className="main-content flex-1 overflow-auto">
            <div className="container">
              <MedicationProvider>
                {children}
              </MedicationProvider>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
            <p>© 2023 Ayurveda AI. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  )
} 