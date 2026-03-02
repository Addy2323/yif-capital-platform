"use client"

import { cn } from "@/lib/utils"
import type { Timeframe } from "@/lib/types/funds"

interface TimeframeSelectorProps {
  value: Timeframe
  onChange: (timeframe: Timeframe) => void
  options?: Timeframe[]
  className?: string
}

const DEFAULT_OPTIONS: Timeframe[] = [
  "1W",
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "3Y",
  "5Y",
  "SINCE_INCEPTION",
]

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1W": "1W",
  "1M": "1M",
  "3M": "3M",
  "6M": "6M",
  YTD: "YTD",
  "1Y": "1Y",
  "3Y": "3Y",
  "5Y": "5Y",
  SINCE_INCEPTION: "Since Inception",
}

export function TimeframeSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className,
}: TimeframeSelectorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-muted/50 rounded-lg",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            value === option
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {TIMEFRAME_LABELS[option]}
        </button>
      ))}
    </div>
  )
}
