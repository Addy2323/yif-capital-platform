import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { PerformanceData, ApiResponse, Timeframe } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/performance - Module 2: Performance Analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fund_id: string }> }
) {
  try {
    const { fund_id: raw_fund_id } = await params
    const fund_id = resolveFundId(raw_fund_id)
    const { searchParams } = new URL(request.url)
    const timeframe = (searchParams.get("timeframe") || "1Y") as Timeframe

    // Find fund
    const fund = await prisma.fund.findFirst({
      where: {
        OR: [{ fundId: fund_id }, { fundSlug: fund_id }],
      },
    })

    if (!fund) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Fund not found",
          metadata: {
            fund_id,
            timeframe,
            last_updated_at: new Date().toISOString(),
            data_source: "cached",
            currency: "TZS",
          },
        },
        { status: 404 }
      )
    }

    // Get historical data
    const rawHistory = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "asc" },
    })

    if (rawHistory.length === 0) {
      return NextResponse.json({
        success: true,
        data: getEmptyPerformance(),
        metadata: { fund_id: fund.fundId, timeframe, last_updated_at: new Date().toISOString(), data_source: "computed", currency: fund.baseCurrency },
      })
    }

    // Pick the "main" scheme (largest AUM on the latest date)
    const latestDate = rawHistory[rawHistory.length - 1].date
    const latestRecords = rawHistory.filter(r => r.date.getTime() === latestDate.getTime())
    const mainScheme = latestRecords.sort((a, b) => b.aum - a.aum)[0]?.schemeName

    const history = mainScheme
      ? rawHistory.filter(r => r.schemeName === mainScheme).slice(-getTimeframeDays(timeframe))
      : rawHistory.slice(-getTimeframeDays(timeframe))

    // Calculate performance metrics
    const performanceData: PerformanceData & { multi_series_returns?: any[] } = {
      return_absolute: calculateAbsoluteReturn(history),
      cagr: calculateCAGR(history, fund.inceptionDate),
      rolling_3m: calculateRollingReturn(history, 90),
      rolling_6m: calculateRollingReturn(history, 180),
      rolling_1y: calculateRollingReturn(history, 365),
      alpha: null,
      beta: null,
      sharpe_ratio: calculateSharpeRatio(history),
      sortino_ratio: calculateSortinoRatio(history),
      volatility: calculateVolatility(history),
      cumulative_returns: calculateCumulativeReturns(history),
      rolling_returns_heatmap: generateHeatmapData(history),
      risk_return_scatter: [],
    }

    // Add multi-series returns for all schemes
    performanceData.multi_series_returns = calculateMultiSeriesReturns(rawHistory, getTimeframeDays(timeframe))

    const response: ApiResponse<PerformanceData & { multi_series_returns?: any[] }> = {
      success: true,
      data: performanceData,
      metadata: {
        fund_id: fund.fundId,
        timeframe,
        last_updated_at: history[history.length - 1]?.date.toISOString() || new Date().toISOString(),
        data_source: "cached",
        currency: fund.baseCurrency,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`Error fetching performance:`, error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error.message || "Failed to fetch performance data",
        metadata: {
          fund_id: "",
          timeframe: "1Y",
          last_updated_at: new Date().toISOString(),
          data_source: "cached",
          currency: "TZS",
        },
      },
      { status: 500 }
    )
  }
}

function calculateMultiSeriesReturns(rawHistory: any[], days: number): any[] {
  // Group by date
  const byDate = new Map<string, Map<string, number>>()
  const allSchemes = new Set<string>()
  const allDates = new Set<string>()

  // Filter for the requested timeframe
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const history = rawHistory.filter(h => h.date >= cutoffDate)

  history.forEach(h => {
    const d = h.date.toISOString().split("T")[0]
    allDates.add(d)
    allSchemes.add(h.schemeName)
    if (!byDate.has(d)) byDate.set(d, new Map())
    byDate.get(d)!.set(h.schemeName, Number(h.nav))
  })

  const sortedDates = Array.from(allDates).sort()
  const firstNav = new Map<string, number>()

  // Find base NAV for each scheme
  for (const date of sortedDates) {
    const dateData = byDate.get(date)
    if (!dateData) continue
    for (const scheme of allSchemes) {
      if (!firstNav.has(scheme) && dateData.has(scheme)) {
        firstNav.set(scheme, dateData.get(scheme)!)
      }
    }
  }

  // Build series
  return sortedDates.map(date => {
    const point: any = { date }
    const dateData = byDate.get(date)!
    allSchemes.forEach(scheme => {
      const current = dateData.get(scheme)
      const base = firstNav.get(scheme)
      if (current !== undefined) {
        // Performance = Raw NAV Per Unit
        // TEST INJECTION: Add 10000 to Umoja Fund to see if it shows up in chart
        point[scheme] = scheme === "Umoja Fund" ? current + 10000 : current
      }
    })
    return point
  })
}

