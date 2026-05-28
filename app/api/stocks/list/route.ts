import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { dseStocks } from "@/lib/market-data"

export async function GET() {
  try {
    let stocks = await prisma.stock.findMany({
      select: { symbol: true, name: true },
      orderBy: { symbol: "asc" },
    })

    // Fallback 1: legacy DseStock table
    if (stocks.length === 0) {
      const latestScrape = await (prisma as any).dseStock.findFirst({
        orderBy: { scrapedAt: "desc" },
        select: { scrapedAt: true },
      })

      if (latestScrape) {
        const legacyStocks = await (prisma as any).dseStock.findMany({
          where: { scrapedAt: latestScrape.scrapedAt },
          select: { symbol: true, name: true },
          distinct: ["symbol"],
          orderBy: { symbol: "asc" },
        })
        stocks = legacyStocks.map((s: any) => ({
          symbol: s.symbol,
          name: s.name || s.symbol,
        })) as any[]
      }
    }

    // Fallback 2: static market-data list — always has DSE stocks
    if (stocks.length === 0) {
      stocks = dseStocks
        .map((s) => ({ symbol: s.symbol, name: s.name }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol)) as any[]
    }

    return NextResponse.json(stocks)
  } catch (error) {
    console.error("Failed to load stock list from database:", error)
    // Even on DB error, return the static list so the UI still works
    const fallback = dseStocks
      .map((s) => ({ symbol: s.symbol, name: s.name }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
    return NextResponse.json(fallback)
  }
}
