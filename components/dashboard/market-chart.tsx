"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { formatCurrency } from "@/lib/market-data"

interface ChartData {
    date: string
    price: number
}

interface MarketChartProps {
    data: ChartData[]
    height?: number
}

export function MarketChart({ data, height = 400 }: MarketChartProps) {
    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#33B5FF" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#33B5FF" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#999" }}
                        minTickGap={30}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#999" }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            fontSize: "12px"
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Price"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#33B5FF"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
