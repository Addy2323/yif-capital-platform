"use client"

import { useState, useEffect } from "react"

import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { dseStocks, indices, marketNews, formatCurrency, formatNumber } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3,
  LineChart,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const topGainers = [...dseStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topVolume = [...dseStocks].sort((a, b) => b.volume - a.volume).slice(0, 5)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="relative border-b border-border bg-navy py-16 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/logo%20payment/background/Professional%20Market%20Analytics.png"
                alt="Background"
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-navy/60" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
              <ScrollAnimation animation="slide-up" className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold">
                  <Activity className="h-4 w-4" />
                  YIF Analytics
                </div>
                <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
                  Professional Market Analytics
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-white/70">
                  Real-time data, advanced charting, and comprehensive research tools for the Tanzanian capital markets.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild className="bg-gold text-navy hover:bg-gold/90">
                    <Link href="/register">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Live Indices */}
          <section className="border-b border-border bg-muted/30 py-6">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
                {indices.map((index) => (
                  <div key={index.name} className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">
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
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {mounted ? new Date().toLocaleTimeString() : "--:--:--"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              {/* Search */}
              <div className="mb-8">
                <div className="relative max-w-xl">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search stocks, funds, bonds..."
                    className="h-14 pl-12 text-lg"
                  />
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Stock List */}
                <ScrollAnimation animation="slide-right" className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-gold" />
                        All DSE Securities
                      </CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/market">Full View</Link>
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border text-left text-sm text-muted-foreground">
                              <th className="p-4 font-medium">Symbol</th>
                              <th className="p-4 font-medium text-right">Price</th>
                              <th className="p-4 font-medium text-right">Change</th>
                              <th className="hidden p-4 font-medium text-right md:table-cell">
                                Volume
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dseStocks.map((stock) => (
                              <tr
                                key={stock.symbol}
                                className="border-b border-border transition-colors hover:bg-muted/50"
                              >
                                <td className="p-4">
                                  <p className="font-medium text-foreground">{stock.symbol}</p>
                                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                                </td>
                                <td className="p-4 text-right font-medium">
                                  {formatCurrency(stock.price)}
                                </td>
                                <td className="p-4 text-right">
                                  <span
                                    className={`flex items-center justify-end gap-1 font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"
                                      }`}
                                  >
                                    {stock.changePercent >= 0 ? (
                                      <TrendingUp className="h-4 w-4" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4" />
                                    )}
                                    {stock.changePercent >= 0 ? "+" : ""}
                                    {stock.changePercent.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="hidden p-4 text-right text-muted-foreground md:table-cell">
                                  {formatNumber(stock.volume)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimation>

                {/* Sidebar */}
                <ScrollAnimation animation="slide-left" className="space-y-6">
                  {/* Top Gainers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-success" />
                        Top Gainers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {topGainers.map((stock) => (
                          <div
                            key={stock.symbol}
                            className="flex items-center justify-between rounded-lg p-2 hover:bg-muted"
                          >
                            <div>
                              <p className="font-medium text-foreground">{stock.symbol}</p>
                              <p className="text-xs text-muted-foreground">{stock.sector}</p>
                            </div>
                            <p className="text-sm font-medium text-success">
                              +{stock.changePercent.toFixed(2)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Volume */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5 text-gold" />
                        Most Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {topVolume.map((stock) => (
                          <div
                            key={stock.symbol}
                            className="flex items-center justify-between rounded-lg p-2 hover:bg-muted"
                          >
                            <div>
                              <p className="font-medium text-foreground">{stock.symbol}</p>
                              <p className="text-xs text-muted-foreground">{stock.sector}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(stock.volume)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* News */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Latest News</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {marketNews.slice(0, 3).map((news) => (
                          <div
                            key={news.id}
                            className="border-b border-border pb-4 last:border-0 last:pb-0"
                          >
                            <p className="text-xs text-muted-foreground">{news.date}</p>
                            <h4 className="mt-1 font-medium text-foreground leading-snug line-clamp-2">
                              {news.title}
                            </h4>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              </div>
            </div>
          </section>

          {/* Features CTA */}
          <section className="border-t border-border bg-muted/30 py-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <ScrollAnimation animation="slide-up" className="text-center">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Unlock Advanced Analytics
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Get real-time data, advanced charting, stock screener, and more with Pro.
                </p>
                <Button size="lg" asChild className="mt-8 bg-gold text-navy hover:bg-gold/90">
                  <Link href="/pricing">
                    View Pricing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </ScrollAnimation>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
