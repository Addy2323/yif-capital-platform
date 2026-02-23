"use client"

import { useMemo } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts"

interface DataPoint {
    date: string
    [key: string]: string | number
}

interface SeriesConfig {
    key: string
    label: string
    color?: string
    gradientId?: string
}

interface FundAreaChartProps {
    data: DataPoint[]
    series: SeriesConfig[]
    height?: number | string
    currency?: string
    showGrid?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    valueFormatter?: (value: number) => string
}

export function FundAreaChart({
    data,
    series,
    height = 300,
    currency = "TZS",
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    valueFormatter,
}: FundAreaChartProps) {
    const defaultFormatter = (v: number) => {
        if (valueFormatter) return valueFormatter(v)
        return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)
    }

    // Generate unique IDs for gradients to avoid collisions if multiple charts are on screen
    const chartId = useMemo(() => Math.random().toString(36).substr(2, 9), [])

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/5 rounded-lg border border-dashed border-border/50">
                <p className="text-sm text-muted-foreground">No data available for the selected period</p>
            </div>
        )
    }

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        {series.map((s, idx) => (
                            <linearGradient
                                key={`${chartId}-grad-${idx}`}
                                id={`${chartId}-grad-${s.key}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop offset="5%" stopColor={s.color || "#0ea5e9"} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={s.color || "#0ea5e9"} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>

                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(var(--border), 0.1)"
                            className="stroke-border/40"
                        />
                    )}

                    {showXAxis && (
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            minTickGap={30}
                            dy={10}
                        />
                    )}

                    {showYAxis && (
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={defaultFormatter}
                            dx={-5}
                        />
                    )}

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        itemStyle={{ padding: "2px 0" }}
                    />

                    {series.map((s) => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            stroke={s.color || "#0ea5e9"}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#${chartId}-grad-${s.key})`}
                            isAnimationActive={true}
                            animationDuration={1500}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
