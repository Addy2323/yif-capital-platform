"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export type AdviceKind = "BUY" | "HOLD" | "SELL"

export interface AIAdviceCardProps {
  advice: AdviceKind | string
  confidence: string
  reason: string
  trend?: string
  risk?: string
  source?: string
}

function adviceStyles(advice: string) {
  const a = advice.toUpperCase()
  if (a.includes("BUY")) {
    return {
      badge: "bg-emerald-600 text-white hover:bg-emerald-600",
      border: "border-emerald-500/30",
      glow: "from-emerald-500/10",
    }
  }
  if (a.includes("SELL")) {
    return {
      badge: "bg-red-600 text-white hover:bg-red-600",
      border: "border-red-500/30",
      glow: "from-red-500/10",
    }
  }
  return {
    badge: "bg-amber-500 text-navy hover:bg-amber-500",
    border: "border-amber-500/40",
    glow: "from-amber-500/10",
  }
}

export function AIAdviceCard({
  advice,
  confidence,
  reason,
  trend,
  risk,
  source,
}: AIAdviceCardProps) {
  const styles = adviceStyles(advice)

  return (
    <Card className={`overflow-hidden border ${styles.border} bg-gradient-to-br ${styles.glow} to-card`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <CardTitle className="text-lg">AI guidance</CardTitle>
          </div>
          <Badge className={styles.badge}>{advice}</Badge>
        </div>
        <CardDescription>
          DSE portfolio insight (TZS). Educational only — not personal financial advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-medium tabular-nums">{confidence}</span>
          {trend ? (
            <>
              <span className="text-muted-foreground">· Trend</span>
              <Badge variant="outline">{trend}</Badge>
            </>
          ) : null}
          {risk ? (
            <>
              <span className="text-muted-foreground">· Risk</span>
              <Badge variant="secondary">{risk}</Badge>
            </>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{reason}</p>
        {source ? (
          <p className="text-xs text-muted-foreground">Source: {source}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
