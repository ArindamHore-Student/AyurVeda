import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageCircle, Pill, Calculator, Calendar, AlertCircle, Settings } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assistant",
    href: "/dashboard/assistant",
    icon: MessageCircle,
  },
  {
    title: "Medications",
    href: "/dashboard/medications",
    icon: Pill,
  },
  {
    title: "Dosage Calculator",
    href: "/dashboard/calculator",
    icon: Calculator,
  },
  {
    title: "Adherence",
    href: "/dashboard/adherence",
    icon: Calendar,
  },
  {
    title: "Interactions",
    href: "/dashboard/interactions",
    icon: AlertCircle,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.href} title={item.title} href={item.href} icon={item.icon} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SidebarItem({
  title,
  href,
  icon: Icon,
}: {
  title: string
  href: string
  icon: React.ElementType
}) {
  // In a real app, you would check if the current path matches the href
  const isActive = false

  return (
    <Link href={href}>
      <Button variant="ghost" className={cn("w-full justify-start", isActive && "bg-muted font-medium")}>
        <Icon className="mr-2 h-4 w-4" />
        {title}
      </Button>
    </Link>
  )
}

