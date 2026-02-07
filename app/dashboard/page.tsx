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
} from "lucide-react"
import Link from "next/link"
import { MarketTable } from "@/components/dashboard/market-table"

export default function DashboardPage() {
  const { user } = useAuth()
  const { stocks, etfList, ipoList, newsList } = useMarketData()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in the market today
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isPro && (
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tanzania Use Case & Fun Fact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gold/20 bg-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gold">
              <Globe className="h-4 w-4" />
              Tanzania Market Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Assess the market before trading on the Dar es Salaam Stock Exchange (DSE) or international markets.
              Track local giants like CRDB and NMB alongside global equities.
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-500">
              <Lightbulb className="h-4 w-4" />
              Did You Know?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dashboards reduce decision-making time by more than 30%. Stay informed and act faster.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Summary Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stocks Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Stocks (DSE)</p>
              <BarChart3 className="h-4 w-4 text-gold" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">{stocks.length}</span>
              <span className="ml-2 text-xs text-success font-medium">Listed</span>
            </div>
          </CardContent>
        </Card>

        {/* ETFs Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">ETFs</p>
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">{etfList.length}</span>
              <span className="ml-2 text-xs text-success font-medium">Available</span>
            </div>
          </CardContent>
        </Card>

        {/* IPOs Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Recent IPOs</p>
              <Target className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">
                {ipoList.filter(i => i.status === "recent").length}
              </span>
              <span className="ml-2 text-xs text-success font-medium">New Listings</span>
            </div>
          </CardContent>
        </Card>

        {/* Market Sentiment */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Market Sentiment</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">Bullish</span>
              <span className="ml-2 text-xs text-success font-medium">+0.87%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indices */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {indices.map((index) => (
          <Card key={index.name}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {index.value.toLocaleString()}
                </span>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group cursor-pointer transition-all hover:border-gold/50">
          <Link href="/dashboard/market">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Market Overview</h3>
                <p className="text-sm text-muted-foreground">View all DSE stocks</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-all hover:border-gold/50">
          <Link href={isPro ? "/dashboard/portfolio" : "/pricing"}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  {isPro ? "Track your holdings" : "Upgrade to Pro"}
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-all hover:border-gold/50">
          <Link href="/academy">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Academy</h3>
                <p className="text-sm text-muted-foreground">Continue learning</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Market Movers & News */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Movers */}
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            <MarketTable
              title="Gainers and Losers"
              data={topGainers}
              variant="gainers"
            />
            <MarketTable
              title="Gainers and Losers"
              data={topLosers}
              variant="losers"
            />
          </div>
          <MarketTable
            title="Movers"
            data={topGainers.slice(0, 3)}
            variant="movers"
          />
        </div>

        {/* News */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Market News</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/news">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newsList.map((news) => (
                <div
                  key={news.id}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-xs text-muted-foreground">{news.date}</p>
                  <h4 className="mt-1 font-medium text-foreground leading-snug">{news.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${news.category === "market"
                        ? "bg-gold/10 text-gold"
                        : news.category === "company"
                          ? "bg-blue-500/10 text-blue-500"
                          : news.category === "economy"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                    >
                      {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">{news.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
