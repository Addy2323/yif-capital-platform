/**
 * Pure JavaScript regression and market statistics for DSE stock series.
 * No external ML dependencies.
 * (TypeScript module — same logic as the original regression.js spec.)
 */

export function calculateLinearRegression(prices: number[]) {
  const ys = Array.isArray(prices)
    ? prices.map((p) => Number(p)).filter((y) => Number.isFinite(y))
    : []
  const n = ys.length
  if (n < 2) {
    return { slope: 0, intercept: 0, r2: 0, n }
  }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let i = 0; i < n; i++) {
    const x = i
    const y = ys[i]
    sumX += x
    sumY += y
    sumXY += x * y
    sumXX += x * x
  }

  const denom = n * sumXX - sumX * sumX
  if (denom === 0) {
    return { slope: 0, intercept: sumY / n, r2: 0, n }
  }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  let ssTot = 0
  let ssRes = 0
  for (let i = 0; i < n; i++) {
    const y = ys[i]
    const yHat = intercept + slope * i
    ssTot += (y - meanY) ** 2
    ssRes += (y - yHat) ** 2
  }

  const r2 = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0

  return { slope, intercept, r2, n }
}

export function predictPrice(prices: number[], daysAhead: number) {
  const ys = Array.isArray(prices)
    ? prices.map((p) => Number(p)).filter((y) => Number.isFinite(y))
    : []
  const { slope, intercept } = calculateLinearRegression(prices)
  if (ys.length < 2 || !Number.isFinite(daysAhead)) {
    return NaN
  }
  const n = ys.length
  const xFuture = n - 1 + daysAhead
  return intercept + slope * xFuture
}

export function calculateVolatility(prices: number[]) {
  if (!Array.isArray(prices) || prices.length < 2) return 0

  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const prev = Number(prices[i - 1])
    const curr = Number(prices[i])
    if (!Number.isFinite(prev) || prev === 0 || !Number.isFinite(curr)) continue
    returns.push((curr - prev) / prev)
  }

  if (returns.length === 0) return 0

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance =
    returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / returns.length
  return Math.sqrt(variance)
}

export function calculateMomentum(prices: number[]) {
  if (!Array.isArray(prices) || prices.length < 2) return 0
  const first = Number(prices[0])
  const last = Number(prices[prices.length - 1])
  if (!Number.isFinite(first) || first === 0 || !Number.isFinite(last)) return 0
  return ((last - first) / first) * 100
}

export function supportResistance(prices: number[]) {
  if (!Array.isArray(prices) || prices.length === 0) {
    return { support: 0, resistance: 0 }
  }
  const nums = prices.map((p) => Number(p)).filter((p) => Number.isFinite(p))
  if (nums.length === 0) return { support: 0, resistance: 0 }
  return {
    support: Math.min(...nums),
    resistance: Math.max(...nums),
  }
}

export type PriceRow = { date?: string; price: number }

export function extractPrices(data: Array<PriceRow | number>): number[] {
  if (!Array.isArray(data) || data.length === 0) return []
  if (typeof data[0] === "number") {
    return data.map((p) => Number(p)).filter((p) => Number.isFinite(p))
  }
  const rows = data
    .filter((row): row is PriceRow => row !== null && typeof row === "object")
    .map((row) => ({
      date: row.date,
      price: Number(row.price),
    }))
    .filter((row) => Number.isFinite(row.price))
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  return rows.map((r) => r.price)
}

export type StockMetrics = {
  slope: number
  intercept: number
  r2: number
  prediction7d: number | null
  prediction30d: number | null
  volatility: number
  momentum: number
  support: number
  resistance: number
  sampleSize: number
}

export function buildStockMetrics(
  data: Array<PriceRow | number>
): StockMetrics {
  const prices = extractPrices(data)
  const { slope, intercept, r2 } = calculateLinearRegression(prices)
  const pred7 = predictPrice(prices, 7)
  const pred30 = predictPrice(prices, 30)
  const { support, resistance } = supportResistance(prices)

  return {
    slope,
    intercept,
    r2,
    prediction7d: Number.isFinite(pred7) ? pred7 : null,
    prediction30d: Number.isFinite(pred30) ? pred30 : null,
    volatility: calculateVolatility(prices),
    momentum: calculateMomentum(prices),
    support,
    resistance,
    sampleSize: prices.length,
  }
}
