"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { KPICard } from "@/components/funds/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent, BarChart3 } from "lucide-react"
import type { Fund, IncomeData } from "@/lib/types/funds"
import { BOND_FUND_TYPES } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function IncomePage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [income, setIncome] = useState<IncomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, incomeRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/income`),
        ])
        const fundResult = await fundRes.json()
        const incomeResult = await incomeRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (incomeResult.success) setIncome(incomeResult.data)
      } catch (err) {
        setError("Failed to load income data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="income" showTimeframeSelector={false}>
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  const fundType = fund?.fund_type as string
  const isBondFund = BOND_FUND_TYPES.includes(fundType as any)

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="income" isLoading={isLoading} showTimeframeSelector={false}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Daily Liquidity Ratio" value={income?.daily_liquidity_ratio} format="percent" icon={<Wallet className="w-4 h-4" />} />
          <KPICard label="Total Income" value={income?.total_income} format="currency" currency={fund?.base_currency} icon={<DollarSign className="w-4 h-4" />} />
          <KPICard label="Interest Income" value={income?.interest_income} format="currency" currency={fund?.base_currency} icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="Dividend Income" value={income?.dividend_income} format="currency" currency={fund?.base_currency} icon={<DollarSign className="w-4 h-4" />} />
        </div>

        {/* Second Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Net Investment Income" value={income?.net_investment_income} format="currency" currency={fund?.base_currency} icon={<BarChart3 className="w-4 h-4" />} />
          <KPICard label="Expense Ratio" value={income?.expense_ratio} format="percent" icon={<Percent className="w-4 h-4" />} />
          <KPICard label="Cash Inflows" value={income?.cash_inflows} format="currency" currency={fund?.base_currency} icon={<TrendingUp className="w-4 h-4" />} />
          <KPICard label="Cash Outflows" value={income?.cash_outflows} format="currency" currency={fund?.base_currency} icon={<TrendingDown className="w-4 h-4" />} />
        </div>

        {/* Cash Flow Timeline */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Cash Flow Timeline</CardTitle></CardHeader>
          <CardContent>
            {income?.cash_flow_timeline && income.cash_flow_timeline.length > 0 ? (
              <div className="h-64 flex items-end gap-1 overflow-hidden">
                {income.cash_flow_timeline.slice(-30).map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-0.5">
                    <div className="bg-green-500/60 rounded-t" style={{ height: `${Math.min(point.inflow / 1000000, 100)}px` }} />
                    <div className="bg-red-500/60 rounded-t" style={{ height: `${Math.min(point.outflow / 1000000, 100)}px` }} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Cash Flow Data" message="Cash flow timeline is not available." />
            )}
          </CardContent>
        </Card>

        {/* Maturity Profile (Bond Funds) */}
        {isBondFund && income?.maturity_profile && income.maturity_profile.length > 0 && (
          <Card className="border-border/50">
            <CardHeader><CardTitle>Maturity Profile</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {income.maturity_profile.map((bucket, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-32 text-sm">{bucket.bucket_label}</span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${bucket.pct_of_aum}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">{bucket.pct_of_aum.toFixed(1)}%</span>
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
