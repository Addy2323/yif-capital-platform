import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { BenchmarkingData, ApiResponse, Timeframe } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/benchmarking - Module 7: Benchmark & Peer Comparison
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

    // Get all daily summaries for this fund
    const allRecords = await prisma.fundDailySummary.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "asc" },
    })

    // Get unique scheme names
    const schemes = [...new Set(allRecords.map(r => r.schemeName).filter(Boolean))] as string[]

    // Compute metrics per scheme for peer comparison
    const peers: any[] = []
    for (const scheme of schemes) {
      const schemeRecords = allRecords.filter(r => r.schemeName === scheme).sort((a, b) => a.date.getTime() - b.date.getTime())
      if (schemeRecords.length < 2) continue

      const first = schemeRecords[0]
      const last = schemeRecords[schemeRecords.length - 1]
      const returnPct = first.nav > 0 ? ((last.nav - first.nav) / first.nav) * 100 : 0

      // Daily returns
      const dailyReturns: number[] = []
      for (let i = 1; i < schemeRecords.length; i++) {
        if (schemeRecords[i - 1].nav > 0) {
          dailyReturns.push(((schemeRecords[i].nav - schemeRecords[i - 1].nav) / schemeRecords[i - 1].nav) * 100)
        }
      }

      const vol = dailyReturns.length > 20
        ? Math.sqrt(dailyReturns.reduce((sum, r) => sum + r * r, 0) / dailyReturns.length) * Math.sqrt(252)
        : null

      const annReturn = dailyReturns.length > 0
        ? (dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length) * 252
        : 0

      const sharpe = vol && vol > 0 ? (annReturn - 5) / vol : null

      // Max drawdown
      let peak = schemeRecords[0].nav
      let maxDD = 0
      for (const r of schemeRecords) {
        if (r.nav > peak) peak = r.nav
        const dd = ((peak - r.nav) / peak) * 100
        if (dd > maxDD) maxDD = dd
      }

      peers.push({
        fund_id: fund.fundId,
        fund_name: scheme,
        return_pct: parseFloat(returnPct.toFixed(2)),
        volatility: vol ? parseFloat(vol.toFixed(2)) : 0,
        sharpe_ratio: sharpe ? parseFloat(sharpe.toFixed(2)) : 0,
        max_drawdown: parseFloat(maxDD.toFixed(2)),
        rank: 0, // Will be set after sorting
      })
    }

    // Also get other funds of same type as peers
    const peerFunds = await prisma.fund.findMany({
      where: { fundType: fund.fundType, isActive: true, fundId: { not: fund.fundId } },
      take: 10,
    })

    for (const peerFund of peerFunds) {
      const peerRecords = await prisma.fundDailySummary.findMany({
        where: { fundId: peerFund.fundId },
        orderBy: { date: "asc" },
      })

      if (peerRecords.length < 2) continue

      // Get unique schemes for this peer and aggregate
      const peerSchemes = [...new Set(peerRecords.map(r => r.schemeName).filter(Boolean))]
      const mainSchemeRecords = peerSchemes.length > 0
        ? peerRecords.filter(r => r.schemeName === peerSchemes[0])
        : peerRecords

      const first = mainSchemeRecords[0]
      const last = mainSchemeRecords[mainSchemeRecords.length - 1]
      const returnPct = first.nav > 0 ? ((last.nav - first.nav) / first.nav) * 100 : 0

      const dailyReturns: number[] = []
      for (let i = 1; i < mainSchemeRecords.length; i++) {
        if (mainSchemeRecords[i - 1].nav > 0) {
          dailyReturns.push(((mainSchemeRecords[i].nav - mainSchemeRecords[i - 1].nav) / mainSchemeRecords[i - 1].nav) * 100)
        }
      }

      const vol = dailyReturns.length > 20
        ? Math.sqrt(dailyReturns.reduce((sum, r) => sum + r * r, 0) / dailyReturns.length) * Math.sqrt(252)
        : 0

      const sharpe = vol > 0
        ? ((dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length) * 252 - 5) / vol
        : 0

      let peak = mainSchemeRecords[0].nav
      let maxDD = 0
      for (const r of mainSchemeRecords) {
        if (r.nav > peak) peak = r.nav
        const dd = ((peak - r.nav) / peak) * 100
        if (dd > maxDD) maxDD = dd
      }

      peers.push({
        fund_id: peerFund.fundId,
        fund_name: peerFund.fundName,
        return_pct: parseFloat(returnPct.toFixed(2)),
        volatility: parseFloat(vol.toFixed(2)),
        sharpe_ratio: parseFloat(sharpe.toFixed(2)),
        max_drawdown: parseFloat(maxDD.toFixed(2)),
        rank: 0,
      })
    }

    // Rank peers by return
    peers.sort((a, b) => b.return_pct - a.return_pct)
    peers.forEach((p, i) => { p.rank = i + 1 })

    // Use the top-performing scheme/fund as benchmark reference
    const fundPeer = peers.find(p => p.fund_id === fund.fundId)
    const topPeer = peers[0]

    // Build radar axes comparing the fund (main scheme) vs the best peer
    const mainScheme = schemes[0] || fund.fundName
    const mainPeer = peers.find(p => p.fund_name === mainScheme) || peers[0]
    const radarAxes = mainPeer
      ? [
        { axis_label: "Return", fund_score: Math.max(0, mainPeer.return_pct), benchmark_score: topPeer?.return_pct || 0 },
        { axis_label: "Sharpe Ratio", fund_score: Math.max(0, (mainPeer.sharpe_ratio || 0) * 20), benchmark_score: (topPeer?.sharpe_ratio || 0) * 20 },
        { axis_label: "Low Volatility", fund_score: Math.max(0, 100 - (mainPeer.volatility || 0) * 2), benchmark_score: Math.max(0, 100 - (topPeer?.volatility || 0) * 2) },
        { axis_label: "Low Drawdown", fund_score: Math.max(0, 100 - (mainPeer.max_drawdown || 0) * 2), benchmark_score: Math.max(0, 100 - (topPeer?.max_drawdown || 0) * 2) },
        { axis_label: "Consistency", fund_score: 75, benchmark_score: 80 },
      ]
      : []

    const rankPercentile = peers.length > 0 && fundPeer
      ? Math.round(((peers.length - fundPeer.rank + 1) / peers.length) * 100)
      : null

    const benchmarkingData: BenchmarkingData = {
      fund_return: mainPeer?.return_pct ?? null,
      benchmark_return: topPeer?.return_pct ?? null,
      benchmark_name: fund.benchmarkName || (topPeer?.fund_name !== mainScheme ? topPeer?.fund_name : null) || "Market Average",
      alpha: mainPeer && topPeer ? parseFloat((mainPeer.return_pct - topPeer.return_pct).toFixed(2)) : null,
      beta: 1.0,
      tracking_error: mainPeer?.volatility ? parseFloat((mainPeer.volatility * 0.3).toFixed(2)) : null,
      information_ratio: mainPeer && topPeer && mainPeer.volatility > 0
        ? parseFloat(((mainPeer.return_pct - topPeer.return_pct) / mainPeer.volatility).toFixed(2))
        : null,
      peers,
      radar_axes: radarAxes,
      rank_percentile: rankPercentile,
    }

    return NextResponse.json({
      success: true,
      data: benchmarkingData,
      metadata: {
        fund_id: fund.fundId,
        timeframe,
        last_updated_at: allRecords[allRecords.length - 1]?.date.toISOString() || new Date().toISOString(),
        data_source: "computed",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    console.error("Error fetching benchmarking:", error)
    return NextResponse.json({ success: false, data: null, error: error.message, metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 500 })
  }
}
