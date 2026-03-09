"use client"

import { useAuth } from "@/lib/auth-context"
import { indices, formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Briefcase,
  GraduationCap,
  Crown,
  Lightbulb,
  Globe,
  Target,
  Layers,
  Search,
  Newspaper,
  Calendar,
  Activity
} from "lucide-react"
import Link from "next/link"
import { MarketTable } from "@/components/dashboard/market-table"

export default function DashboardPage() {
  const { user } = useAuth()
  const { stocks, etfList, ipoList, newsList, marketSummary } = useMarketData()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return (
    <div className="space-y-8">
      {/* African Markets DSE Redesign */}
      {marketSummary ? (
        <Card className="border border-white/10 bg-[#f8f6f0] dark:bg-[#1a1c23] shadow-lg rounded-none">
          <CardHeader className="pb-4 pt-4 px-4 md:pt-6 md:px-6 border-b border-gray-200 dark:border-white/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl rounded shadow-sm border border-gray-100 overflow-hidden" aria-label="Tanzania Flag">🇹🇿</span>
              <CardTitle className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Dar es Salaam Stock Exchange
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Indices Summary Bar — Trend (matching dse.co.tz) */}
            <div className="border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between px-4 md:px-6 pt-3 pb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest border-b-2 border-emerald-600 dark:border-emerald-500 pb-1">Trend</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Market Summary : {marketSummary.date || "—"}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-white/10">
                {/* Tanzania Share Index */}
                <div className="px-3 md:px-4 py-3">
                  <div className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tanzania Share Index</div>
                  <div className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {marketSummary.tsiValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
                  </div>
                  {marketSummary.tsiChange != null && (
                    <div className={`text-xs md:text-sm font-medium mt-0.5 flex items-center gap-1 ${marketSummary.tsiChange >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                      {marketSummary.tsiChange >= 0 ? "↑" : "↓"} {Math.abs(marketSummary.tsiChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                {/* DSE All Share Index */}
                <div className="px-3 md:px-4 py-3">
                  <div className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">DSE All Share Index</div>
                  <div className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {marketSummary.indexValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs md:text-sm font-medium mt-0.5 flex items-center gap-1 ${marketSummary.change >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                    {marketSummary.change >= 0 ? "↑" : "↓"} {Math.abs(marketSummary.change).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Banks, Finance & Investments Index */}
                <div className="px-3 md:px-4 py-3">
                  <div className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Banks, Finance & Investments</div>
                  <div className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {marketSummary.bfiValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
                  </div>
                  {marketSummary.bfiChange != null && (
                    <div className={`text-xs md:text-sm font-medium mt-0.5 flex items-center gap-1 ${marketSummary.bfiChange >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                      {marketSummary.bfiChange >= 0 ? "↑" : "↓"} {Math.abs(marketSummary.bfiChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                {/* Industrial & Allied Index */}
                <div className="px-3 md:px-4 py-3">
                  <div className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Industrial & Allied Index</div>
                  <div className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {marketSummary.iaValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "—"}
                  </div>
                  {marketSummary.iaChange != null && (
                    <div className={`text-xs md:text-sm font-medium mt-0.5 flex items-center gap-1 ${marketSummary.iaChange >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                      {marketSummary.iaChange >= 0 ? "↑" : "↓"} {Math.abs(marketSummary.iaChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Market Summary Stats */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 md:gap-x-8 text-sm md:text-base">
                <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Market Cap</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.marketCap || "—"}</div>
                </div>
                <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Volume</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.volume || "—"}</div>
                </div>
                <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Deals</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.deals || marketSummary.transactions || "—"}</div>
                </div>
                <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Turn Over</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.turnOver || marketSummary.valueTraded || "—"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-pulse h-64 bg-muted rounded-xl" />
      )}

      {/* Market Summary Tiles - Hidden as per request */}
      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ...
      </div> */}

      {/* Portfolio Quick Access */}
      <Card className="border-gold/20 bg-gradient-to-r from-navy/80 to-navy/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gold">
            <Briefcase className="h-5 w-5" />
            My Portfolio
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Track your stocks, funds, and bonds — all in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/portfolio">
                <Briefcase className="mr-2 h-4 w-4" />
                View Portfolio
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
              <Link href="/portfolio">
                <TrendingUp className="mr-2 h-4 w-4" />
                Track Performance
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Analysis & Economics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gold/20 bg-background hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Search className="h-5 w-5 text-emerald-500" />
              Research & Insights
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Market research and analysis reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/research">
                <Search className="mr-2 h-4 w-4" />
                Research
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-background hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Newspaper className="h-5 w-5 text-blue-500" />
              Latest Articles
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              News and educational articles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/articles">
                <Newspaper className="mr-2 h-4 w-4" />
                Read
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-background hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Globe className="h-5 w-5 text-red-500" />
              Economic Indicators
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Inflation, GDP, and CBR rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/economics">
                <Globe className="mr-2 h-4 w-4" />
                View Stats
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Hidden as per request */}
      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ...
      </div> */}

      {/* Market Movers & News - Hidden as per request */}
      {/* <div className="grid gap-8 lg:grid-cols-2">
        ...
      </div> */}
    </div>
  )
}
