"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Layers, BarChart3, PieChart } from "lucide-react"
import type { Fund, AttributionData, Timeframe } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function AttributionPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [attribution, setAttribution] = useState<AttributionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, attrRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/attribution?timeframe=${timeframe}`),
        ])
        const fundResult = await fundRes.json()
        const attrResult = await attrRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (attrResult.success) setAttribution(attrResult.data)
      } catch (err) {
        setError("Failed to load attribution data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId, timeframe])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="attribution">
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="attribution" isLoading={isLoading} timeframe={timeframe} onTimeframeChange={setTimeframe}>
      <div className="space-y-6">
        {/* Attribution KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Return" value={attribution?.total_return} format="percent" icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="Benchmark Return" value={attribution?.benchmark_return} format="percent" icon={<BarChart3 className="w-4 h-4" />} />
          <KPICard label="Active Return" value={attribution?.active_return} format="percent" icon={<Target className="w-4 h-4" />} />
          <KPICard label="Interaction Effect" value={attribution?.interaction_effect} format="percent" icon={<Layers className="w-4 h-4" />} />
        </div>

        {/* Attribution Effects */}
        <div className="grid gap-4 sm:grid-cols-2">
          <KPICard label="Asset Allocation Effect" value={attribution?.asset_allocation_effect} format="percent" icon={<PieChart className="w-4 h-4" />} description="Contribution from asset allocation decisions" />
          <KPICard label="Security Selection Effect" value={attribution?.security_selection_effect} format="percent" icon={<Target className="w-4 h-4" />} description="Contribution from security selection" />
        </div>

        {/* Waterfall Chart */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Attribution Waterfall</CardTitle></CardHeader>
          <CardContent>
            {attribution?.waterfall && attribution.waterfall.length > 0 ? (
              <div className="space-y-4">
                {/* Waterfall visualization */}
                <div className="flex items-end justify-center gap-2 h-64">
                  {attribution.waterfall.map((item, i) => {
                    const height = Math.abs(item.value) * 10
                    const isPositive = item.type === 'positive' || (item.type === 'base' && item.value >= 0)
                    const isTotal = item.type === 'total'
                    
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <span className={cn(
                          "text-xs font-medium mb-1",
                          item.value >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}%
                        </span>
                        <div
                          className={cn(
                            "w-16 rounded-t transition-all",
                            isTotal ? "bg-gray-700" :
                            isPositive ? "bg-green-500/70" : "bg-red-500/70"
                          )}
                          style={{ height: `${Math.min(height, 200)}px` }}
                        />
                        <span className="text-xs text-muted-foreground mt-2 text-center max-w-[80px]">{item.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500/70 rounded" />
                    <span>Positive Effect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500/70 rounded" />
                    <span>Negative Effect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded" />
                    <span>Total</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No Attribution Data" message="Attribution analysis is not available for this fund or timeframe." />
            )}
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Understanding Attribution Analysis</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Asset Allocation Effect</p>
                <p>Measures the impact of allocating capital to different asset classes compared to the benchmark.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Security Selection Effect</p>
                <p>Measures the impact of selecting specific securities within each asset class.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Interaction Effect</p>
                <p>The combined effect of allocation and selection decisions working together.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Active Return</p>
                <p>The total return above or below the benchmark return (Fund Return - Benchmark Return).</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}
