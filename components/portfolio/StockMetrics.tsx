"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, LineChart, Shield } from "lucide-react"

export interface StockMetricsData {
  prediction7d: number | null
  prediction30d: number | null
  volatility: number
  momentum: number
  r2?: number
  slope?: number
  support?: number
  resistance?: number
  sampleSize?: number
}

export interface StockMetricsProps {
  metrics: StockMetricsData
  symbol: string
}

function fmtTzs(n: number | null | undefined) {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—"
  return `TZS ${Math.round(n).toLocaleString()}`
}

export function StockMetrics({ metrics, symbol }: StockMetricsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-gold" />
          <div>
            <CardTitle className="text-lg">Regression metrics</CardTitle>
            <CardDescription>{symbol} — linear trend & risk stats</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">7d implied price</p>
            <p className="text-lg font-semibold tabular-nums">{fmtTzs(metrics.prediction7d)}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">30d implied price</p>
            <p className="text-lg font-semibold tabular-nums">{fmtTzs(metrics.prediction30d)}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              Volatility (daily returns)
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {(metrics.volatility * 100).toFixed(2)}%
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Momentum (series)
            </div>
            <p
              className={`text-lg font-semibold tabular-nums ${
                metrics.momentum >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {metrics.momentum >= 0 ? "+" : ""}
              {metrics.momentum.toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {metrics.r2 !== undefined ? (
            <span>R² {Number(metrics.r2).toFixed(3)}</span>
          ) : null}
          {metrics.slope !== undefined ? (
            <span>Slope {Number(metrics.slope).toFixed(4)}</span>
          ) : null}
          {metrics.support !== undefined && metrics.resistance !== undefined ? (
            <span>
              Support {fmtTzs(metrics.support)} · Resistance {fmtTzs(metrics.resistance)}
            </span>
          ) : null}
          {metrics.sampleSize ? <span>n = {metrics.sampleSize} days</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}
