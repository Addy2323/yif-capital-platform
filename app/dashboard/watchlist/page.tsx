"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getStockBySymbol, getAllStocks, type Stock } from "@/lib/market-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Star,
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Trash2,
  ExternalLink,
  Bell,
  BellOff,
  Globe,
  Lightbulb,
} from "lucide-react"

const WATCHLIST_KEY = "yif_watchlist"

interface WatchlistItem {
  symbol: string
  addedAt: string
  alertEnabled: boolean
  targetPrice?: number
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [stockData, setStockData] = useState<Record<string, Stock>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allStocks, setAllStocks] = useState<Stock[]>([])

  useEffect(() => {
    // Load watchlist from localStorage
    const stored = localStorage.getItem(WATCHLIST_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as WatchlistItem[]
      setWatchlist(parsed)

      // Fetch stock data for watchlist
      const data: Record<string, Stock> = {}
      for (const item of parsed) {
        const stock = getStockBySymbol(item.symbol)
        if (stock) data[item.symbol] = stock
      }
      setStockData(data)
    }

    // Get all stocks for search
    setAllStocks(getAllStocks())
  }, [])

  const saveWatchlist = (newWatchlist: WatchlistItem[]) => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist))
    setWatchlist(newWatchlist)
  }

  const addToWatchlist = (symbol: string) => {
    if (watchlist.some((item) => item.symbol === symbol)) return

    const newItem: WatchlistItem = {
      symbol,
      addedAt: new Date().toISOString(),
      alertEnabled: false,
    }

    const stock = getStockBySymbol(symbol)
    if (stock) {
      setStockData({ ...stockData, [symbol]: stock })
    }

    saveWatchlist([...watchlist, newItem])
    setIsDialogOpen(false)
    setSearchQuery("")
  }

  const removeFromWatchlist = (symbol: string) => {
    saveWatchlist(watchlist.filter((item) => item.symbol !== symbol))
  }

  const toggleAlert = (symbol: string) => {
    saveWatchlist(
      watchlist.map((item) =>
        item.symbol === symbol ? { ...item, alertEnabled: !item.alertEnabled } : item
      )
    )
  }

  const filteredStocks = allStocks.filter(
    (stock) =>
      (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !watchlist.some((item) => item.symbol === stock.symbol)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="text-muted-foreground">Track stocks you are interested in</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
              <DialogDescription>
                Search for a stock to add to your watchlist
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredStocks.slice(0, 10).map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => addToWatchlist(stock.symbol)}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">TZS {stock.price.toLocaleString()}</div>
                      <div className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
                {filteredStocks.length === 0 && searchQuery && (
                  <div className="py-8 text-center text-muted-foreground">
                    No stocks found matching your search
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tanzania Use Case & Fun Fact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gold/20 bg-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gold">
              <Globe className="h-4 w-4" />
              Tanzania Use Case
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track local stocks such as CRDB, NMB, and TCC, alongside global equities in one place.
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-500">
              <Lightbulb className="h-4 w-4" />
              Fun Fact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Over 70% of traders rely on watchlists before placing trades. Don't trade blind.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-gold" />
            Your Watchlist
          </CardTitle>
          <CardDescription>
            {watchlist.length} {watchlist.length === 1 ? "stock" : "stocks"} in your watchlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Your watchlist is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add stocks to your watchlist to track their performance
              </p>
              <Button
                className="mt-4 bg-gold text-navy hover:bg-gold/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Symbol</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Change</th>
                    <th className="pb-3 font-medium">Volume</th>
                    <th className="pb-3 font-medium">Market Cap</th>
                    <th className="pb-3 font-medium">Alert</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((item) => {
                    const stock = stockData[item.symbol]
                    if (!stock) return null

                    return (
                      <tr key={item.symbol} className="border-b last:border-0">
                        <td className="py-4">
                          <Link href={`/dashboard/stock/${item.symbol}`} className="group">
                            <div className="flex items-center gap-2 font-medium group-hover:text-gold">
                              {item.symbol}
                              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <div className="text-sm text-muted-foreground">{stock.name}</div>
                          </Link>
                        </td>
                        <td className="py-4 font-medium">TZS {stock.price.toLocaleString()}</td>
                        <td className="py-4">
                          <div className={`flex items-center gap-1 ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {(stock.volume / 1000).toFixed(0)}K
                        </td>
                        <td className="py-4 text-muted-foreground">
                          TZS {(stock.marketCap / 1e9).toFixed(1)}B
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleAlert(item.symbol)}
                            className={item.alertEnabled ? "text-gold" : "text-muted-foreground"}
                          >
                            {item.alertEnabled ? (
                              <Bell className="h-4 w-4" />
                            ) : (
                              <BellOff className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromWatchlist(item.symbol)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {watchlist.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const best = watchlist.reduce((best, item) => {
                  const stock = stockData[item.symbol]
                  const bestStock = stockData[best?.symbol || ""]
                  if (!stock) return best
                  if (!bestStock || stock.changePercent > bestStock.changePercent) {
                    return item
                  }
                  return best
                }, watchlist[0])
                const stock = stockData[best?.symbol || ""]
                if (!stock) return null
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      +{stock.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Worst Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const worst = watchlist.reduce((worst, item) => {
                  const stock = stockData[item.symbol]
                  const worstStock = stockData[worst?.symbol || ""]
                  if (!stock) return worst
                  if (!worstStock || stock.changePercent < worstStock.changePercent) {
                    return item
                  }
                  return worst
                }, watchlist[0])
                const stock = stockData[worst?.symbol || ""]
                if (!stock) return null
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <Badge variant="destructive">
                      {stock.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const active = watchlist.reduce((active, item) => {
                  const stock = stockData[item.symbol]
                  const activeStock = stockData[active?.symbol || ""]
                  if (!stock) return active
                  if (!activeStock || stock.volume > activeStock.volume) {
                    return item
                  }
                  return active
                }, watchlist[0])
                const stock = stockData[active?.symbol || ""]
                if (!stock) return null
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <Badge variant="secondary">
                      {(stock.volume / 1000).toFixed(0)}K vol
                    </Badge>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
