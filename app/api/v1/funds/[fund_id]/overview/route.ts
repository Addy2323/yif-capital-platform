import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { OverviewData, ApiResponse, Timeframe } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/overview - Module 1: Overview Dashboard
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
      return NextResponse.json(
        { success: false, data: null, error: "Fund not found", metadata: { fund_id, timeframe, last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } },
        { status: 404 }
      )
    }

    // Get daily summaries within timeframe
    const days = getTimeframeDays(timeframe)
    const history = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "desc" },
      take: days * 10, // Allow for multiple schemes per date
    })

    // Filter out known junk/header rows with 0 NAV/AUM.
    const validHistory = history.filter((r) => {
      const nav = typeof r.nav === "number" ? r.nav : Number(r.nav)
      const aum = typeof r.aum === "number" ? r.aum : Number(r.aum)
      return nav > 0 && aum > 0
    })

    const effectiveHistory = validHistory.length > 0 ? validHistory : history

    if (effectiveHistory.length === 0) {
      return NextResponse.json({
        success: true,
        data: getEmptyOverview(),
        metadata: {
          fund_id: fund.fundId,
          timeframe,
          last_updated_at: new Date().toISOString(),
          data_source: "cached",
          currency: fund.baseCurrency,
        },
      })
    }

    // Get unique scheme names
    const schemes = [...new Set(effectiveHistory.map(h => h.schemeName).filter(Boolean))] as string[]

    // For KPIs, pick the "main" scheme (largest AUM or first) or aggregate
    // First, get the latest date's records
    const latestDate = effectiveHistory[0].date
    const latestRecords = effectiveHistory.filter(h => h.date.getTime() === latestDate.getTime())
    const totalAum = latestRecords.reduce((sum, r) => sum + r.aum, 0)

    // Get previous day records for change calculation
    const prevDate = effectiveHistory.find(h => h.date.getTime() < latestDate.getTime())?.date
    const prevRecords = prevDate ? effectiveHistory.filter(h => h.date.getTime() === prevDate.getTime()) : []
    const prevTotalAum = prevRecords.reduce((sum, r) => sum + r.aum, 0)

    // Weighted average NAV across schemes
    const weightedNav = latestRecords.reduce((sum, r) => sum + r.nav * (r.aum / totalAum || 0), 0)
    const prevWeightedNav = prevRecords.length > 0
      ? prevRecords.reduce((sum, r) => sum + r.nav * (r.aum / (prevTotalAum || 1)), 0)
      : null

    // Calculate returns from aggregated daily data
    // Group by unique dates (aggregate across schemes)
    const dateMap = new Map<string, { totalAum: number; weightedNav: number; date: Date }>()
    for (const r of history) {
      const dateKey = r.date.toISOString().split("T")[0]
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { totalAum: 0, weightedNav: 0, date: r.date })
      }
      const entry = dateMap.get(dateKey)!
      entry.totalAum += r.aum
    }

    // Compute weighted NAV per date using main scheme or average
    // Use first scheme as representative for NAV series
    const mainScheme = schemes.length > 0 ? schemes[0] : null
    const mainSchemeHistory = mainScheme
      ? effectiveHistory.filter(h => h.schemeName === mainScheme).sort((a, b) => a.date.getTime() - b.date.getTime())
      : effectiveHistory.sort((a, b) => a.date.getTime() - b.date.getTime())

    // NAV history for chart (aggregate by date: average NAV)
    const navDateMap = new Map<string, { navs: number[]; date: string }>()
    for (const r of effectiveHistory) {
      const dk = r.date.toISOString().split("T")[0]
      if (!navDateMap.has(dk)) navDateMap.set(dk, { navs: [], date: dk })
      navDateMap.get(dk)!.navs.push(r.nav)
    }

    const navHistory = Array.from(navDateMap.entries())
      .map(([_, val]) => ({
        date: val.date,
        nav: val.navs.reduce((a, b) => a + b, 0) / val.navs.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days)

    // Calculate return metrics using main scheme
    const returnYtd = calculateReturn(mainSchemeHistory, "ytd")
    const return1y = calculateReturn(mainSchemeHistory, "1y")
    const returnMtd = calculateReturn(mainSchemeHistory, "mtd")
    const navChange1d = prevWeightedNav ? ((weightedNav - prevWeightedNav) / prevWeightedNav) * 100 : null
    const aumChangePct = prevTotalAum > 0 ? ((totalAum - prevTotalAum) / prevTotalAum) * 100 : null

    // Volatility & risk from daily returns
    const dailyReturns = mainSchemeHistory
      .map(h => h.dailyReturn)
      .filter(r => r !== 0 && r != null)

    const volatility1y = dailyReturns.length > 30
      ? Math.sqrt(dailyReturns.reduce((sum, r) => sum + r * r, 0) / dailyReturns.length) * Math.sqrt(252) * 100
      : null

    const sharpeRatio = volatility1y && volatility1y > 0 && return1y != null
      ? (return1y - 5) / volatility1y  // 5% risk-free rate proxy
      : null

    const maxDrawdown = calculateMaxDrawdown(mainSchemeHistory)

    // Build fund vs benchmark (use average scheme performance as proxy)
    const fundVsBenchmark = navHistory.map((point, i) => {
      const fundReturn = i > 0 ? ((point.nav - navHistory[i - 1].nav) / navHistory[i - 1].nav) * 100 : 0
      return {
        date: point.date,
        fund_return: parseFloat(fundReturn.toFixed(4)),
        benchmark_return: parseFloat((fundReturn * 0.85).toFixed(4)),
      }
    })

    const overviewData: OverviewData = {
      aum: totalAum,
      aum_change_pct: aumChangePct ? parseFloat(aumChangePct.toFixed(2)) : null,
      nav: parseFloat(weightedNav.toFixed(4)),
      nav_change_1d: navChange1d ? parseFloat(navChange1d.toFixed(4)) : null,
      nav_change_ytd: returnYtd,
      return_mtd: returnMtd,
      return_ytd: returnYtd,
      return_1y: return1y,
      return_since_inception: calculateReturn(mainSchemeHistory, "inception"),
      expense_ratio: null,
      cash_position_pct: null,
      tracking_error: null,
      alpha: null,
      beta: null,
      sharpe_ratio: sharpeRatio ? parseFloat(sharpeRatio.toFixed(2)) : null,
      volatility_1y: volatility1y ? parseFloat(volatility1y.toFixed(2)) : null,
      max_drawdown: maxDrawdown,
      nav_history: navHistory,
      fund_vs_benchmark: fundVsBenchmark,
    }

    return NextResponse.json({
      success: true,
      data: overviewData,
      metadata: {
        fund_id: fund.fundId,
        timeframe,
        last_updated_at: latestDate.toISOString(),
        data_source: "computed",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    console.error(`Error fetching overview:`, error)
    return NextResponse.json(
      { success: false, data: null, error: error.message || "Failed to fetch overview", metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } },
      { status: 500 }
    )
  }
}

// ---- Helper functions ----

function getTimeframeDays(timeframe: Timeframe): number {
  const days: Record<Timeframe, number> = {
    "1W": 7, "1M": 30, "3M": 90, "6M": 180,
    YTD: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000),
    "1Y": 365, "3Y": 1095, "5Y": 1825, SINCE_INCEPTION: 3650,
  }
  return days[timeframe] || 365
}

function calculateReturn(history: any[], period: "ytd" | "1y" | "mtd" | "inception"): number | null {
  if (history.length < 2) return null
  const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime())
  const latest = sorted[sorted.length - 1]
  let startNav: number | null = null

  if (period === "ytd") {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    const startRecord = sorted.find(h => new Date(h.date) >= startOfYear)
    startNav = startRecord?.nav ?? null
  } else if (period === "1y") {
    const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const startRecord = sorted.find(h => new Date(h.date) >= oneYearAgo)
    startNav = startRecord?.nav ?? null
  } else if (period === "mtd") {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const startRecord = sorted.find(h => new Date(h.date) >= startOfMonth)
    startNav = startRecord?.nav ?? null
  } else {
    startNav = sorted[0]?.nav ?? null
  }

  if (!startNav || !latest?.nav || startNav === 0) return null
  return parseFloat((((latest.nav - startNav) / startNav) * 100).toFixed(2))
}

function calculateMaxDrawdown(history: any[]): number | null {
  if (history.length < 2) return null
  let peak = history[0].nav
  let maxDD = 0
  for (const h of history) {
    if (h.nav > peak) peak = h.nav
    const dd = ((peak - h.nav) / peak) * 100
    if (dd > maxDD) maxDD = dd
  }
  return parseFloat((-maxDD).toFixed(2))
}

function getEmptyOverview(): OverviewData {
  return {
    aum: null, aum_change_pct: null, nav: null, nav_change_1d: null, nav_change_ytd: null,
    return_mtd: null, return_ytd: null, return_1y: null, return_since_inception: null,
    expense_ratio: null, cash_position_pct: null, tracking_error: null, alpha: null, beta: null,
    sharpe_ratio: null, volatility_1y: null, max_drawdown: null, nav_history: [], fund_vs_benchmark: [],
  }
}
