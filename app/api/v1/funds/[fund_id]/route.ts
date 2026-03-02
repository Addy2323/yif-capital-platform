import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { Fund, ApiResponse } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id] - Get single fund details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fund_id: string }> }
) {
  try {
    const { fund_id: raw_fund_id } = await params
    const fund_id = resolveFundId(raw_fund_id)

    // Find fund by fundId or fundSlug
    const fund = await prisma.fund.findFirst({
      where: {
        OR: [{ fundId: fund_id }, { fundSlug: fund_id }],
        isActive: true,
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
            timeframe: "1Y",
            last_updated_at: new Date().toISOString(),
            data_source: "cached",
            currency: "TZS",
          },
        },
        { status: 404 }
      )
    }

    // Get latest summary
    const latestSummary = await prisma.fundDailySummary.findFirst({
      where: { fundId: fund.fundId },
      orderBy: { date: "desc" },
    })

    // Get previous summary for change calculation
    const previousSummary = await prisma.fundDailySummary.findFirst({
      where: {
        fundId: fund.fundId,
        date: { lt: latestSummary?.date || new Date() },
      },
      orderBy: { date: "desc" },
    })

    const responseFund: Fund = {
      fund_id: fund.fundId,
      fund_slug: fund.fundSlug,
      fund_name: fund.fundName,
      fund_type: fund.fundType.toLowerCase() as any,
      manager_name: fund.managerName,
      manager_id: fund.managerId || undefined,
      description: fund.description,
      logo_url: fund.logoUrl || undefined,
      inception_date: fund.inceptionDate.toISOString().split("T")[0],
      base_currency: fund.baseCurrency,
      benchmark_id: fund.benchmarkId || undefined,
      benchmark_name: fund.benchmarkName || undefined,
      is_active: fund.isActive,
      current_nav: latestSummary?.nav || null,
      nav_change_1d:
        latestSummary && previousSummary
          ? ((latestSummary.nav - previousSummary.nav) / previousSummary.nav) *
          100
          : null,
      aum: latestSummary?.aum || null,
      volatility: latestSummary?.volatility || null,
      date: latestSummary?.date.toISOString().split("T")[0] || undefined,
    }

    const response: ApiResponse<Fund> = {
      success: true,
      data: responseFund,
      metadata: {
        fund_id: fund.fundId,
        timeframe: "1Y",
        last_updated_at: latestSummary?.date.toISOString() || new Date().toISOString(),
        data_source: "cached",
        currency: fund.baseCurrency,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`Error fetching fund:`, error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error.message || "Failed to fetch fund",
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
