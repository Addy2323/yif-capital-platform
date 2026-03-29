"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export type ChartStockRow = { ticker: string; qty: number }
export type ChartFundRow = { name: string }

type RangeKey = "1M" | "YTD" | "3M" | "6M" | "1Y" | "5Y" | "MAX"

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "YTD", label: "YTD" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "5Y", label: "5Y" },
  { key: "MAX", label: "Max" },
]

function filterByRange<T extends { date: string }>(
  points: T[],
  range: RangeKey
): T[] {
  if (points.length === 0 || range === "MAX") return points
  const last = points[points.length - 1]
  const end = new Date(last.date + "T12:00:00Z")
  let start = new Date(end)
  switch (range) {
    case "1M":
      start.setUTCMonth(end.getUTCMonth() - 1)
      break
    case "3M":
      start.setUTCMonth(end.getUTCMonth() - 3)
      break
    case "6M":
      start.setUTCMonth(end.getUTCMonth() - 6)
      break
    case "1Y":
      start.setUTCFullYear(end.getUTCFullYear() - 1)
      break
    case "5Y":
      start.setUTCFullYear(end.getUTCFullYear() - 5)
      break
    case "YTD":
      start = new Date(Date.UTC(end.getUTCFullYear(), 0, 1))
      break
    default:
      return points
  }
  return points.filter((p) => new Date(p.date + "T12:00:00Z") >= start)
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z")
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
}

