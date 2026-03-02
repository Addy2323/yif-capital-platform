"use client"

import { dseStocks, formatCurrency } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Building2, Landmark, Zap, Factory, ShoppingBag, Truck, Phone } from "lucide-react"
import Link from "next/link"

const sectorIcons: Record<string, any> = {
    "Banking": Landmark,
    "Consumer Goods": ShoppingBag,
    "Construction": Factory,
    "Services": Truck,
    "Industrial": Zap,
    "Telecommunications": Phone,
}

export default function ByIndustryPage() {
    const sectors = [...new Set(dseStocks.map((s) => s.sector))]

    const stocksBySector = sectors.reduce((acc, sector) => {
        acc[sector] = dseStocks.filter(s => s.sector === sector)
        return acc
    }, {} as Record<string, typeof dseStocks>)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">By Industry</h1>
                <p className="text-muted-foreground">Explore stocks grouped by their industry sector</p>
            </div>

            <PageInfo
                useCase="Supports sector-based investment strategies, allowing investors to focus on specific areas of the Tanzanian economy."
                funFact="Sector diversification reduces investment risk by spreading exposure across different economic drivers."
            />

            <div className="grid gap-6 md:grid-cols-2">
                {sectors.map((sector) => {
                    const Icon = sectorIcons[sector] || Building2
                    const stocks = stocksBySector[sector]

                    return (
                        <Card key={sector}>
                            <CardHeader className="flex flex-row items-center gap-4 border-b border-border/50 bg-muted/30 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{sector}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{stocks.length} Companies</p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    {stocks.map((stock) => (
                                        <Link
                                            key={stock.symbol}
                                            href={`/dashboard/stock/${stock.symbol}`}
                                            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
                                        >
                                            <div>
                                                <p className="font-medium text-foreground">{stock.symbol}</p>
                                                <p className="text-xs text-muted-foreground">{stock.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{formatCurrency(stock.price)}</p>
                                                <p className={`text-xs font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
