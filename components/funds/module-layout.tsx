"use client"

import { FundModuleNav, FundModuleNavSkeleton } from "./fund-module-nav"
import { TimeframeSelector } from "./timeframe-selector"
import { Calendar, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Fund, Timeframe, DataMode, FundModuleId } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

interface ModuleLayoutProps {
  fund: Fund | null
  fundId: string
  activeModule: FundModuleId
  children: React.ReactNode
  lastUpdated?: string
  dataSource?: DataMode
  isLoading?: boolean
  timeframe?: Timeframe
  onTimeframeChange?: (timeframe: Timeframe) => void
  showTimeframeSelector?: boolean
  actions?: React.ReactNode
  className?: string
  userRole?: string
}

export function ModuleLayout({
  fund,
  fundId,
  activeModule,
  children,
  lastUpdated,
  dataSource = "cached",
  isLoading = false,
  timeframe = "1Y",
  onTimeframeChange,
  showTimeframeSelector = true,
  actions,
  className,
  userRole,
}: ModuleLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {fund ? (
        <FundModuleNav fund={fund} activeModule={activeModule} userRole={userRole} />
      ) : (
        <FundModuleNavSkeleton />
      )}

      {/* Content Area */}
      <div className={cn("container mx-auto px-4 max-w-7xl py-6", className)}>
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Timeframe Selector */}
          {showTimeframeSelector && onTimeframeChange && (
            <TimeframeSelector
              value={timeframe}
              onChange={onTimeframeChange}
            />
          )}

          {/* Meta Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                <Calendar className="w-3 h-3" />
                <span>{lastUpdated}</span>
              </div>
            )}

            {/* Data Source Badge */}
            <div
              className={cn(
                "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg",
                dataSource === "live" && "bg-green-500/10 text-green-600",
                dataSource === "eod" && "bg-blue-500/10 text-blue-600",
                dataSource === "cached" && "bg-amber-500/10 text-amber-600"
              )}
            >
              <Database className="w-3 h-3" />
              <span className="uppercase">{dataSource}</span>
            </div>

            {/* Custom Actions */}
            {actions}
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <ModuleLayoutSkeleton />
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// Skeleton for module content
function ModuleLayoutSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted/50 animate-pulse rounded-xl" />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-80 bg-muted/50 animate-pulse rounded-xl" />
        <div className="h-80 bg-muted/50 animate-pulse rounded-xl" />
      </div>

      {/* Table */}
      <div className="h-64 bg-muted/50 animate-pulse rounded-xl" />
    </div>
  )
}

// Empty state component
interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title = "No Data Available",
  message = "There is no data available for this period or fund type.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <Database className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{message}</p>
      {action}
    </div>
  )
}

// Error state component
interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
}

export function ErrorState({
  title = "Error Loading Data",
  message,
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <Database className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}
