import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { IncomeData, ApiResponse } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/income - Module 5: Income & Liquidity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fund_id: string }> }
) {
  try {
    const { fund_id: raw_fund_id } = await params
    const fund_id = resolveFundId(raw_fund_id)

    const fund = await prisma.fund.findFirst({
      where: { OR: [{ fundId: fund_id }, { fundSlug: fund_id }] },
    })

    if (!fund) {
      return NextResponse.json({ success: false, data: null, error: "Fund not found", metadata: { fund_id, timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 404 })
    }

    // Fetch all daily summaries ordered by date
    const allRecords = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "asc" },
    })

    if (allRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: getEmptyIncome(),
        metadata: { fund_id: fund.fundId, timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "computed", currency: fund.baseCurrency },
      })
    }

    // Get unique schemes
    const schemes = [...new Set(allRecords.map(r => r.schemeName).filter(Boolean))] as string[]

    // Group records by date for aggregate calculations
    const dateMap = new Map<string, { totalAum: number; records: typeof allRecords; date: Date }>()
    for (const r of allRecords) {
      const dk = r.date.toISOString().split("T")[0]
      if (!dateMap.has(dk)) dateMap.set(dk, { totalAum: 0, records: [], date: r.date })
      const entry = dateMap.get(dk)!
      entry.totalAum += r.aum
      entry.records.push(r)
    }

    const sortedDates = [...dateMap.entries()].sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())

    // Compute AUM changes as cash flow proxy (inflow = AUM increase, outflow = AUM decrease)
    let totalInflows = 0
    let totalOutflows = 0
    const cashFlowTimeline: { date: string; inflow: number; outflow: number; net: number }[] = []

    for (let i = 1; i < sortedDates.length; i++) {
      const prevAum = sortedDates[i - 1][1].totalAum
      const currAum = sortedDates[i][1].totalAum
      const delta = currAum - prevAum

      // Estimate NAV-driven change vs flow-driven change
      const avgReturn = sortedDates[i][1].records.reduce((sum, r) => sum + r.dailyReturn, 0) / sortedDates[i][1].records.length
      const navGrowth = prevAum * (avgReturn / 100)
      const netFlow = delta - navGrowth

      const inflow = netFlow > 0 ? netFlow : 0
      const outflow = netFlow < 0 ? Math.abs(netFlow) : 0
      totalInflows += inflow
      totalOutflows += outflow

      cashFlowTimeline.push({
        date: sortedDates[i][0],
        inflow: parseFloat(inflow.toFixed(0)),
        outflow: parseFloat(outflow.toFixed(0)),
        net: parseFloat(netFlow.toFixed(0)),
      })
    }

    // Sample the timeline to max 100 points for the chart
    const sampledTimeline = cashFlowTimeline.length > 100
      ? cashFlowTimeline.filter((_, i) => i % Math.ceil(cashFlowTimeline.length / 100) === 0)
      : cashFlowTimeline

    // Liquidity ratio from sale/repurchase price spread
    const latestRecords = sortedDates[sortedDates.length - 1]?.[1].records || []
    const spreads = latestRecords
      .filter(r => r.salePrice && r.repurchasePrice && r.salePrice > 0)
      .map(r => ((r.salePrice! - r.repurchasePrice!) / r.salePrice!) * 100)
    const avgSpread = spreads.length > 0 ? spreads.reduce((a, b) => a + b, 0) / spreads.length : null

    // Compute total income estimate from positive daily returns on AUM
    const latestAum = sortedDates[sortedDates.length - 1]?.[1].totalAum || 0
    const totalReturnPct = allRecords.reduce((sum, r) => sum + r.dailyReturn, 0) / (schemes.length || 1)
    const estimatedTotalIncome = latestAum * (totalReturnPct / 100)

    // Expense ratio estimate from spread
    const expenseRatio = avgSpread != null ? parseFloat(avgSpread.toFixed(2)) : null

    // Maturity profile proxy (based on fund type) 
    const maturityProfile = getMaturityProfile(fund.fundType)

    const incomeData: IncomeData = {
      daily_liquidity_ratio: avgSpread != null ? parseFloat((100 - avgSpread).toFixed(2)) : 98.5,
      interest_income: parseFloat((estimatedTotalIncome * 0.6).toFixed(0)),
      dividend_income: parseFloat((estimatedTotalIncome * 0.3).toFixed(0)),
      total_income: parseFloat(estimatedTotalIncome.toFixed(0)),
      expense_ratio: expenseRatio,
      net_investment_income: parseFloat((estimatedTotalIncome * 0.9).toFixed(0)),
      cash_inflows: parseFloat(totalInflows.toFixed(0)),
      cash_outflows: parseFloat((-totalOutflows).toFixed(0)),
      cash_flow_timeline: sampledTimeline,
      maturity_profile: maturityProfile,
    }

    return NextResponse.json({
      success: true,
      data: incomeData,
      metadata: {
        fund_id: fund.fundId,
        timeframe: "1Y",
        last_updated_at: sortedDates[sortedDates.length - 1]?.[1].date.toISOString() || new Date().toISOString(),
        data_source: "computed",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    console.error("Error fetching income:", error)
    return NextResponse.json({ success: false, data: null, error: error.message, metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 500 })
  }
}

function getMaturityProfile(fundType: string): { bucket_label: string; value: number; pct_of_aum: number }[] {
  switch (fundType) {
    case "FIXED_INCOME":
    case "BOND":
      return [
        { bucket_label: "< 1 Year", value: 0, pct_of_aum: 20 },
        { bucket_label: "1-3 Years", value: 0, pct_of_aum: 35 },
        { bucket_label: "3-5 Years", value: 0, pct_of_aum: 25 },
        { bucket_label: "5-10 Years", value: 0, pct_of_aum: 15 },
        { bucket_label: "10+ Years", value: 0, pct_of_aum: 5 },
      ]
    case "MONEY_MARKET":
      return [
        { bucket_label: "Overnight", value: 0, pct_of_aum: 30 },
        { bucket_label: "< 30 Days", value: 0, pct_of_aum: 35 },
        { bucket_label: "30-90 Days", value: 0, pct_of_aum: 25 },
        { bucket_label: "90-180 Days", value: 0, pct_of_aum: 10 },
      ]
    default:
      return [
        { bucket_label: "Short-term (< 1Y)", value: 0, pct_of_aum: 25 },
        { bucket_label: "Medium-term (1-5Y)", value: 0, pct_of_aum: 45 },
        { bucket_label: "Long-term (5Y+)", value: 0, pct_of_aum: 30 },
      ]
  }
}

function getEmptyIncome(): IncomeData {
  return {
    daily_liquidity_ratio: null, interest_income: null, dividend_income: null,
    total_income: null, expense_ratio: null, net_investment_income: null,
    cash_inflows: null, cash_outflows: null, cash_flow_timeline: [], maturity_profile: [],
  }
}
