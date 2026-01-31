"use client"

import { dseStocks, formatCurrency } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Grid3X3, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

export default function MarketHeatmapPage() {
    // Group stocks by sector for heatmap
    const sectors = [...new Set(dseStocks.map((s) => s.sector))]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Market Heatmap</h1>
                <p className="text-muted-foreground">Visual representation of market performance by sector</p>
            </div>

            <PageInfo
                useCase="Provides a quick overview of which sectors are performing well on the DSE at a glance."
                funFact="Heatmaps are one of the fastest ways for traders to assess overall market sentiment."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Grid3X3 className="h-5 w-5 text-gold" />
                        Sector Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sectors.map((sector) => {
                            const sectorStocks = dseStocks.filter(s => s.sector === sector)
                            const avgChange = sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length
                            const isPositive = avgChange >= 0

                            return (
                                <div
                                    key={sector}
                                    className={`rounded-lg border p-4 transition-all hover:scale-[1.02] ${isPositive
                                            ? "border-success/30 bg-success/5 hover:bg-success/10"
                                            : "border-error/30 bg-error/5 hover:bg-error/10"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-foreground">{sector}</h3>
                                        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? "text-success" : "text-error"}`}>
                                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                            {isPositive ? "+" : ""}{avgChange.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {sectorStocks.slice(0, 3).map((stock) => (
                                            <Link
                                                key={stock.symbol}
                                                href={`/dashboard/stock/${stock.symbol}`}
                                                className="flex items-center justify-between text-sm p-1 rounded hover:bg-background/50"
                                            >
                                                <span className="font-medium">{stock.symbol}</span>
                                                <span className={stock.changePercent >= 0 ? "text-success" : "text-error"}>
                                                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
