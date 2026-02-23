"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, TrendingDown, Activity, Gauge, BarChart3 } from "lucide-react"
import type { Fund, RiskData, Timeframe, RiskLevel } from "@/lib/types/funds"
import { BOND_FUND_TYPES } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function RiskPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [risk, setRisk] = useState<RiskData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, riskRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/risk?timeframe=${timeframe}`),
        ])
        const fundResult = await fundRes.json()
        const riskResult = await riskRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (riskResult.success) setRisk(riskResult.data)
      } catch (err) {
        setError("Failed to load risk data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId, timeframe])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="risk">
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  const fundType = fund?.fund_type as string
  const isBondFund = BOND_FUND_TYPES.includes(fundType as any)

  const getRiskLevelColor = (level: RiskLevel | null) => {
    switch (level) {
      case 'LOW': return 'bg-green-500 text-white'
      case 'MEDIUM': return 'bg-amber-500 text-white'
      case 'HIGH': return 'bg-red-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="risk" isLoading={isLoading} timeframe={timeframe} onTimeframeChange={setTimeframe}>
      <div className="space-y-6">
        {/* Risk Level Banner */}
        {risk?.risk_level && (
          <Card className={cn("border-2", risk.risk_level === 'HIGH' ? 'border-red-500/50 bg-red-500/5' : risk.risk_level === 'MEDIUM' ? 'border-amber-500/50 bg-amber-500/5' : 'border-green-500/50 bg-green-500/5')}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className={cn("w-6 h-6", risk.risk_level === 'HIGH' ? 'text-red-500' : risk.risk_level === 'MEDIUM' ? 'text-amber-500' : 'text-green-500')} />
                <div>
                  <h3 className="font-semibold">Risk Level: {risk.risk_level}</h3>
                  <p className="text-sm text-muted-foreground">Based on volatility, drawdown, and VaR analysis</p>
                </div>
              </div>
              {risk.risk_score != null && (
                <div className="text-right">
                  <p className="text-2xl font-bold">{risk.risk_score}/100</p>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Max Drawdown" value={risk?.max_drawdown} format="percent" icon={<TrendingDown className="w-4 h-4" />} />
          <KPICard label="VaR (95%)" value={risk?.var_95} format="percent" icon={<AlertTriangle className="w-4 h-4" />} />
          <KPICard label="Volatility (1Y)" value={risk?.volatility_1y} format="percent" icon={<Activity className="w-4 h-4" />} />
          <KPICard label="Sharpe Ratio" value={risk?.sharpe_ratio} format="ratio" icon={<BarChart3 className="w-4 h-4" />} />
        </div>

        {/* Second Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="CVaR (95%)" value={risk?.cvar_95} format="percent" icon={<AlertTriangle className="w-4 h-4" />} />
          <KPICard label="Downside Dev." value={risk?.downside_deviation} format="percent" icon={<TrendingDown className="w-4 h-4" />} />
          <KPICard label="Sortino Ratio" value={risk?.sortino_ratio} format="ratio" icon={<Gauge className="w-4 h-4" />} />
          {isBondFund && <KPICard label="Duration" value={risk?.duration_years} format="ratio" icon={<Activity className="w-4 h-4" />} description="Years" />}
        </div>

        {/* Drawdown Chart */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Drawdown History</CardTitle></CardHeader>
          <CardContent>
            {risk?.drawdown_series && risk.drawdown_series.length > 0 ? (
              <div className="h-48 flex items-end gap-0.5 overflow-hidden">
                {risk.drawdown_series.slice(-60).map((point, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-red-500/40 hover:bg-red-500/60 rounded-t transition-colors"
                    style={{ height: `${Math.abs(point.drawdown_pct)}%` }}
                    title={`${point.date}: ${point.drawdown_pct.toFixed(2)}%`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No Drawdown Data" message="Drawdown history is not available." />
            )}
          </CardContent>
        </Card>

        {/* Stress Tests */}
        {risk?.stress_tests && risk.stress_tests.length > 0 && (
          <Card className="border-border/50">
            <CardHeader><CardTitle>Stress Test Scenarios</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {risk.stress_tests.map((test, i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-1">{test.scenario_name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{test.description}</p>
                    <p className={cn("text-lg font-bold", test.impact_pct >= 0 ? "text-green-600" : "text-red-600")}>
                      {test.impact_pct >= 0 ? '+' : ''}{test.impact_pct.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Ratings (Bond Funds) */}
        {isBondFund && risk?.credit_ratings && risk.credit_ratings.length > 0 && (
          <Card className="border-border/50">
            <CardHeader><CardTitle>Credit Rating Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {risk.credit_ratings.map((rating, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-12 font-medium">{rating.rating}</span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${rating.pct}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{rating.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  )
}
