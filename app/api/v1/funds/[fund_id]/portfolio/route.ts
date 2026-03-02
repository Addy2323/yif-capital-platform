import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { PortfolioData, ApiResponse } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/portfolio - Module 3: Portfolio Composition
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

    // Fetch all daily summaries
    const allRecords = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "desc" },
    })

    if (allRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: { asset_allocation: [], sector_allocation: [], geo_allocation: [], market_cap_exposure: [], top_holdings: [], total_holdings: 0 },
        metadata: { fund_id: fund.fundId, timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "computed", currency: fund.baseCurrency },
      })
    }

    // Get latest date records
    const latestDate = allRecords[0].date
    const latestRecords = allRecords.filter(r => r.date.getTime() === latestDate.getTime())
    const totalAum = latestRecords.reduce((sum, r) => sum + r.aum, 0)

    // Get unique schemes
    const schemes = [...new Set(allRecords.map(r => r.schemeName).filter(Boolean))] as string[]

    // Build asset allocation from scheme AUM proportions
    const schemeColors = ["#06d6a0", "#7c3aed", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"]
    const assetAllocation = latestRecords
      .filter(r => r.schemeName)
      .map((r, i) => ({
        label: r.schemeName || "Unknown",
        pct: totalAum > 0 ? parseFloat(((r.aum / totalAum) * 100).toFixed(2)) : 0,
        color: schemeColors[i % schemeColors.length],
      }))
      .sort((a, b) => b.pct - a.pct)

    // For single-scheme funds, create a type-based allocation
    const sectorAllocation = schemes.length > 1
      ? assetAllocation.map(a => ({ label: a.label, pct: a.pct }))
      : [{ label: fund.fundType.replace(/_/g, " "), pct: 100 }]

    // Geographic allocation (all Tanzania for UTT AMIS)
    const geoAllocation = [
      { country: "Tanzania", pct: 100 },
    ]

    // Market cap exposure proxy from fund type
    const marketCapExposure = getMarketCapFromFundType(fund.fundType)

    // Top "holdings" = sub-funds/schemes with their current data
    const topHoldings = latestRecords
      .filter(r => r.schemeName)
      .map(r => ({
        name: r.schemeName || "Main Fund",
        asset_type: getFundAssetType(r.schemeName || "", fund.fundType),
        weight_pct: totalAum > 0 ? parseFloat(((r.aum / totalAum) * 100).toFixed(2)) : 0,
        value: r.aum,
        change_pct: r.dailyReturn || 0,
        isin: undefined,
        sector: fund.fundType.replace(/_/g, " "),
      }))
      .sort((a, b) => b.weight_pct - a.weight_pct)

    // If single-scheme fund, create a single holding entry
    const finalHoldings = topHoldings.length > 0
      ? topHoldings
      : [{
        name: fund.fundName,
        asset_type: fund.fundType.replace(/_/g, " "),
        weight_pct: 100,
        value: totalAum,
        change_pct: latestRecords[0]?.dailyReturn || 0,
        isin: undefined,
        sector: fund.fundType.replace(/_/g, " "),
      }]

    const portfolioData: PortfolioData = {
      asset_allocation: assetAllocation,
      sector_allocation: sectorAllocation,
      geo_allocation: geoAllocation,
      market_cap_exposure: marketCapExposure,
      top_holdings: finalHoldings,
      total_holdings: finalHoldings.length,
    }

    return NextResponse.json({
      success: true,
      data: portfolioData,
      metadata: {
        fund_id: fund.fundId,
        timeframe: "1Y",
        last_updated_at: latestDate.toISOString(),
        data_source: "computed",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ success: false, data: null, error: error.message, metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 500 })
  }
}

function getFundAssetType(schemeName: string, fundType: string): string {
  const name = schemeName.toLowerCase()
  if (name.includes("bond")) return "Fixed Income"
  if (name.includes("liquid")) return "Money Market"
  if (name.includes("jikimu")) return "Balanced"
  if (name.includes("umoja")) return "Balanced"
  if (name.includes("wekeza") || name.includes("maisha")) return "Growth"
  if (name.includes("watoto")) return "Education"
  return fundType.replace(/_/g, " ")
}

function getMarketCapFromFundType(fundType: string): { label: string; pct: number }[] {
  switch (fundType) {
    case "BALANCED":
    case "FUND_FAMILY":
      return [
        { label: "Large Cap", pct: 45 },
        { label: "Mid Cap", pct: 30 },
        { label: "Small Cap", pct: 10 },
        { label: "Fixed Income", pct: 15 },
      ]
    case "FIXED_INCOME":
    case "BOND":
      return [
        { label: "Government Bonds", pct: 55 },
        { label: "Corporate Bonds", pct: 30 },
        { label: "Money Market", pct: 15 },
      ]
    case "MONEY_MARKET":
      return [
        { label: "Treasury Bills", pct: 50 },
        { label: "Commercial Paper", pct: 25 },
        { label: "Bank Deposits", pct: 25 },
      ]
    case "EQUITY":
      return [
        { label: "Large Cap", pct: 55 },
        { label: "Mid Cap", pct: 30 },
        { label: "Small Cap", pct: 15 },
      ]
    default:
      return [
        { label: "Mixed Assets", pct: 60 },
        { label: "Fixed Income", pct: 25 },
        { label: "Cash", pct: 15 },
      ]
  }
}
