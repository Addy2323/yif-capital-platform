"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/market-data"

interface StockData {
    symbol: string
    name?: string
    price: number
    changePercent: number
    volume?: number
}

interface MarketTableProps {
    title: string
    data: StockData[]
    variant: "gainers" | "losers" | "movers"
}

export function MarketTable({ title, data, variant }: MarketTableProps) {
    const isMovers = variant === "movers"
    const isGainers = variant === "gainers"

    const headerBg = isGainers || isMovers ? "bg-[#008000]" : "bg-[#C00000]"

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className={cn("text-white font-bold uppercase", headerBg)}>
                            <th className="px-4 py-2">Symbol</th>
                            <th className="px-4 py-2">{isMovers ? "Price" : "LTP"}</th>
                            <th className={cn("px-4 py-2 text-right", isMovers ? "" : "")}>
                                {isMovers ? "Volume" : "Change(%)"}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((stock, idx) => (
                            <tr
                                key={stock.symbol}
                                className={cn(
                                    "transition-colors hover:bg-gray-50",
                                    idx % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                                )}
                            >
                                <td className="px-4 py-2">
                                    <Link
                                        href={`/dashboard/stock/${stock.symbol}`}
                                        className="font-bold text-[#0066CC] hover:underline"
                                    >
                                        {stock.symbol}
                                    </Link>
                                </td>
                                <td className="px-4 py-2 font-medium text-gray-700">
                                    {isMovers ? formatNumber(stock.price) : formatNumber(stock.price)}
                                </td>
                                <td className={cn(
                                    "px-4 py-2 text-right font-bold",
                                    isMovers
                                        ? "text-gray-700"
                                        : stock.changePercent >= 0 ? "text-[#008000]" : "text-[#C00000]"
                                )}>
                                    {isMovers
                                        ? formatNumber(stock.volume || 0)
                                        : stock.changePercent.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