// Helper functions
function getTimeframeDays(timeframe: Timeframe): number {
  const days: Record<Timeframe, number> = {
    "1W": 7, "1M": 30, "3M": 90, "6M": 180,
    YTD: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
    "1Y": 365, "3Y": 1095, "5Y": 1825, SINCE_INCEPTION: 3650,
  }
  return days[timeframe] || 365
}

function calculateAbsoluteReturn(history: any[]): number | null {
  if (history.length < 2) return null
  const first = history[0].nav
  const last = history[history.length - 1].nav
  return ((last - first) / first) * 100
}

function calculateCAGR(history: any[], inceptionDate: Date): number | null {
  if (history.length < 2) return null
  const first = history[0].nav
  const last = history[history.length - 1].nav
  const years = (history[history.length - 1].date - history[0].date) / (365 * 24 * 60 * 60 * 1000)
  if (years <= 0) return null
  return (Math.pow(last / first, 1 / years) - 1) * 100
}

function calculateRollingReturn(history: any[], days: number): number | null {
  if (history.length < days) return null
  const recent = history.slice(-days)
  const first = recent[0].nav
  const last = recent[recent.length - 1].nav
  return ((last - first) / first) * 100
}

function calculateSharpeRatio(history: any[]): number | null {
  if (history.length < 30) return null
  const returns = calculateDailyReturns(history)
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
  if (volatility === 0) return null
  return (avgReturn * 252) / (volatility * Math.sqrt(252))
}

function calculateSortinoRatio(history: any[]): number | null {
  if (history.length < 30) return null
  const returns = calculateDailyReturns(history)
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const negativeReturns = returns.filter(r => r < 0)
  if (negativeReturns.length === 0) return null
  const downsideDev = Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
  if (downsideDev === 0) return null
  return (avgReturn * 252) / (downsideDev * Math.sqrt(252))
}

function calculateVolatility(history: any[]): number | null {
  if (history.length < 30) return null
  const returns = calculateDailyReturns(history)
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  return Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) * Math.sqrt(252) * 100
}

function calculateDailyReturns(history: any[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].nav
    const curr = history[i].nav
    returns.push((curr - prev) / prev)
  }
  return returns
}

function calculateCumulativeReturns(history: any[]): any[] {
  if (history.length < 2) return []
  const baseNav = history[0].nav
  return history.map((h, i) => ({
    date: h.date.toISOString().split("T")[0],
    cumulative_return_pct: ((h.nav - baseNav) / baseNav) * 100,
  }))
}

function generateHeatmapData(history: any[]): any[] {
  // Generate monthly return data for heatmap
  const monthlyData: Map<string, number[]> = new Map()

  history.forEach(h => {
    const date = new Date(h.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData.has(key)) monthlyData.set(key, [])
    monthlyData.get(key)!.push(h.nav)
  })

  const heatmap: any[] = []
  const entries = Array.from(monthlyData.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  entries.forEach(([key, navs]) => {
    if (navs.length > 1) {
      const [year, month] = key.split('-')
      const returnPct = ((navs[navs.length - 1] - navs[0]) / navs[0]) * 100
      heatmap.push({
        year: parseInt(year),
        month: parseInt(month),
        return_pct: returnPct,
      })
    }
  })

  return heatmap
}

function getEmptyPerformance(): PerformanceData {
  return {
    return_absolute: null,
    cagr: null,
    rolling_3m: null,
    rolling_6m: null,
    rolling_1y: null,
    alpha: null,
    beta: null,
    sharpe_ratio: null,
    sortino_ratio: null,
    volatility: null,
    cumulative_returns: [],
    rolling_returns_heatmap: [],
    risk_return_scatter: [],
  }
}
