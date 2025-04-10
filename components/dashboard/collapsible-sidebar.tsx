"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Pill, 
  Bot, 
  Calculator, 
  Check, 
  ShieldAlert, 
  Settings, 
  BellRing, 
  Clock, 
  Activity, 
  User, 
  Sparkles,
  Info
} from "lucide-react"

interface CollapsibleSidebarProps {
  className?: string
}

export default function CollapsibleSidebar({ className }: CollapsibleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  // Check localStorage for saved state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed))
  }, [collapsed])

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
      badge: "",
      description: "Overview and summary"
    },
    {
      name: "Assistant",
      href: "/dashboard/assistant",
      icon: <Bot className="h-[18px] w-[18px]" />,
      badge: "",
      description: "AI medication assistance"
    },
    {
      name: "Medications",
      href: "/dashboard/medications",
      icon: <Pill className="h-[18px] w-[18px]" />,
      badge: "",
      description: "Manage your medications"
    },
    {
      name: "Calculator",
      href: "/dashboard/calculator",
      icon: <Calculator className="h-[18px] w-[18px]" />,
      badge: "",
      description: "Dose calculations"
    },
    {
      name: "Adherence",
      href: "/dashboard/adherence",
      icon: <Check className="h-[18px] w-[18px]" />,
      badge: "",
      description: "Medication tracking"
    },
    {
      name: "Interactions",
      href: "/dashboard/interactions",
      icon: <ShieldAlert className="h-[18px] w-[18px]" />,
      badge: "",
      description: "Check for drug interactions"
    },
    {
      name: "About",
      href: "/dashboard/about",
      icon: <Info className="h-[18px] w-[18px]" />,
      badge: "",
      description: "About Ayurveda"
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-[18px] w-[18px]" />,
      badge: "",
      description: "Your personal details"
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-[18px] w-[18px]" />,
      badge: "",
      description: "App preferences"
    },
  ]

  return (
    <div
      className={cn(
        "group relative border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-60" />
      
      <div className="flex h-full flex-col pb-4">
        {/* Sidebar header */}
        <div className={cn(
          "flex h-[60px] items-center px-4 py-2 border-b border-border",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-lg">Ayurveda</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2 px-3">
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center mr-3",
                    collapsed ? "mr-0" : "mr-3",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.icon}
                  </div>
                  
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span>{item.name}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1 opacity-80">{item.description}</p>
                      </div>
                      
                      {item.badge && (
                        <div className="ml-auto">
                          <span className="inline-flex items-center justify-center h-5 px-2 rounded-full text-xs font-medium bg-primary-foreground text-primary">
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Bottom section */}
        <div className={cn(
          "mt-auto px-3 pt-4",
          collapsed ? "text-center" : ""
        )}>
          {!collapsed && (
            <div className="rounded-lg bg-muted p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <h5 className="font-medium mb-1 flex items-center gap-1.5">
                  <BellRing className="h-4 w-4 text-primary" />
                  <span>Reminder</span>
                </h5>
                <p className="text-xs text-muted-foreground mb-3">
                  Take your evening medications in 30 minutes
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>7:30 PM</span>
                  </div>
                  <Button size="sm" variant="default" className="h-7 text-xs">View</Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 w-full">
            <div className={cn(
              "border-t border-border pt-4",
              collapsed ? "flex justify-center" : "flex items-center"
            )}>
              {collapsed ? (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">Medication Adherence</span>
                    <div className="h-1.5 w-full bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 