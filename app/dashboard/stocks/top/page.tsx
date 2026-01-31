"use client"

import { dseStocks, formatCurrency, formatNumber } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { TrendingUp, Award, BarChart3, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TopStocksPage() {
    const topGainers = [...dseStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Top Stocks</h1>
                <p className="text-muted-foreground">Highest-performing stocks based on market activity</p>
            </div>

            <PageInfo
                useCase="Allows Tanzanian investors to quickly identify the best performing assets on the market."
                funFact="Top stocks change daily due to market fluctuations and investor sentiment."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Award className="h-5 w-5 text-gold" />
                        Market Leaders
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
                                {topGainers.map((stock, index) => (
                                    <tr key={stock.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-gold text-navy" :
                                                    index === 1 ? "bg-silver text-navy" :
                                                        index === 2 ? "bg-bronze text-navy" : "bg-muted text-muted-foreground"
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
                                        <td className="p-4 text-right font-medium text-success">
                                            +{stock.changePercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-right text-muted-foreground">
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
