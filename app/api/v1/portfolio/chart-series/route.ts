import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { loadStockHistory } from "@/src/ai/pipeline"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function getUserId() {
  const cookieStore = await cookies()
  return cookieStore.get("user_id")?.value
}

type Point = { date: string; value: number; price?: number }

function mergeStockMaps(maps: Map<string, number>[]): Point[] {
  const allDates = new Set<string>()
  for (const m of maps) {
    for (const d of m.keys()) allDates.add(d)
  }
  const sorted = [...allDates].sort()
  const last = maps.map(() => null as number | null)
  const out: Point[] = []
  for (const d of sorted) {
    let sum = 0
    let n = 0
    for (let i = 0; i < maps.length; i++) {
      if (maps[i].has(d)) last[i] = maps[i].get(d)!
      if (last[i] != null) {
        sum += last[i]!
        n++
      }
    }
    if (n > 0) out.push({ date: d, value: sum })
  }
  return out
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const kind = searchParams.get("kind")

    if (kind === "stock") {
      const symbol = searchParams.get("symbol")?.trim().toUpperCase()
      const qtyRaw = searchParams.get("qty")
      const qty = qtyRaw ? Math.max(0, Number(qtyRaw)) : 1
      if (!symbol) {
        return NextResponse.json(
          { success: false, error: "symbol required" },
          { status: 400 }
        )
      }
      try {
        const rows = await loadStockHistory(symbol)
        const points: Point[] = rows.map((r) => {
          const price = Number(r.price)
          return {
            date: r.date,
            price,
            value: price * qty,
          }
        })
        return NextResponse.json({
          success: true,
          label: `${symbol} · ${qty.toLocaleString()} sh`,
          points,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No history"
        return NextResponse.json({
          success: true,
          label: symbol,
          points: [] as Point[],
          warning: msg,
        })
      }
    }

    if (kind === "fund") {
      const name = searchParams.get("name")?.trim()
      if (!name) {
        return NextResponse.json(
          { success: false, error: "name required" },
          { status: 400 }
        )
      }

      const fund = await prisma.fund.findFirst({
        where: {
          OR: [
            { fundName: { contains: name, mode: "insensitive" } },
            { fundId: { contains: name, mode: "insensitive" } },
          ],
        },
        select: { fundId: true, fundName: true },
      })

      if (!fund) {
        return NextResponse.json({
          success: true,
          label: name,
          points: [] as Point[],
          warning: "No matching fund in database. NAV charts require a synced fund.",
        })
      }

      const navRows = await prisma.fundNavHistory.findMany({
        where: { fundId: fund.fundId },
        orderBy: { date: "asc" },
        select: { date: true, nav: true },
      })

      let points: Point[] = navRows.map((r) => {
        const nav = Number(r.nav)
        return {
          date: r.date.toISOString().slice(0, 10),
          value: nav,
          price: nav,
        }
      })

      if (points.length === 0) {
        const daily = await prisma.fundDailySummary.findMany({
          where: { fundId: fund.fundId },
          orderBy: { date: "asc" },
          select: { date: true, nav: true },
        })
        const byDay = new Map<string, number>()
        for (const r of daily) {
          const nav = Number(r.nav)
          if (!Number.isFinite(nav)) continue
          const d = r.date.toISOString().slice(0, 10)
          byDay.set(d, nav)
        }
        points = [...byDay.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, nav]) => ({ date, value: nav, price: nav }))
      }

      return NextResponse.json({
        success: true,
        label: fund.fundName,
        points,
      })
    }

    return NextResponse.json(
      { success: false, error: "kind must be stock or fund" },
      { status: 400 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed"
    console.error("[chart-series GET]", error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const kind = body.kind as string
    if (kind !== "aggregate") {
      return NextResponse.json(
        { success: false, error: "kind must be aggregate" },
        { status: 400 }
      )
    }

    const stocks = Array.isArray(body.stocks) ? body.stocks : []
    const maps: Map<string, number>[] = []

    for (const row of stocks) {
      const ticker = String(row?.ticker ?? "")
        .trim()
        .toUpperCase()
      const qty = Math.max(0, Number(row?.qty) || 0)
      if (!ticker || qty <= 0) continue
      try {
        const rows = await loadStockHistory(ticker)
        const m = new Map<string, number>()
        for (const r of rows) {
          const p = Number(r.price)
          if (Number.isFinite(p)) m.set(r.date, p * qty)
        }
        if (m.size > 0) maps.push(m)
      } catch {
        // skip missing history
      }
    }

    if (maps.length === 0) {
      return NextResponse.json({
        success: true,
        label: "Portfolio (stocks)",
        points: [] as Point[],
        warning:
          "No historical prices yet. Run DSE sync or add stock-history JSON files.",
      })
    }

    const points = mergeStockMaps(maps)
    return NextResponse.json({
      success: true,
      label: "Portfolio (stocks)",
      points,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed"
    console.error("[chart-series POST]", error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
