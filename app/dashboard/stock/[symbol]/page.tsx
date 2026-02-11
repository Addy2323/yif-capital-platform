"use client"

import { use } from "react"
import { useAuth } from "@/lib/auth-context"
import { generatePriceHistory, formatCurrency, formatNumber, earningsCalendar } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Star,
  Bell,
  Download,
  Share2,
  Crown,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { MarketChart } from "@/components/dashboard/market-chart"
import { MarketStats } from "@/components/dashboard/market-stats"
import { MarketTable } from "@/components/dashboard/market-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params)
  const { user } = useAuth()
  const { stocks, getStockBySymbol } = useMarketData()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  const stock = getStockBySymbol(symbol)
  const priceHistory = generatePriceHistory(stock?.price || 1000, 30)
  const router = useRouter()

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 15)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)
  const topMovers = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 3)

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="text-2xl font-bold text-foreground">Stock Not Found</h1>
        <p className="mt-2 text-muted-foreground">The symbol "{symbol}" was not found.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/market">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Market
          </Link>
        </Button>
      </div>
    )
  }

  const maxPrice = Math.max(...priceHistory.map((p) => p.price))
  const minPrice = Math.min(...priceHistory.map((p) => p.price))

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/market">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Market
        </Link>
      </Button>

      {/* Header with Selector */}
      <div className="flex flex-col gap-6">
        <div className="w-full max-w-xs">
          <Select
            defaultValue={stock.symbol}
            onValueChange={(value) => router.push(`/dashboard/stock/${value}`)}
          >
            <SelectTrigger className="w-full bg-white border-gray-200">
              <SelectValue placeholder="Select Stock" />
            </SelectTrigger>
            <SelectContent>
              {stocks.map((s) => (
                <SelectItem key={s.symbol} value={s.symbol}>
                  {s.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h1 className="text-xl font-bold uppercase text-gray-700">
            {stock.name.toUpperCase()}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <MarketStats
                current={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                open={stock.price}
                high={maxPrice}
                low={minPrice}
              />

              <div className="mt-8 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                <MarketChart data={priceHistory} height={450} />
              </div>
            </CardContent>
          </Card>

          {/* Tabs and other info */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="flex flex-wrap h-auto p-1 bg-gray-100/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="corporate-actions">Corporate Actions</TabsTrigger>
              <TabsTrigger value="trading-stats">Trading Stats</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {stock.description || `${stock.name} is a publicly traded company listed on the Dar es Salaam Stock Exchange (DSE) in the ${stock.sector} sector.`}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Sector</p>
                        <p className="mt-1 font-medium text-foreground">{stock.sector}</p>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="mt-1 font-medium text-foreground">{stock.industry || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Listing Date</p>
                        <p className="mt-1 font-medium text-foreground">{stock.listingDate || "N/A"}</p>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Exchange</p>
                        <p className="mt-1 font-medium text-foreground">DSE - Dar es Salaam Stock Exchange</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {earningsCalendar.filter(e => e.symbol === stock.symbol).length > 0 ? (
                        earningsCalendar.filter(e => e.symbol === stock.symbol).map((event, idx) => (
                          <div key={idx} className="rounded-lg border border-border p-4">
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                            <p className="mt-1 font-medium text-foreground">{event.period} Earnings</p>
                            <p className="text-sm text-muted-foreground">Est: {event.estimate}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No upcoming earnings events.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financials" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Financial Statements</CardTitle>
                  {isPro ? (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="bg-gold text-navy hover:bg-gold/90">
                      <Link href="/contact">
                        <Crown className="mr-2 h-4 w-4" />
                        Inquire for Full Data
                      </Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-8 text-center">
                    <p className="text-muted-foreground">
                      {isPro
                        ? "Financial data coming soon. We're working on integrating comprehensive financial statements."
                        : "Upgrade to Pro to access detailed financial statements, ratios, and historical data."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="corporate-actions" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Dividend History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stock.dividendHistory ? (
                      <div className="space-y-4">
                        {stock.dividendHistory.map((div, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                            <div>
                              <p className="font-medium text-foreground">TZS {div.amount}</p>
                              <p className="text-xs text-muted-foreground">{div.date}</p>
                            </div>
                            <span className="text-xs font-medium text-success">Paid</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No dividend history available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Corporate Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stock.corporateActions ? (
                      <div className="space-y-4">
                        {stock.corporateActions.map((action, idx) => (
                          <div key={idx} className="rounded-lg border border-border p-4">
                            <div className="flex items-center justify-between">
                              <span className="rounded bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                                {action.type}
                              </span>
                              <span className="text-xs text-muted-foreground">{action.date}</span>
                            </div>
                            <p className="mt-2 text-sm text-foreground">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent corporate actions.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trading-stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Trading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: "Market Capitalization", value: formatNumber(stock.marketCap) },
                      { label: "Free Float", value: stock.freeFloat || "N/A" },
                      { label: "Average Traded Volume", value: formatNumber(stock.avgVolume || stock.volume) },
                      { label: "52 Week High", value: formatCurrency(stock.high52w) },
                      { label: "52 Week Low", value: formatCurrency(stock.low52w) },
                      { label: "P/E Ratio", value: stock.pe?.toFixed(2) || "N/A" },
                      { label: "Dividend Yield", value: stock.dividend ? `${stock.dividend}%` : "N/A" },
                      { label: "Current Volume", value: formatNumber(stock.volume) },
                    ].map((stat, idx) => (
                      <div key={idx} className="rounded-lg bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Latest News</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground">2026-01-23</p>
                      <h4 className="mt-1 font-medium text-foreground">{stock.name} Reports Q4 Results</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The company announced its fourth quarter results, showing continued growth in key metrics.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground">2026-01-15</p>
                      <h4 className="mt-1 font-medium text-foreground">Annual General Meeting Scheduled</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {stock.name} has scheduled its AGM for next month to discuss dividend distributions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MarketTable
            title="GAINERS AND LOSERS"
            data={topGainers}
            variant="gainers"
          />
          <MarketTable
            title="GAINERS AND LOSERS"
            data={topLosers}
            variant="losers"
          />
          <MarketTable
            title="MOVERS"
            data={topMovers}
            variant="movers"
          />
        </div>
      </div>
    </div>
  )
}
