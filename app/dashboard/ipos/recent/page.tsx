"use client"

import { formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Rocket, Calendar, Building2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function RecentIPOsPage() {
    const { ipoList } = useMarketData()
    const recentIpos = ipoList.filter(i => i.status === "recent")

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Recent IPOs</h1>
                <p className="text-muted-foreground">Companies that have recently gone public</p>
            </div>

            <PageInfo
                useCase="Supports investors interested in new listings on the DSE, providing data on recent market entries."
                funFact="Many IPOs experience strong price movements on their first trading day as the market discovers their value."
            />

            <div className="grid gap-6 md:grid-cols-2">
                {recentIpos.map((ipo) => (
                    <Card key={ipo.symbol} className="overflow-hidden transition-all hover:border-gold/50">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                        <Rocket className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{ipo.symbol}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{ipo.name}</p>
                                    </div>
                                </div>
                                <Badge className="bg-success/10 text-success border-success/20">Listed</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">IPO Price</p>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(ipo.price)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Listing Date</p>
                                    <p className="text-lg font-bold text-foreground">{ipo.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Cap</p>
                                    <p className="text-sm font-medium">{formatNumber(ipo.marketCap)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Exchange</p>
                                    <p className="text-sm font-medium">{ipo.exchange}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
