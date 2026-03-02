"use client"

import { formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { TrendingDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MarketTable } from "@/components/dashboard/market-table"

export default function TopLosersPage() {
    const { stocks } = useMarketData()
    const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Top Losers</h1>
                <p className="text-muted-foreground">Stocks with the largest price declines today</p>
            </div>

            <PageInfo
                useCase="Helps value investors find potentially undervalued DSE stocks during market corrections."
                funFact="Buying on dips can be profitable, but timing the market is notoriously difficult."
            />

            <MarketTable
                title="Market Losers"
                data={topLosers}
                variant="losers"
            />
        </div>
    )
}
