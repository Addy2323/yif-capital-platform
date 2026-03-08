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
          <CardContent className="p-4 md:p-6">
            {/* Index Value Row */}
            <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-6">
              <div className="flex items-center gap-3">
                {marketSummary.changePercent >= 0 ? (
                  <TrendingUp className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
                ) : (
                  <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-red-600 dark:border-t-red-500" />
                )}
                <span className="text-4xl md:text-5xl font-light text-gray-800 dark:text-gray-100 tabular-nums tracking-tight">
                  {marketSummary.indexValue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1 md:mt-0">
                <span className={`text-lg md:text-xl font-medium ${marketSummary.changePercent >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}`}>
                  {marketSummary.changePercent >= 0 ? "+" : ""}{marketSummary.change} ({marketSummary.changePercent >= 0 ? "+" : ""}{marketSummary.changePercent}%)
                </span>
              </div>
            </div>

            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
               <span>DSE ALL SHARE INDEX <span className="text-gray-400 dark:text-gray-500 font-normal capitalize">| {marketSummary.date}</span></span>
            </div>

            {/* Performance Grid */}
            <div className="bg-[#e4ecec] dark:bg-[#202938] rounded flex w-full mb-6 divide-x divide-white/50 dark:divide-black/20 overflow-hidden shadow-sm">
                <div className="flex-1 py-1.5 px-1 md:px-2 text-center">
                    <div className="font-bold text-gray-600 dark:text-gray-300 uppercase text-[10px] md:text-xs mb-0.5 md:mb-1">1M</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs md:text-sm">{marketSummary.perf1M}</div>
                </div>
                <div className="flex-1 py-1.5 px-1 md:px-2 text-center">
                    <div className="font-bold text-gray-600 dark:text-gray-300 uppercase text-[10px] md:text-xs mb-0.5 md:mb-1">3M</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs md:text-sm">{marketSummary.perf3M}</div>
                </div>
                <div className="flex-1 py-1.5 px-1 md:px-2 text-center bg-[#dbdbdb] dark:bg-[#1f2937]/50">
                    <div className="font-bold text-gray-700 dark:text-gray-200 uppercase text-[10px] md:text-xs mb-0.5 md:mb-1">YTD</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs md:text-sm">{marketSummary.perfYTD}</div>
                </div>
                <div className="flex-1 py-1.5 px-1 md:px-2 text-center">
                    <div className="font-bold text-gray-600 dark:text-gray-300 uppercase text-[10px] md:text-xs mb-0.5 md:mb-1">1Y</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs md:text-sm">{marketSummary.perf1Y}</div>
                </div>
                <div className="flex-1 py-1.5 px-1 md:px-2 text-center">
                    <div className="font-bold text-gray-600 dark:text-gray-300 uppercase text-[10px] md:text-xs mb-0.5 md:mb-1">2Y</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs md:text-sm">{marketSummary.perf2Y}</div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Market Summary</h3>
            
            {/* Market Stats Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:gap-x-8 text-sm md:text-base">
                <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Value Traded (TZS)</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.valueTraded}</div>
                </div>
                <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                     <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Volume</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.volume}</div>
                </div>
                 <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Transactions</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.transactions}</div>
                </div>
                 <div className="border-b border-gray-200 dark:border-white/10 pb-2">
                     <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Market Cap. (Bln TZS)</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{marketSummary.marketCap}</div>
                </div>
            </div>
             <div className="text-right mt-2 text-xs text-gray-400 dark:text-gray-500">
                {marketSummary.date}
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
