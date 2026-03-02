"use client"

import { dseStocks, formatCurrency } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Flame, TrendingUp, TrendingDown, Star, Eye, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TrendingPage() {
    // Mock trending stocks based on volume and change
    const trending = [...dseStocks]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 6)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Trending</h1>
                <p className="text-muted-foreground">Stocks and topics receiving high market attention</p>
            </div>

            <PageInfo
                useCase="Helps Tanzanian investors identify high-interest securities and capitalize on market momentum."
                funFact="Trending stocks are usually highly volatile, presenting both opportunities and risks."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trending.map((stock, index) => (
                    <Card key={stock.symbol} className="overflow-hidden transition-all hover:border-gold/50 group">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${index < 3 ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"
                                        }`}>
                                        <Flame className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                                    </div>
                                </div>
                                {index < 3 && (
                                    <Badge className="bg-gold text-navy">Hot</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold">{formatCurrency(stock.price)}</p>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                        {stock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Activity className="h-3 w-3" />
                                        {(stock.volume / 1000).toFixed(0)}K vol
                                    </div>
                                </div>
                            </div>

                            <Button asChild variant="outline" className="w-full group-hover:border-gold/50">
                                <Link href={`/dashboard/stock/${stock.symbol}`}>
                                    View Details
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
