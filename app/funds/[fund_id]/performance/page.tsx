"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Activity, BarChart3, LineChart, Shield } from "lucide-react"
import type { Fund, PerformanceData, Timeframe } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

import { FundAreaChart } from "@/components/funds/fund-chart"

export default function PerformancePage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, perfRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/performance?timeframe=${timeframe}`),
        ])
        const fundResult = await fundRes.json()
        const perfResult = await perfRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (perfResult.success) setPerformance(perfResult.data)
      } catch (err) {
        setError("Failed to load performance data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId, timeframe])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="performance">
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  // Map cumulative returns for chart
  const cumulativeReturnsData = performance?.cumulative_returns.map(p => ({
    date: p.date,
    return: p.cumulative_return_pct
  })) || []

  return (
    <ModuleLayout
      fund={fund}
      fundId={fundId}
      activeModule="performance"
      isLoading={isLoading}
      timeframe={timeframe}
      onTimeframeChange={setTimeframe}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Absolute Return" value={performance?.return_absolute} format="percent" icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="CAGR" value={performance?.cagr} format="percent" icon={<Activity className="w-4 h-4" />} />
          <KPICard label="Sharpe Ratio" value={performance?.sharpe_ratio} format="ratio" icon={<BarChart3 className="w-4 h-4" />} />
          <KPICard label="Volatility" value={performance?.volatility} format="percent" icon={<Shield className="w-4 h-4" />} />
        </div>

        {/* Second Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Rolling 3M" value={performance?.rolling_3m} format="percent" icon={<LineChart className="w-4 h-4" />} />
          <KPICard label="Rolling 6M" value={performance?.rolling_6m} format="percent" icon={<LineChart className="w-4 h-4" />} />
          <KPICard label="Rolling 1Y" value={performance?.rolling_1y} format="percent" icon={<LineChart className="w-4 h-4" />} />
          <KPICard label="Sortino Ratio" value={performance?.sortino_ratio} format="ratio" icon={<Shield className="w-4 h-4" />} />
        </div>

        {/* Cumulative Returns Chart */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Cumulative Returns (%)</CardTitle></CardHeader>
          <CardContent>
            {cumulativeReturnsData.length > 0 ? (
              <FundAreaChart
                data={cumulativeReturnsData}
                series={[{ key: "return", label: "Cumulative Return", color: "#0ea5e9" }]}
                height={260}
                valueFormatter={(v) => `${v.toFixed(2)}%`}
              />
            ) : (
              <EmptyState title="No Cumulative Return Data" message="Historical performance data is not available." />
            )}
          </CardContent>
        </Card>


        {/* Monthly Returns Heatmap */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Monthly Returns Heatmap</CardTitle></CardHeader>
          <CardContent>
            {performance?.rolling_returns_heatmap && performance.rolling_returns_heatmap.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-12 gap-1 min-w-[600px]">
                  {performance.rolling_returns_heatmap.map((point, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-8 rounded flex items-center justify-center text-xs font-medium",
                        point.return_pct == null ? "bg-muted text-muted-foreground" :
                          point.return_pct >= 5 ? "bg-green-600 text-white" :
                            point.return_pct >= 2 ? "bg-green-500/70 text-white" :
                              point.return_pct >= 0 ? "bg-green-400/50" :
                                point.return_pct >= -2 ? "bg-red-400/50" :
                                  point.return_pct >= -5 ? "bg-red-500/70 text-white" :
                                    "bg-red-600 text-white"
                      )}
                      title={`${point.year}-${String(point.month).padStart(2, '0')}: ${point.return_pct?.toFixed(2) || 'N/A'}%`}
                    >
                      {point.return_pct?.toFixed(1) ?? '-'}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No Heatmap Data" message="Monthly return data is not available." />
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}
