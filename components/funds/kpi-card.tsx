import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  label: string
  value: number | string | null | undefined
  change?: number | null
  changePeriod?: string
  format?: "number" | "percent" | "currency" | "ratio"
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
  format = "number",
  currency = "TZS",
  icon,
  description,
  className,
}: KPICardProps) {
  const formatValue = (v: any) => {
    if (v === null || v === undefined) return "N/A"

    if (format === "currency") {
      return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
      }).format(v)
    }

    if (format === "percent") {
      return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
    }

    if (format === "ratio") {
      return v.toFixed(2)
    }

    return typeof v === "number" ? v.toLocaleString() : v
  }

  const getChangeDisplay = () => {
    if (change === null || change === undefined) return null
    const isPositive = change >= 0
    return (
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold mt-1",
        isPositive ? "text-emerald-500" : "text-rose-500"
      )}>
        <span>{isPositive ? "▲" : "▼"}</span>
        <span>{Math.abs(change).toFixed(2)}%</span>
        {changePeriod && <span className="text-muted-foreground font-medium ml-1">vs {changePeriod}</span>}
      </div>
    )
  }

  const isNA = value === null || value === undefined

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full group"
    >
      <Card
        className={cn(
          "bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:shadow-lg hover:border-primary/20 overflow-hidden h-full",
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">{icon}</div>
            )}
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
          </div>
          <div className="flex flex-col">
            <h3
              className={cn(
                "text-2xl font-bold transition-colors group-hover:text-primary",
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
    </motion.div>
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