function formatY(v: number): string {
  if (!Number.isFinite(v)) return "—"
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}k`
  return v.toFixed(0)
}

export interface PortfolioPerformanceChartProps {
  /** Live-weighted stock rows (ticker + qty). */
  stocks: ChartStockRow[]
  funds: ChartFundRow[]
  portfolioId: string | null
}

type Point = { date: string; value: number }

export function PortfolioPerformanceChart({
  stocks,
  funds,
  portfolioId,
}: PortfolioPerformanceChartProps) {
  const [range, setRange] = useState<RangeKey>("3M")
  const [view, setView] = useState<string>("aggregate")
  const [rawPoints, setRawPoints] = useState<Point[]>([])
  const [label, setLabel] = useState("")
  const [warning, setWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const stockKey = useMemo(
    () =>
      stocks
        .map((s) => `${s.ticker}:${s.qty}`)
        .sort()
        .join("|"),
    [stocks]
  )

  useEffect(() => {
    if (!portfolioId) return
    if (stocks.length === 0 && funds.length > 0) {
      setView(`fund:${funds[0].name}`)
    } else if (stocks.length > 0) {
      setView("aggregate")
    }
  }, [portfolioId])

  const load = useCallback(async () => {
    if (!portfolioId) return
    setLoading(true)
    setWarning(null)
    try {
      if (view === "aggregate") {
        const res = await fetch("/api/v1/portfolio/chart-series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "aggregate",
            stocks: stocks.map((s) => ({
              ticker: s.ticker,
              qty: s.qty,
            })),
          }),
        })
        const json = await res.json()
        setLabel(String(json.label ?? "Portfolio"))
        setRawPoints(Array.isArray(json.points) ? json.points : [])
        if (json.warning) setWarning(String(json.warning))
        return
      }
      if (view.startsWith("stock:")) {
        const ticker = view.slice("stock:".length)
        const row = stocks.find(
          (s) => s.ticker.toUpperCase() === ticker.toUpperCase()
        )
        const qty = row?.qty ?? 0
        const res = await fetch(
          `/api/v1/portfolio/chart-series?kind=stock&symbol=${encodeURIComponent(ticker)}&qty=${encodeURIComponent(String(qty))}`
        )
        const json = await res.json()
        setLabel(String(json.label ?? ticker))
        setRawPoints(Array.isArray(json.points) ? json.points : [])
        if (json.warning) setWarning(String(json.warning))
        return
      }
      if (view.startsWith("fund:")) {
        const name = view.slice("fund:".length)
        const res = await fetch(
          `/api/v1/portfolio/chart-series?kind=fund&name=${encodeURIComponent(name)}`
        )
        const json = await res.json()
        setLabel(String(json.label ?? name))
        setRawPoints(Array.isArray(json.points) ? json.points : [])
        if (json.warning) setWarning(String(json.warning))
      }
    } catch {
      setRawPoints([])
      setWarning("Could not load chart data.")
    } finally {
      setLoading(false)
    }
  }, [view, portfolioId, stocks, stockKey])

  useEffect(() => {
    void load()
  }, [load])

  const chartData = useMemo(
    () => filterByRange(rawPoints, range),
    [rawPoints, range]
  )

  const displayData = useMemo(
    () =>
      chartData.map((p) => ({
        ...p,
        xLabel: formatAxisDate(p.date),
      })),
    [chartData]
  )

  const pctStr = useMemo(() => {
    if (chartData.length < 2) return null
    const a = chartData[0].value
    const b = chartData[chartData.length - 1].value
    if (!Number.isFinite(a) || a === 0 || !Number.isFinite(b)) return null
    const pct = ((b - a) / Math.abs(a)) * 100
    const sign = pct >= 0 ? "+" : ""
    return `${sign}${pct.toFixed(2)}%`
  }, [chartData])

  const lastVal = chartData.length ? chartData[chartData.length - 1].value : null

  const hasHoldings = stocks.length > 0 || funds.length > 0

  if (!hasHoldings) {
    return null
  }

  return (
    <div
      style={{
        background: "#1A3A6E",
        border: "1px solid #24427E",
        borderRadius: 16,
        padding: "16px 18px 12px",
        animation: "pf-slideUp 0.3s 0.1s both",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "#e8f0fe",
              marginBottom: 6,
            }}
          >
            Performance
          </div>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            style={{
              maxWidth: "100%",
              background: "#0A1F44",
              border: "1px solid #24427E",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#e8f0fe",
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {stocks.length > 0 && (
              <option value="aggregate">All stocks (combined value)</option>
            )}
            {stocks.map((s) => (
              <option key={s.ticker} value={`stock:${s.ticker}`}>
                {s.ticker} · {s.qty.toLocaleString()} sh
              </option>
            ))}
            {funds.map((f) => (
              <option key={f.name} value={`fund:${f.name}`}>
                Fund: {f.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ textAlign: "right" }}>
          {pctStr != null && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                color: pctStr.startsWith("-") ? "#f87171" : "#22c55e",
              }}
            >
              {pctStr}{" "}
              <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 12 }}>
                ({range === "MAX" ? "Max" : range})
              </span>
            </div>
          )}
          {lastVal != null && (
            <div
              style={{
                marginTop: 4,
                display: "inline-block",
                background: "#15803d",
                color: "#fff",
                padding: "2px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {formatY(lastVal)} TZS
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border:
                range === r.key
                  ? "1px solid #e8f0fe"
                  : "1px solid transparent",
              background: range === r.key ? "#0A1F44" : "transparent",
              color: range === r.key ? "#e8f0fe" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#fafafa",
          borderRadius: 12,
          padding: "8px 4px 4px",
          height: 300,
        }}
      >
        {loading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        ) : displayData.length < 2 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 13,
              padding: 16,
              textAlign: "center",
            }}
          >
            <div>No time series yet for this selection.</div>
            {warning && (
              <div style={{ marginTop: 8, maxWidth: 360, lineHeight: 1.4 }}>
                {warning}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
              After DSE / fund sync, prices update here automatically.
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={displayData}
              margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="pfPerfGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="xLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => formatY(Number(v))}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [
                  `${formatY(v)} TZS`,
                  label || "Value",
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ?? ""
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#15803d"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pfPerfGreen)"
                dot={false}
                activeDot={{ r: 4, fill: "#15803d" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      {warning && displayData.length >= 2 && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8" }}>
          {warning}
        </p>
      )}
    </div>
  )
}
