"use client"

import { analystRatings, formatCurrency, getStockBySymbol } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { UserCheck, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TopAnalystsPage() {
    const getRatingColor = (rating: string) => {
        switch (rating) {
            case "Strong Buy": return "bg-success text-success-foreground"
            case "Buy": return "bg-success/80 text-success-foreground"
            case "Hold": return "bg-muted text-muted-foreground"
            case "Sell": return "bg-error/80 text-error-foreground"
            case "Underperform": return "bg-error text-error-foreground"
            default: return "bg-muted text-muted-foreground"
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Top Analysts</h1>
                <p className="text-muted-foreground">Expert recommendations and ratings from financial analysts</p>
            </div>

            <PageInfo
                useCase="Helps Tanzanian investors make informed decisions using expert opinions and target prices."
                funFact="Analyst ratings can significantly affect short-term stock prices as they influence investor sentiment."
            />

            <div className="grid gap-6">
                {analystRatings.map((rating, index) => {
                    const stock = getStockBySymbol(rating.symbol)
                    return (
                        <Card key={`${rating.symbol}-${index}`} className="overflow-hidden transition-all hover:border-gold/50">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex flex-col items-center justify-center bg-muted/30 p-6 md:w-48">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
                                            <UserCheck className="h-8 w-8" />
                                        </div>
                                        <p className="mt-3 text-center font-bold text-foreground">{rating.analyst}</p>
                                        <p className="text-xs text-muted-foreground">{rating.firm}</p>
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center p-6">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-foreground">{rating.symbol}</h3>
                                                    <Badge className={getRatingColor(rating.rating)}>{rating.rating}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{stock?.name}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 md:text-right">
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Target Price</p>
                                                    <p className="text-lg font-bold text-gold">{formatCurrency(rating.targetPrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Price</p>
                                                    <p className="text-lg font-bold">{stock ? formatCurrency(stock.price) : "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <p className="text-xs text-muted-foreground md:text-right">Updated: {rating.date}</p>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/dashboard/stock/${rating.symbol}`}>
                                                        Analysis <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
