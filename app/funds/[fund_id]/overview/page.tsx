"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign,
  Activity,
  TrendingUp,
  BarChart3,
  Calendar,
  Percent,
  Layers
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/funds/kpi-card"
import { MultiSeriesNavChart } from "@/components/funds/multi-series-nav-chart"
import { FundAreaChart } from "@/components/funds/fund-chart"
import { ModuleLayout, EmptyState } from "@/components/funds/module-layout"
import { cn } from "@/lib/utils"
import type { Fund, OverviewData, Timeframe } from "@/lib/types/funds"

export default function OverviewPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [rawRecords, setRawRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, overviewRes, navRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/overview`),
          fetch(`/api/v1/funds/${fundId}/nav?limit=100`)
        ])

        const [fundData, overviewData, navData] = await Promise.all([
          fundRes.json(),
          overviewRes.json(),
          navRes.json()
        ])

        if (fundData.success) setFund(fundData.data)
        if (overviewData.success) setOverview(overviewData.data)
        if (navData.success) setRawRecords(navData.data)

        if (!fundData.success || !overviewData.success) {
          setError("Failed to load fund overview data")
        }
      } catch (err) {
        setError("An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    if (fundId) {
      fetchData()
    }
  }, [fundId])

  const benchmarkChartData = useMemo(() => {
    if (!overview?.nav_history) return []
    return overview.nav_history.map(item => ({
      date: item.date,
      fund: item.nav,
      benchmark: item.nav * (1 + (Math.random() * 0.04 - 0.02)) // Mock benchmark data
    }))
  }, [overview])

  const handleRetry = () => {
    window.location.reload()
  }

  if (error && !isLoading) {
    return (
      <ModuleLayout fund={null} fundId={fundId} activeModule="overview" isLoading={false}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </ModuleLayout>
    )
  }

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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* KPI Cards - Top Row */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </motion.div>

        {/* Second Row KPIs */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
          {/* NAV Performance Trends (Multi-series) */}
          <Card className="lg:col-span-2 border-border/50 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/5 group-hover:bg-muted/10 transition-colors">
              <CardTitle className="text-lg">NAV Performance Trends</CardTitle>
              <span className="text-xs text-muted-foreground font-medium">
                {rawRecords.length} data points
              </span>
            </CardHeader>
            <CardContent className="pt-6">
              {rawRecords.length > 0 ? (
                <MultiSeriesNavChart data={rawRecords} height={280} />
              ) : (
                <EmptyState title="No NAV Data" message="Historical NAV data is not available." />
              )}
            </CardContent>
          </Card>

          {/* Fund vs Benchmark */}
          <Card className="border-border/50 overflow-hidden group">
            <CardHeader className="pb-2 bg-muted/5 group-hover:bg-muted/10 transition-colors">
              <CardTitle className="text-lg">Fund vs Benchmark</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
        </motion.div>


        {/* Summary Stats Strip */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 overflow-hidden group">
            <CardHeader className="pb-2 bg-muted/5 group-hover:bg-muted/10 transition-colors">
              <CardTitle className="text-lg">Key Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
        </motion.div>
      </motion.div>
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

