"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard, KPICardSkeleton } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  Shield,
  AlertTriangle,
  Layers,
} from "lucide-react"
import type { Fund, OverviewData, Timeframe } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

import { FundAreaChart } from "@/components/funds/fund-chart"
import { MultiSeriesNavChart } from "@/components/funds/multi-series-nav-chart"

export default function OverviewPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [rawRecords, setRawRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch fund, overview, and raw performance data in parallel
        const [fundRes, overviewRes, rawRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/overview?timeframe=${timeframe}`),
          fetch(`/api/funds/${fundId}`),
        ])
        const fundResult = await fundRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)

        const overviewResult = await overviewRes.json()
        if (overviewResult.success) {
          setOverview(overviewResult.data)
        }

        const rawResult = await rawRes.json()
        if (rawResult.success) {
          setRawRecords(rawResult.data)
        }
      } catch (err) {
        setError("Failed to load fund data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fundId, timeframe])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Re-trigger fetch
    window.location.reload()
  }

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="overview">
        <ErrorState message={error} retry={handleRetry} />
      </ModuleLayout>
    )
  }

  // Map nav history for chart
  const navChartData = overview?.nav_history.map(p => ({
    date: p.date,
    nav: p.nav
  })) || []

  // Map benchmark data for chart
  const benchmarkChartData = overview?.fund_vs_benchmark.map(p => ({
    date: p.date,
    fund: p.fund_return,
    benchmark: p.benchmark_return
  })) || []

  return (
    <ModuleLayout
      fund={fund}
      fundId={fundId}
      activeModule="overview"
      isLoading={isLoading}
      timeframe={timeframe}
      onTimeframeChange={setTimeframe}
      lastUpdated={overview?.nav_history[overview.nav_history.length - 1]?.date}
    >
      <div className="space-y-6">
        {/* KPI Cards - Top Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Fund AUM"
            value={overview?.aum}
            change={overview?.aum_change_pct}
            changePeriod="period"
            format="currency"
            currency={fund?.base_currency || "TZS"}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <KPICard
            label="Current NAV/Unit"
            value={overview?.nav}
            change={overview?.nav_change_1d}
            changePeriod="1D"
            format="number"
            icon={<Activity className="w-4 h-4" />}
          />
          <KPICard
            label="Return (YTD)"
            value={overview?.return_ytd}
            format="percent"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <KPICard
            label="Return (1Y)"
            value={overview?.return_1y}
            format="percent"
            icon={<BarChart3 className="w-4 h-4" />}
          />
        </div>

        {/* Second Row KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Return (MTD)"
            value={overview?.return_mtd}
            format="percent"
            icon={<Calendar className="w-4 h-4" />}
          />
          <KPICard
            label="Since Inception"
            value={overview?.return_since_inception}
            format="percent"
            description={fund?.inception_date ? `Since ${fund.inception_date}` : undefined}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <KPICard
            label="Expense Ratio"
            value={overview?.expense_ratio}
            format="percent"
            icon={<Percent className="w-4 h-4" />}
          />
          <KPICard
            label="Cash Position"
            value={overview?.cash_position_pct}
            format="percent"
            icon={<Layers className="w-4 h-4" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* NAV Performance Trends (Multi-series) */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">NAV Performance Trends</CardTitle>
              <span className="text-xs text-muted-foreground">
                {rawRecords.length} data points
              </span>
            </CardHeader>
            <CardContent>
              {rawRecords.length > 0 ? (
                <MultiSeriesNavChart data={rawRecords} height={280} />
              ) : (
                <EmptyState title="No NAV Data" message="Historical NAV data is not available." />
              )}
            </CardContent>
          </Card>

          {/* Fund vs Benchmark */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Fund vs Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <FundAreaChart
                data={benchmarkChartData}
                series={[
                  { key: "fund", label: "Fund", color: "#0ea5e9" },
                  { key: "benchmark", label: fund?.benchmark_name || "Benchmark", color: "#94a3b8" }
                ]}
                height={230}
              />
            </CardContent>
          </Card>
        </div>


        {/* Summary Stats Strip */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Key Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatChip label="Tracking Error" value={overview?.tracking_error} format="percent" />
              <StatChip label="Alpha" value={overview?.alpha} format="ratio" />
              <StatChip label="Beta" value={overview?.beta} format="ratio" />
              <StatChip label="Sharpe Ratio" value={overview?.sharpe_ratio} format="ratio" />
              <StatChip label="Volatility (1Y)" value={overview?.volatility_1y} format="percent" />
              <StatChip label="Max Drawdown" value={overview?.max_drawdown} format="percent" isNegative />
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}

// Stat chip component for summary strip
function StatChip({
  label,
  value,
  format,
  isNegative,
}: {
  label: string
  value: number | null | undefined
  format: "percent" | "ratio"
  isNegative?: boolean
}) {
  const formatValue = (v: number) => {
    if (format === "percent") return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
    return v.toFixed(2)
  }

  return (
    <div className="text-center p-3 bg-muted/30 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p
        className={cn(
          "text-sm font-bold",
          value == null && "text-gray-400 italic",
          value != null && !isNegative && value > 0 && "text-green-600",
          value != null && !isNegative && value < 0 && "text-red-600",
          isNegative && "text-red-600"
        )}
      >
        {value != null ? formatValue(value) : "N/A"}
      </p>
    </div>
  )
}
