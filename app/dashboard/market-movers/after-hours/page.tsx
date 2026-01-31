"use client"

import { dseStocks, formatCurrency, formatNumber } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Moon, TrendingUp, TrendingDown, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AfterHoursPage() {
    // Mock after hours data
    const afterHoursData = dseStocks.slice(0, 5).map(stock => ({
        ...stock,
        afterHoursChange: (Math.random() * 3 - 1.5).toFixed(2),
        afterHoursPrice: stock.price * (1 + (Math.random() * 0.015 - 0.0075)),
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">After Hours</h1>
                    <p className="text-muted-foreground">After-market trading activity after market close</p>
                </div>
                <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                    <Clock className="mr-1 h-3 w-3" />
                    After Hours
                </Badge>
            </div>

            <PageInfo
                useCase="Track after-hours movements on international markets that affect global investments for Tanzanian investors."
                funFact="Significant news or earnings releases often cause large after-hours price swings."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Moon className="h-5 w-5 text-blue-500" />
                        After-Hours Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Symbol</th>
                                    <th className="p-4 font-medium text-right">Close Price</th>
                                    <th className="p-4 font-medium text-right">After Hours</th>
                                    <th className="p-4 font-medium text-right">Change</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {afterHoursData.map((stock) => (
                                    <tr key={stock.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <Link href={`/dashboard/stock/${stock.symbol}`} className="block">
                                                <p className="font-medium text-foreground hover:text-gold">{stock.symbol}</p>
                                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                                            </Link>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(stock.price)}</td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(stock.afterHoursPrice)}</td>
                                        <td className={`p-4 text-right font-medium ${parseFloat(stock.afterHoursChange) >= 0 ? "text-success" : "text-error"}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {parseFloat(stock.afterHoursChange) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {parseFloat(stock.afterHoursChange) >= 0 ? "+" : ""}{stock.afterHoursChange}%
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
