"use client"

import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/market-data"

interface MarketStatsProps {
    current: number
    change: number
    changePercent: number
    open: number
    high: number
    low: number
}

export function MarketStats({ current, change, changePercent, open, high, low }: MarketStatsProps) {
    const isPositive = changePercent >= 0

    return (
        <div className="flex flex-wrap items-start gap-x-12 gap-y-6">
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Current</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{formatNumber(current)}</span>
                    <span className={cn(
                        "flex items-center gap-1 text-sm font-bold",
                        isPositive ? "text-[#008000]" : "text-[#C00000]"
                    )}>
                        {isPositive ? "▲" : "▼"} {isPositive ? "+ " : "- "}{Math.abs(changePercent).toFixed(0)} (%)
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Open</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(open)}</p>
            </div>

            <div className="space-y-1 text-center">
                <p className="text-sm font-medium text-gray-500">High</p>
                <p className="text-2xl font-bold text-[#008000]">{formatNumber(high)}</p>
            </div>

            <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-gray-500">Low</p>
                <p className="text-2xl font-bold text-[#C00000]">{formatNumber(low)}</p>
            </div>
        </div>
    )
}
