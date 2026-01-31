"use client"

import { formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Activity, TrendingUp, TrendingDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MostActivePage() {
    const { stocks } = useMarketData()
    const mostActive = [...stocks].sort((a, b) => b.volume - a.volume)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Most Active</h1>
                <p className="text-muted-foreground">Stocks with the highest trading volume today</p>
            </div>

            <PageInfo
                useCase="Shows which DSE stocks are seeing the most trading activity, indicating high investor interest."
                funFact="High trading volume often precedes significant price movements in either direction."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5 text-gold" />
                        High Volume Stocks
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Rank</th>
                                    <th className="p-4 font-medium">Symbol</th>
                                    <th className="p-4 font-medium text-right">Price</th>
                                    <th className="p-4 font-medium text-right">Change</th>
                                    <th className="p-4 font-medium text-right">Volume</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mostActive.map((stock, index) => (
                                    <tr key={stock.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-gold text-navy" :
                                                index === 1 ? "bg-gray-300 text-navy" :
                                                    index === 2 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/dashboard/stock/${stock.symbol}`} className="block">
                                                <p className="font-medium text-foreground hover:text-gold">{stock.symbol}</p>
                                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                                            </Link>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(stock.price)}</td>
                                        <td className={`p-4 text-right font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {stock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gold">
                                            {formatNumber(stock.volume)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
