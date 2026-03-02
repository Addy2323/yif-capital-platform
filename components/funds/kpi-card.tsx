"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { KPIFormat } from "@/lib/types/funds"

interface KPICardProps {
  label: string
  value: number | string | null | undefined
  change?: number | null | undefined
  changePeriod?: string
  format: KPIFormat
  currency?: string
  icon?: React.ReactNode
  description?: string
  className?: string
}

export function KPICard({
  label,
  value,
  change,
  changePeriod,
  format,
  currency = "TZS",
  icon,
  description,
  className,
}: KPICardProps) {
  // Format value based on type
  const formatValue = (val: number | string | null | undefined): string => {
    if (val == null) return "N/A"
    if (typeof val === "string") return val

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-TZ", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      case "percent":
        return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`
      case "ratio":
        return val.toFixed(2)
      case "number":
      default:
        if (val >= 1_000_000_000_000) {
          return `${(val / 1_000_000_000_000).toFixed(2)}T`
        }
        if (val >= 1_000_000_000) {
          return `${(val / 1_000_000_000).toFixed(2)}B`
        }
        if (val >= 1_000_000) {
          return `${(val / 1_000_000).toFixed(2)}M`
        }
        return new Intl.NumberFormat("en-US").format(val)
    }
  }

  // Determine change display
  const getChangeDisplay = () => {
    if (change === null || change === undefined) return null

    const isPositive = change > 0
    const isNegative = change < 0
    const isNeutral = change === 0

    return (
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium",
          isPositive && "text-green-600",
          isNegative && "text-red-600",
          isNeutral && "text-gray-500"
        )}
      >
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        {isNeutral && <Minus className="h-3 w-3" />}
        <span>
          {isPositive && "+"}
          {change.toFixed(2)}%
        </span>
        {changePeriod && (
          <span className="text-gray-400 ml-1">{changePeriod}</span>
        )}
      </div>
    )
  }

  const isNA = value === null || value === undefined

  return (
    <Card
      className={cn(
        "bg-card/50 backdrop-blur-sm border-border/50 transition-all",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
          )}
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        <div className="flex flex-col">
          <h3
            className={cn(
              "text-2xl font-bold",
              isNA && "text-gray-400 italic text-lg"
            )}
          >
            {formatValue(value)}
          </h3>
          {getChangeDisplay()}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton loader for KPI cards
export function KPICardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-muted animate-pulse w-8 h-8" />
          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mt-2" />
        <div className="h-3 w-20 bg-muted animate-pulse rounded mt-2" />
      </CardContent>
    </Card>
  )
}
