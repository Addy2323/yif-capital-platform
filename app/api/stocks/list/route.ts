import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    let stocks = await prisma.stock.findMany({
      select: {
        symbol: true,
        name: true,
      },
      orderBy: {
        symbol: 'asc',
      },
    })

    // FALLBACK: If new Stock table is empty, try to get from legacy DseStock table
    if (stocks.length === 0) {
      const latestScrape = await (prisma as any).dseStock.findFirst({
        orderBy: { scrapedAt: 'desc' },
        select: { scrapedAt: true }
      });

      if (latestScrape) {
        const legacyStocks = await (prisma as any).dseStock.findMany({
          where: { scrapedAt: latestScrape.scrapedAt },
          select: {
            symbol: true,
            name: true,
          },
          distinct: ['symbol'],
          orderBy: {
            symbol: 'asc',
          },
        });
        // Map to expected format
        stocks = legacyStocks.map((s: any) => ({
          symbol: s.symbol,
          name: s.name || s.symbol // Fallback name to symbol if null
        })) as any[];
      }
    }

    return NextResponse.json(stocks)
  } catch (error) {
    console.error("Failed to load stock list from database:", error)
    return NextResponse.json({ error: "Stock list unavailable" }, { status: 500 })
  }
}
