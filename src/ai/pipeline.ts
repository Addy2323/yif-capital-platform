/**
 * End-to-end stock analysis: load JSON history → regression metrics → AI advice.
 */

import fs from "fs"
import path from "path"
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
  const rawSeries = loadStockJson(stock)
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
