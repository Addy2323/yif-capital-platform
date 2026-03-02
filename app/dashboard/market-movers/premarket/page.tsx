"use client"

import { dseStocks, formatCurrency, formatNumber } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Sunrise, TrendingUp, TrendingDown, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function PremarketPage() {
    // Mock premarket data
    const premarketData = dseStocks.slice(0, 5).map(stock => ({
        ...stock,
        premarketChange: (Math.random() * 4 - 2).toFixed(2),
        premarketPrice: stock.price * (1 + (Math.random() * 0.02 - 0.01)),
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Premarket</h1>
                    <p className="text-muted-foreground">Pre-market trading activity before the market opens</p>
                </div>
                <Badge variant="outline" className="border-gold/50 text-gold">
                    <Clock className="mr-1 h-3 w-3" />
                    Pre-Market Hours
                </Badge>
            </div>

            <PageInfo
                useCase="While the DSE operates fixed hours, global stocks accessible to Tanzanian investors may have pre-market sessions."
                funFact="Premarket trading usually has lower volume and higher volatility than regular hours."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Sunrise className="h-5 w-5 text-gold" />
                        Pre-Market Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Symbol</th>
                                    <th className="p-4 font-medium text-right">Last Close</th>
                                    <th className="p-4 font-medium text-right">Pre-Market</th>
                                    <th className="p-4 font-medium text-right">Change</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {premarketData.map((stock) => (
                                    <tr key={stock.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <Link href={`/dashboard/stock/${stock.symbol}`} className="block">
                                                <p className="font-medium text-foreground hover:text-gold">{stock.symbol}</p>
                                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                                            </Link>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(stock.price)}</td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(stock.premarketPrice)}</td>
                                        <td className={`p-4 text-right font-medium ${parseFloat(stock.premarketChange) >= 0 ? "text-success" : "text-error"}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {parseFloat(stock.premarketChange) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {parseFloat(stock.premarketChange) >= 0 ? "+" : ""}{stock.premarketChange}%
                                            </div>
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
