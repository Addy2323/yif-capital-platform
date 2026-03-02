import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { RiskData, ApiResponse, Timeframe } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/risk - Module 4: Risk Analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fund_id: string }> }
) {
  try {
    const { fund_id: raw_fund_id } = await params
    const fund_id = resolveFundId(raw_fund_id)
    const { searchParams } = new URL(request.url)
    const timeframe = (searchParams.get("timeframe") || "1Y") as Timeframe

    const fund = await prisma.fund.findFirst({
      where: { OR: [{ fundId: fund_id }, { fundSlug: fund_id }] },
    })

    if (!fund) {
      return NextResponse.json({ success: false, data: null, error: "Fund not found", metadata: { fund_id, timeframe, last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 404 })
    }

    // Fetch all daily summaries for the fund
    const days = getTimeframeDays(timeframe)
    const allRecords = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "asc" },
    })

    // Get unique schemes and pick the main one (largest AUM)
    const schemes = [...new Set(allRecords.map(r => r.schemeName).filter(Boolean))] as string[]

    // Use main scheme for risk analysis (or all if single-scheme fund)
    const latestDate = allRecords[allRecords.length - 1]?.date
    const latestRecords = allRecords.filter(r => r.date.getTime() === latestDate?.getTime())
    const mainScheme = latestRecords.sort((a, b) => b.aum - a.aum)[0]?.schemeName

    const history = mainScheme
      ? allRecords.filter(r => r.schemeName === mainScheme)
      : allRecords

    // Filter to timeframe window
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const tfHistory = history.filter(r => r.date >= cutoff)
    const workingHistory = tfHistory.length > 30 ? tfHistory : history

    // Daily returns
    const dailyReturns: number[] = []
    for (let i = 1; i < workingHistory.length; i++) {
      const prev = workingHistory[i - 1].nav
      const curr = workingHistory[i].nav
      if (prev > 0) dailyReturns.push(((curr - prev) / prev) * 100)
    }

    // Annualized volatility
    const volatility1y = dailyReturns.length > 20
      ? Math.sqrt(dailyReturns.reduce((sum, r) => sum + r * r, 0) / dailyReturns.length) * Math.sqrt(252)
      : null

    // Max drawdown
    let peak = workingHistory[0]?.nav || 0
    let maxDD = 0
    for (const h of workingHistory) {
      if (h.nav > peak) peak = h.nav
      const dd = ((peak - h.nav) / peak) * 100
      if (dd > maxDD) maxDD = dd
    }

    // VaR (95%)
    const sortedReturns = [...dailyReturns].sort((a, b) => a - b)
    const var95 = sortedReturns.length > 20
      ? sortedReturns[Math.floor(sortedReturns.length * 0.05)]
      : null

    // CVaR (95%) - average of worst 5% returns
    const cvar95 = sortedReturns.length > 20
      ? (() => {
        const cutIdx = Math.floor(sortedReturns.length * 0.05)
        const tail = sortedReturns.slice(0, cutIdx + 1)
        return tail.reduce((a, b) => a + b, 0) / tail.length
      })()
      : null

    // Downside deviation (only negative returns)
    const negReturns = dailyReturns.filter(r => r < 0)
    const downsideDev = negReturns.length > 5
      ? Math.sqrt(negReturns.reduce((sum, r) => sum + r * r, 0) / negReturns.length) * Math.sqrt(252)
      : null

    // Annualized return
    const annReturn = dailyReturns.length > 0
      ? (dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length) * 252
      : null

    // Sharpe ratio (risk-free rate 5%)
    const sharpeRatio = volatility1y && volatility1y > 0 && annReturn != null
      ? (annReturn - 5) / volatility1y
      : null

    // Sortino ratio
    const sortinoRatio = downsideDev && downsideDev > 0 && annReturn != null
      ? (annReturn - 5) / downsideDev
      : null

    // Risk level
    const riskScore = calculateRiskScore(volatility1y, maxDD, var95)
    const riskLevel = riskScore <= 35 ? "LOW" : riskScore <= 65 ? "MEDIUM" : "HIGH"

    // Build drawdown series
    const drawdownSeries: { date: string; drawdown_pct: number }[] = []
    let seriesPeak = workingHistory[0]?.nav || 0
    for (const h of workingHistory) {
      if (h.nav > seriesPeak) seriesPeak = h.nav
      drawdownSeries.push({
        date: h.date.toISOString().split("T")[0],
        drawdown_pct: parseFloat((((h.nav - seriesPeak) / seriesPeak) * 100).toFixed(2)),
      })
    }

    // Build rolling volatility series (20-day window)
    const volSeries: { date: string; rolling_vol_pct: number }[] = []
    const window = 20
    for (let i = window; i < workingHistory.length; i++) {
      const windowReturns: number[] = []
      for (let j = i - window + 1; j <= i; j++) {
        const prev = workingHistory[j - 1].nav
        const curr = workingHistory[j].nav
        if (prev > 0) windowReturns.push(((curr - prev) / prev) * 100)
      }
      if (windowReturns.length >= window - 1) {
        const mean = windowReturns.reduce((a, b) => a + b, 0) / windowReturns.length
        const variance = windowReturns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / windowReturns.length
        volSeries.push({
          date: workingHistory[i].date.toISOString().split("T")[0],
          rolling_vol_pct: parseFloat((Math.sqrt(variance) * Math.sqrt(252)).toFixed(2)),
        })
      }
    }

    // Stress test scenarios (based on actual historical data)
    const stressTests = buildStressTests(workingHistory, dailyReturns)

    const riskData: RiskData = {
      max_drawdown: parseFloat((-maxDD).toFixed(2)),
      var_95: var95 ? parseFloat(var95.toFixed(2)) : null,
      cvar_95: cvar95 ? parseFloat(cvar95.toFixed(2)) : null,
      downside_deviation: downsideDev ? parseFloat(downsideDev.toFixed(2)) : null,
      volatility_1y: volatility1y ? parseFloat(volatility1y.toFixed(2)) : null,
      sharpe_ratio: sharpeRatio ? parseFloat(sharpeRatio.toFixed(2)) : null,
      sortino_ratio: sortinoRatio ? parseFloat(sortinoRatio.toFixed(2)) : null,
      risk_level: riskLevel as any,
      risk_score: riskScore,
      duration_years: null,
      credit_ratings: [],
      drawdown_series: drawdownSeries.filter((_, i) => i % Math.max(1, Math.floor(drawdownSeries.length / 200)) === 0),
      volatility_series: volSeries.filter((_, i) => i % Math.max(1, Math.floor(volSeries.length / 200)) === 0),
      stress_tests: stressTests,
    }

    return NextResponse.json({
      success: true,
      data: riskData,
      metadata: {
        fund_id: fund.fundId,
        timeframe,
        last_updated_at: latestDate?.toISOString() || new Date().toISOString(),
        data_source: "computed",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    console.error("Error fetching risk:", error)
    return NextResponse.json({ success: false, data: null, error: error.message, metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 500 })
  }
}

function getTimeframeDays(timeframe: Timeframe): number {
  const days: Record<string, number> = {
    "1W": 7, "1M": 30, "3M": 90, "6M": 180, "YTD": 365, "1Y": 365, "3Y": 1095, "5Y": 1825, "SINCE_INCEPTION": 3650,
  }
  return days[timeframe] || 365
}

function calculateRiskScore(volatility: number | null, maxDD: number, var95: number | null): number {
  let score = 0
  // Volatility contribution (0-40)
  if (volatility != null) {
    if (volatility > 30) score += 40
    else if (volatility > 20) score += 30
    else if (volatility > 10) score += 20
    else score += 10
  }
  // Max drawdown contribution (0-35)
  if (maxDD > 30) score += 35
  else if (maxDD > 20) score += 25
  else if (maxDD > 10) score += 15
  else score += 5
  // VaR contribution (0-25)
  if (var95 != null) {
    const absVar = Math.abs(var95)
    if (absVar > 5) score += 25
    else if (absVar > 3) score += 18
    else if (absVar > 1) score += 10
    else score += 5
  }
  return Math.min(100, score)
}

function buildStressTests(history: any[], dailyReturns: number[]): any[] {
  if (dailyReturns.length < 30) return []

  const minReturn = Math.min(...dailyReturns)
  const maxReturn = Math.max(...dailyReturns)
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const stdDev = Math.sqrt(dailyReturns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / dailyReturns.length)

  return [
    {
      scenario_name: "Worst Historical Day",
      impact_pct: parseFloat(minReturn.toFixed(2)),
      description: "Impact based on the worst single-day return observed in the period.",
    },
    {
      scenario_name: "Best Historical Day",
      impact_pct: parseFloat(maxReturn.toFixed(2)),
      description: "Impact based on the best single-day return observed in the period.",
    },
    {
      scenario_name: "2-Sigma Shock (Down)",
      impact_pct: parseFloat((avgReturn - 2 * stdDev).toFixed(2)),
      description: "Simulated 2 standard deviation negative shock based on historical volatility.",
    },
    {
      scenario_name: "3-Sigma Shock (Down)",
      impact_pct: parseFloat((avgReturn - 3 * stdDev).toFixed(2)),
      description: "Simulated 3 standard deviation negative shock — a rare tail-risk event.",
    },
    {
      scenario_name: "Market Correction (-10%)",
      impact_pct: parseFloat((-10 * (stdDev / (Math.abs(avgReturn) || 1))).toFixed(2)),
      description: "Estimated impact of a 10% market correction, scaled by fund volatility.",
    },
    {
      scenario_name: "Interest Rate +200bps",
      impact_pct: parseFloat((-2 * Math.abs(avgReturn * 30)).toFixed(2)),
      description: "Estimated impact of a 200 basis point interest rate increase.",
    },
  ]
}
