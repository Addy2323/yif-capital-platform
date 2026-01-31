"use client"

import { dseStocks, indices, formatCurrency, formatNumber } from "@/lib/market-data"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketTable } from "@/components/dashboard/market-table"

export function MarketOverviewSection() {
  const topGainers = [...dseStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4)
  const topLosers = [...dseStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4)

  return (
    <section className="border-b border-border bg-muted/50 py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Indices */}
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
          {indices.map((index) => (
            <div key={index.name} className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{index.value.toLocaleString()}</span>
                  <span
                    className={`flex items-center gap-0.5 text-sm font-medium ${index.changePercent >= 0 ? "text-success" : "text-error"
                      }`}
                  >
                    {index.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {index.changePercent >= 0 ? "+" : ""}
                    {index.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Movers */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <MarketTable
            title="Top Gainers"
            data={topGainers}
            variant="gainers"
          />
          <MarketTable
            title="Top Losers"
            data={topLosers}
            variant="losers"
          />
        </div>
      </div>
    </section>
  )
}
