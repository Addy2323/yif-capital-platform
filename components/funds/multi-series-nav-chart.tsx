"use client"

import { useMemo, useState } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

// Distinct color palette for up to 10 sub-funds
const FUND_COLORS: Record<string, string> = {
    "Umoja Fund": "#06d6a0",           // teal-green
    "Wekeza Maisha Fund": "#7c3aed",   // purple
    "Watoto Fund": "#f59e0b",          // amber
    "Jikimu Fund": "#ef4444",          // red
    "Liquid Fund": "#3b82f6",          // blue
    "Bond Fund": "#a855f7",            // violet
}

const FALLBACK_COLORS = [
    "#06d6a0", "#7c3aed", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7",
    "#ec4899", "#14b8a6", "#f97316", "#6366f1",
]

interface FundRecord {
    date: string
    fund_name?: string
    scheme_name?: string
    nav_per_unit?: number
    total_nav?: number
    sale_price?: number
    repurchase_price?: number
    units?: number
    source?: string
}

interface MultiSeriesNavChartProps {
    data?: FundRecord[]
    processedData?: ChartDataPoint[]
    height?: number
    isPerformance?: boolean
}

interface ChartDataPoint {
    date: string
    [fundName: string]: string | number | undefined
}

// Custom tooltip
function CustomTooltip({ active, payload, label, isPerformance }: any) {
    if (!active || !payload || payload.length === 0) return null

    return (
        <div className="bg-[#0f1729] text-white rounded-lg px-4 py-3 shadow-xl border border-white/10 min-w-[180px]">
            <p className="text-xs font-semibold mb-2 text-white/80">{label}</p>
            <div className="space-y-1.5">
                {payload
                    .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
                    .map((entry: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-white/70 truncate max-w-[100px]">
                                    {entry.name?.replace(" Fund", "")}
                                </span>
                            </div>
                            <span className="text-xs font-bold tabular-nums">
                                TZS {entry.value?.toFixed(2)}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export function MultiSeriesNavChart({ data = [], processedData, height = 350, isPerformance = false }: MultiSeriesNavChartProps) {
    const [selectedFund, setSelectedFund] = useState<string>("all")

    // Extract unique fund names from the data (filter out numeric values that may have leaked in as scheme names)
    const fundNames = useMemo(() => {
        const names = new Set<string>()
        if (processedData && processedData.length > 0) {
            Object.keys(processedData[0]).forEach(key => {
                if (key !== "date" && isNaN(Number(key.replace(/,/g, "")))) names.add(key)
            })
        } else {
            data.forEach((record) => {
                const name = record.fund_name || record.scheme_name
                if (name && isNaN(Number(name.replace(/,/g, "")))) names.add(name)
            })
        }
        return Array.from(names).sort()
    }, [data, processedData])

    // Get color for a fund
    const getColor = (fundName: string, idx: number) => {
        return FUND_COLORS[fundName] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
    }

    // Which funds to show
    const activeFunds = selectedFund === "all" ? fundNames : [selectedFund]

    // Transform the raw data into a chart-friendly format:
    //  - Group records by date
    //  - For each date, create columns for each fund's nav_per_unit
    //  - Normalize to base 100 (first available value per fund)
    const chartData = useMemo(() => {
        if (processedData) return processedData

        // Group by (date, fund_name)
        const byDate = new Map<string, Map<string, number>>()
        const allDates = new Set<string>()

        data.forEach((record) => {
            const fundName = record.fund_name || record.scheme_name
            if (!fundName || !record.nav_per_unit || !record.date) return
            allDates.add(record.date)
            if (!byDate.has(record.date)) byDate.set(record.date, new Map())
            byDate.get(record.date)!.set(fundName, record.nav_per_unit)
        })

        // Sort dates chronologically (ascending)
        const sortedDates = Array.from(allDates).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        )

        // Find the first NAV for each fund (for normalization to base 100)
        const firstNav = new Map<string, number>()
        for (const date of sortedDates) {
            const dateData = byDate.get(date)
            if (!dateData) continue
            for (const fund of fundNames) {
                if (!firstNav.has(fund) && dateData.has(fund)) {
                    firstNav.set(fund, dateData.get(fund)!)
                }
            }
        }

        // Build the chart data array
        const result: ChartDataPoint[] = []
        for (const date of sortedDates) {
            const dateData = byDate.get(date)
            if (!dateData) continue

            const point: ChartDataPoint = { date }
            for (const fund of fundNames) {
                const raw = dateData.get(fund)
                const base = firstNav.get(fund)
                if (raw !== undefined && base !== undefined && base > 0) {
                    point[fund] = (raw / base) * 100
                }
            }
            result.push(point)
        }

        return result
    }, [data, fundNames, processedData])

    if ((!data || data.length === 0) && (!processedData || processedData.length === 0)) {
        return (
            <div className="flex items-center justify-center h-[300px] bg-muted/5 rounded-lg border border-dashed border-border/50">
                <p className="text-sm text-muted-foreground">No performance data available</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3">
                    {fundNames.map((name, idx) => {
                        const color = getColor(name, idx)
                        const isActive = selectedFund === "all" || selectedFund === name
                        return (
                            <button
                                key={name}
                                onClick={() =>
                                    setSelectedFund(selectedFund === name ? "all" : name)
                                }
                                className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-all ${isActive
                                    ? "opacity-100"
                                    : "opacity-40 hover:opacity-70"
                                    }`}
                            >
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span>{name}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Fund Filter Dropdown */}
                <select
                    value={selectedFund}
                    onChange={(e) => setSelectedFund(e.target.value)}
                    className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">All Funds</option>
                    {fundNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Chart */}
            <div style={{ width: "100%", height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            {activeFunds.map((fund, idx) => {
                                const color = getColor(fund, fundNames.indexOf(fund))
                                return (
                                    <linearGradient
                                        key={`grad-${fund}`}
                                        id={`grad-${fund.replace(/\s+/g, "-")}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                )
                            })}
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            className="stroke-border/30"
                        />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            minTickGap={50}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(v: number) => v.toLocaleString()}
                            domain={["auto", "auto"]}
                            dx={-5}
                            label={{
                                value: "NAV Per Unit (TZS)",
                                angle: -90,
                                position: "insideLeft",
                                offset: 15,
                                style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                            }}
                        />

                        <Tooltip content={<CustomTooltip isPerformance={isPerformance} />} />

                        {activeFunds.map((fund) => {
                            const color = getColor(fund, fundNames.indexOf(fund))
                            return (
                                <Area
                                    key={fund}
                                    type="monotone"
                                    dataKey={fund}
                                    name={fund}
                                    stroke={color}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#grad-${fund.replace(/\s+/g, "-")})`}
                                    connectNulls={true}
                                    isAnimationActive={true}
                                    animationDuration={1200}
                                    activeDot={{ r: 5, strokeWidth: 0 }}
                                />
                            )
                        })}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
