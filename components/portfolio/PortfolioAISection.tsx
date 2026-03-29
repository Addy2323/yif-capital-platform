"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AIAdviceCard } from "./AIAdviceCard"
import { StockMetrics, type StockMetricsData } from "./StockMetrics"
import { Loader2, BrainCircuit } from "lucide-react"
import { toast } from "sonner"

export interface PortfolioAISectionProps {
  /** Symbols from the user's holdings (or watchlist) */
  symbols: string[]
  defaultRisk?: "low" | "medium" | "high"
}

type AnalysisPayload = {
  stock: string
  metrics: StockMetricsData & Record<string, unknown>
  aiAdvice: {
    advice?: string
    confidence?: string
    reason?: string
    trend?: string
    risk?: string
    source?: string
  }
}

export function PortfolioAISection({
  symbols,
  defaultRisk = "medium",
}: PortfolioAISectionProps) {
  const unique = useMemo(
    () => Array.from(new Set(symbols.map((s) => s.toUpperCase()))),
    [symbols]
  )
  const [symbol, setSymbol] = useState(unique[0] ?? "CRDB")
  const [userRisk, setUserRisk] = useState<"low" | "medium" | "high">(defaultRisk)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AnalysisPayload | null>(null)

  const runAnalysis = useCallback(async () => {
    if (!symbol) {
      toast.error("Select a stock symbol.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/ai-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: symbol, userRisk }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Request failed")
      }
      setData(json.data as AnalysisPayload)
      if (json.cached) {
        toast.message("Loaded cached analysis (fresh within ~7 min).")
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load AI analysis"
      toast.error(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [symbol, userRisk])

  useEffect(() => {
    if (unique.length && !unique.includes(symbol)) {
      setSymbol(unique[0])
    }
  }, [unique, symbol])

  const pickList = unique.length > 0 ? unique : ["CRDB", "NMB", "TBL", "TCCL"]

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <BrainCircuit className="h-6 w-6 text-gold" />
            Portfolio intelligence
          </h2>
          <p className="text-sm text-muted-foreground">
            Regression on daily JSON history + Gemini advisory (fallback if API key unset)
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Label>Symbol</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Symbol" />
              </SelectTrigger>
              <SelectContent>
                {pickList.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Risk profile</Label>
            <Select
              value={userRisk}
              onValueChange={(v) => setUserRisk(v as "low" | "medium" | "high")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="bg-gold text-navy hover:bg-gold/90 sm:mb-0.5"
            onClick={() => void runAnalysis()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              "Run analysis"
            )}
          </Button>
        </div>
      </div>

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AIAdviceCard
            advice={data.aiAdvice.advice ?? "HOLD"}
            confidence={data.aiAdvice.confidence ?? "—"}
            reason={data.aiAdvice.reason ?? ""}
            trend={data.aiAdvice.trend}
            risk={data.aiAdvice.risk}
            source={data.aiAdvice.source}
          />
          <StockMetrics
            symbol={data.stock}
            metrics={{
              prediction7d: data.metrics.prediction7d as number | null,
              prediction30d: data.metrics.prediction30d as number | null,
              volatility: Number(data.metrics.volatility),
              momentum: Number(data.metrics.momentum),
              r2: data.metrics.r2 as number | undefined,
              slope: data.metrics.slope as number | undefined,
              support: data.metrics.support as number | undefined,
              resistance: data.metrics.resistance as number | undefined,
              sampleSize: data.metrics.sampleSize as number | undefined,
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Choose a symbol and risk level, then run analysis to see BUY / HOLD / SELL and metrics.
        </div>
      )}
    </section>
  )
}
