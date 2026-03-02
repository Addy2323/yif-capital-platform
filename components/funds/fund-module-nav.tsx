"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import type { Fund, FundModuleId } from "@/lib/types/funds"
import { FUND_MODULE_TABS, FUND_TYPE_CONFIG } from "@/lib/types/funds"

interface FundModuleNavProps {
  fund: Fund
  activeModule: FundModuleId
  userRole?: string // For hiding attribution from non-analysts
}

export function FundModuleNav({ fund, activeModule, userRole }: FundModuleNavProps) {
  const pathname = usePathname()
  const typeConfig = FUND_TYPE_CONFIG[fund.fund_type]

  // Filter tabs based on user role (hide attribution for non-analysts/admins)
  const visibleTabs = FUND_MODULE_TABS.filter((tab) => {
    if (tab.id === "attribution") {
      return userRole === "analyst" || userRole === "ADMIN" || userRole === "admin"
    }
    return true
  })

  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Fund Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <Link
              href="/funds"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Funds
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{fund.fund_name}</h1>
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-wider", typeConfig?.color)}
            >
              {typeConfig?.label || fund.fund_type}
            </Badge>
          </div>

          {fund.date && (
            <div className="text-xs text-muted-foreground">
              Last Updated: {fund.date}
            </div>
          )}
        </div>

        {/* Module Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 scrollbar-hide">
          {visibleTabs.map((tab) => {
            const href = tab.route.replace('[fund_id]', fund.fund_id)
            const isActive = activeModule === tab.id

            return (
              <Link
                key={tab.id}
                href={href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// Skeleton loader
export function FundModuleNavSkeleton() {
  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4 border-b border-border/30">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
