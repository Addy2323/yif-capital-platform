import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { ComplianceData, ApiResponse, ComplianceStatus } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/compliance - Module 8: Compliance & Policy Monitoring
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

    // Fetch daily summaries
    const allRecords = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "asc" },
    })

    if (allRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: { overall_status: "COMPLIANT" as ComplianceStatus, green_count: 0, amber_count: 0, red_count: 0, checks: [] },
        metadata: { fund_id: fund.fundId, timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "computed", currency: fund.baseCurrency },
      })
    }

    // Get latest date records
    const latestDate = allRecords[allRecords.length - 1].date
    const latestRecords = allRecords.filter(r => r.date.getTime() === latestDate.getTime())
    const totalAum = latestRecords.reduce((sum, r) => sum + r.aum, 0)

    // Scheme names
    const schemes = [...new Set(allRecords.map(r => r.schemeName).filter(Boolean))] as string[]

    // --- Build compliance checks from real data ---
    const checks: any[] = []
    const now = new Date().toISOString()

    // 1. Concentration Risk: largest scheme AUM as % of total
    if (schemes.length > 1) {
      const largestScheme = latestRecords.sort((a, b) => b.aum - a.aum)[0]
      const concentrationPct = totalAum > 0 ? (largestScheme.aum / totalAum) * 100 : 0
      const concentrationStatus = concentrationPct > 50 ? "amber" : concentrationPct > 70 ? "red" : "green"
      checks.push({
        rule_name: "Single Fund Concentration",
        rule_type: "mandate",
        current_value: `${concentrationPct.toFixed(1)}%`,
        limit_value: "50%",
        format: "percent",
        status: concentrationStatus,
        last_checked_at: now,
        breach_history: [],
        description: `${largestScheme.schemeName} is ${concentrationPct.toFixed(1)}% of total AUM`,
      })
    }

    // 2. NAV Stability: max daily NAV change in last 30 days
    const last30 = allRecords.slice(-30 * (schemes.length || 1))
    let maxNavChange = 0
    for (const r of last30) {
      maxNavChange = Math.max(maxNavChange, Math.abs(r.dailyReturn))
    }
    const navStabilityStatus = maxNavChange > 5 ? "red" : maxNavChange > 3 ? "amber" : "green"
    checks.push({
      rule_name: "NAV Stability (30D)",
      rule_type: "regulatory",
      current_value: `${maxNavChange.toFixed(2)}%`,
      limit_value: "5%",
      format: "percent",
      status: navStabilityStatus,
      last_checked_at: now,
      breach_history: [],
      description: `Maximum single-day NAV change in last 30 days: ${maxNavChange.toFixed(2)}%`,
    })

    // 3. Sale/Repurchase Price Spread (liquidity/fairness check)
    const spreads = latestRecords
      .filter(r => r.salePrice && r.repurchasePrice && r.salePrice > 0)
      .map(r => ((r.salePrice! - r.repurchasePrice!) / r.salePrice!) * 100)
    const avgSpread = spreads.length > 0 ? spreads.reduce((a, b) => a + b, 0) / spreads.length : 0
    const spreadStatus = avgSpread > 5 ? "red" : avgSpread > 2 ? "amber" : "green"
    checks.push({
      rule_name: "Bid-Ask Spread",
      rule_type: "regulatory",
      current_value: `${avgSpread.toFixed(2)}%`,
      limit_value: "5%",
      format: "percent",
      status: spreadStatus,
      last_checked_at: now,
      breach_history: [],
      description: `Average spread between sale and repurchase price: ${avgSpread.toFixed(2)}%`,
    })

    // 4. Data Freshness: how old is the latest data point?
    const daysSinceUpdate = Math.floor((Date.now() - latestDate.getTime()) / 86400000)
    const freshnessStatus = daysSinceUpdate > 7 ? "red" : daysSinceUpdate > 3 ? "amber" : "green"
    checks.push({
      rule_name: "Data Freshness",
      rule_type: "operational",
      current_value: `${daysSinceUpdate} days`,
      limit_value: "3 days",
      format: "days",
      status: freshnessStatus,
      last_checked_at: now,
      breach_history: [],
      description: `Last data update: ${latestDate.toISOString().split("T")[0]} (${daysSinceUpdate} days ago)`,
    })

    // 5. AUM Size Check
    const minAum = 1_000_000_000 // TZS 1 billion minimum
    const aumStatus = totalAum < minAum ? "amber" : "green"
    checks.push({
      rule_name: "Minimum Fund Size",
      rule_type: "regulatory",
      current_value: formatTZS(totalAum),
      limit_value: formatTZS(minAum),
      format: "currency",
      status: aumStatus,
      last_checked_at: now,
      breach_history: [],
      description: `Fund total AUM: ${formatTZS(totalAum)}`,
    })

    // 6. Volatility Limit
    const dailyReturns = last30.map(r => r.dailyReturn).filter(r => r !== 0)
    const annVol = dailyReturns.length > 5
      ? Math.sqrt(dailyReturns.reduce((sum, r) => sum + r * r, 0) / dailyReturns.length) * Math.sqrt(252)
      : 0
    const volStatus = annVol > 25 ? "red" : annVol > 15 ? "amber" : "green"
    checks.push({
      rule_name: "Annualized Volatility",
      rule_type: "mandate",
      current_value: `${annVol.toFixed(2)}%`,
      limit_value: "25%",
      format: "percent",
      status: volStatus,
      last_checked_at: now,
      breach_history: [],
      description: `Rolling 30-day annualized volatility: ${annVol.toFixed(2)}%`,
    })

    // 7. Drawdown Limit
    let peak = 0
    let maxDD = 0
    const mainRecords = schemes.length > 0 ? allRecords.filter(r => r.schemeName === schemes[0]) : allRecords
    for (const r of mainRecords) {
      if (r.nav > peak) peak = r.nav
      const dd = peak > 0 ? ((peak - r.nav) / peak) * 100 : 0
      if (dd > maxDD) maxDD = dd
    }
    const ddStatus = maxDD > 20 ? "red" : maxDD > 10 ? "amber" : "green"
    checks.push({
      rule_name: "Maximum Drawdown",
      rule_type: "mandate",
      current_value: `${maxDD.toFixed(2)}%`,
      limit_value: "20%",
      format: "percent",
      status: ddStatus,
      last_checked_at: now,
      breach_history: [],
      description: `Maximum peak-to-trough drawdown: ${maxDD.toFixed(2)}%`,
    })

    // Count statuses
    const greenCount = checks.filter(c => c.status === "green").length
    const amberCount = checks.filter(c => c.status === "amber").length
    const redCount = checks.filter(c => c.status === "red").length

    const overallStatus: ComplianceStatus = redCount > 0 ? "BREACH" : amberCount > 0 ? "WATCH" : "COMPLIANT"

    const complianceData: ComplianceData = {
      overall_status: overallStatus,
      green_count: greenCount,
      amber_count: amberCount,
      red_count: redCount,
      checks,
    }

    return NextResponse.json({
      success: true,
      data: complianceData,
      metadata: {
        fund_id: fund.fundId,
        timeframe: "1Y",
        last_updated_at: latestDate.toISOString(),
        data_source: "computed",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    console.error("Error fetching compliance:", error)
    return NextResponse.json({ success: false, data: null, error: error.message, metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 500 })
  }
}

function formatTZS(amount: number): string {
  if (amount >= 1_000_000_000_000) return `TZS ${(amount / 1_000_000_000_000).toFixed(1)}T`
  if (amount >= 1_000_000_000) return `TZS ${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `TZS ${(amount / 1_000_000).toFixed(1)}M`
  return `TZS ${amount.toFixed(0)}`
}
