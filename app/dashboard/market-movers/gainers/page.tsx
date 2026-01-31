"use client"

import { formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { TrendingUp, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MarketTable } from "@/components/dashboard/market-table"

export default function TopGainersPage() {
    const { stocks } = useMarketData()
    const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Top Gainers</h1>
                <p className="text-muted-foreground">Stocks with the highest price increases today</p>
            </div>

            <PageInfo
                useCase="Identifies momentum opportunities on the DSE for active traders and swing investors."
                funFact="Stocks that rise sharply often attract further buying, a phenomenon known as momentum trading."
            />

            <MarketTable
                title="Market Gainers"
                data={topGainers}
                variant="gainers"
            />
        </div>
    )
}
