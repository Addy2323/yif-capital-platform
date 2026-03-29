/**
 * End-to-end stock analysis: load JSON history → regression metrics → AI advice.
 * History source: (1) data/stock-history/{SYM}.json if present, else (2) DseStock rows from DB (daily scrapes).
 */

import fs from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { buildStockMetrics, type PriceRow } from "./regression"
import { getAIAdvice, type AdvisorContext } from "./advisorService"

export const HISTORY_DIR = path.join(process.cwd(), "data", "stock-history")
const SECTORS_FILE = path.join(HISTORY_DIR, "sectors.json")

function loadSectorsMap(): Record<string, string> {
  try {
    const raw = fs.readFileSync(SECTORS_FILE, "utf8")
    const j = JSON.parse(raw) as unknown
    return typeof j === "object" && j !== null ? (j as Record<string, string>) : {}
  } catch {
    return {}
  }
}

let sectorsCache: Record<string, string> | null = null

export function getSectorForSymbol(symbol: string) {
  if (!sectorsCache) sectorsCache = loadSectorsMap()
  const u = String(symbol || "").toUpperCase()
  return sectorsCache[u] || "General"
}

function parseHistoryJson(parsed: unknown, sym: string): PriceRow[] {
  if (Array.isArray(parsed)) {
    return parsed as PriceRow[]
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "series" in parsed &&
    Array.isArray((parsed as { series: unknown }).series)
  ) {
    return (parsed as { series: PriceRow[] }).series
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "data" in parsed &&
    Array.isArray((parsed as { data: unknown }).data)
  ) {
    return (parsed as { data: PriceRow[] }).data
  }

  throw new Error(`Unsupported JSON shape for '${sym}'`)
}

/** Read bundled JSON history only (throws if missing or invalid). */
export function loadStockJson(stockSymbol: string): PriceRow[] {
  const sym = String(stockSymbol || "")
    .trim()
    .toUpperCase()
  if (!sym) {
    throw new Error("Stock symbol is required")
  }

  const filePath = path.join(HISTORY_DIR, `${sym}.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`No historical data file for '${sym}' (${filePath})`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch {
    throw new Error(`Invalid JSON for stock '${sym}'`)
  }

  return parseHistoryJson(parsed, sym)
}

function readStockHistoryFromFileIfExists(sym: string): PriceRow[] | null {
  const filePath = path.join(HISTORY_DIR, `${sym}.json`)
  if (!fs.existsSync(filePath)) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch {
    throw new Error(`Invalid JSON for stock '${sym}'`)
  }
  return parseHistoryJson(parsed, sym)
}

/**
 * Build one price point per calendar day from DSE scrapes (latest scrape wins each day).
 */
async function loadStockHistoryFromDatabase(sym: string): Promise<PriceRow[]> {
  const rows = await prisma.dseStock.findMany({
    where: { symbol: { equals: sym, mode: "insensitive" } },
    orderBy: { scrapedAt: "asc" },
    select: { scrapedAt: true, price: true },
  })

  const byDay = new Map<string, number>()
  for (const r of rows) {
    const p = Number(r.price)
    if (!Number.isFinite(p)) continue
    const d = r.scrapedAt.toISOString().slice(0, 10)
    byDay.set(d, p)
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, price]) => ({ date, price }))
}

/**
 * Prefer `data/stock-history/{SYM}.json` when the file exists; otherwise use scraped `DseStock` history.
 */
export async function loadStockHistory(stockSymbol: string): Promise<PriceRow[]> {
  const sym = String(stockSymbol || "").trim().toUpperCase()
  if (!sym) {
    throw new Error("Stock symbol is required")
  }

  const fromFile = readStockHistoryFromFileIfExists(sym)
  if (fromFile !== null && fromFile.length > 0) {
    return fromFile
  }

  const fromDb = await loadStockHistoryFromDatabase(sym)
  if (fromDb.length > 0) {
    return fromDb
  }

  const filePath = path.join(HISTORY_DIR, `${sym}.json`)
  throw new Error(
    `No historical data for '${sym}': add ${sym}.json under data/stock-history/, or run DSE scrapes so ${sym} exists in the database across at least one day.`
  )
}

export function inferMarketTrend(metrics: { slope?: number }) {
  const s = Number(metrics?.slope ?? 0)
  if (s > 0.01) return "UP"
  if (s < -0.01) return "DOWN"
  return "STABLE"
}

export type ProcessOptions = {
  userRisk?: string
  inflation?: number
  interestRate?: number
  marketTrend?: string
  sector?: string
}

export async function processStockAnalysis(
  stockSymbol: string,
  options: ProcessOptions = {}
) {
  const stock = String(stockSymbol || "")
    .trim()
    .toUpperCase()
  const rawSeries = await loadStockHistory(stock)
  const metrics = buildStockMetrics(rawSeries)

  if (!metrics.sampleSize || metrics.sampleSize < 2) {
    throw new Error("Insufficient price history for analysis")
  }

  const userRisk = options.userRisk || "medium"
  const sector = options.sector || getSectorForSymbol(stock)
  const marketTrend = options.marketTrend || inferMarketTrend(metrics)
  const inflation =
    options.inflation !== undefined ? options.inflation : 5.0
  const interestRate =
    options.interestRate !== undefined ? options.interestRate : 7.0

  const context: AdvisorContext = {
    sector,
    userRisk,
    marketTrend,
    inflation,
    interestRate,
  }

  const aiAdvice = await getAIAdvice(stock, metrics, context)

  return {
    stock,
    metrics,
    aiAdvice,
    context,
  }
}
