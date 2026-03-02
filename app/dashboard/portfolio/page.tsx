"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getStockBySymbol, type Stock } from "@/lib/market-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface PortfolioHolding {
  symbol: string
  shares: number
  avgPrice: number
  purchaseDate: string
}

const PORTFOLIO_KEY = "yif_portfolio"

export default function PortfolioPage() {
  const { user } = useAuth()
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [stockData, setStockData] = useState<Record<string, Stock>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newHolding, setNewHolding] = useState({
    symbol: "",
    shares: "",
    avgPrice: "",
  })

  useEffect(() => {
    // Load portfolio from localStorage
    const stored = localStorage.getItem(PORTFOLIO_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as PortfolioHolding[]
      setHoldings(parsed)

      // Fetch stock data for holdings
      const data: Record<string, Stock> = {}
      for (const holding of parsed) {
        const stock = getStockBySymbol(holding.symbol)
        if (stock) data[holding.symbol] = stock
      }
      setStockData(data)
    }
  }, [])

  const saveHoldings = (newHoldings: PortfolioHolding[]) => {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(newHoldings))
    setHoldings(newHoldings)
  }

  const addHolding = () => {
    if (!newHolding.symbol || !newHolding.shares || !newHolding.avgPrice) return

    const holding: PortfolioHolding = {
      symbol: newHolding.symbol,
      shares: Number.parseFloat(newHolding.shares),
      avgPrice: Number.parseFloat(newHolding.avgPrice),
      purchaseDate: new Date().toISOString(),
    }

    const stock = getStockBySymbol(holding.symbol)
    if (stock) {
      setStockData({ ...stockData, [holding.symbol]: stock })
    }

    saveHoldings([...holdings, holding])
    setNewHolding({ symbol: "", shares: "", avgPrice: "" })
    setIsDialogOpen(false)
  }

  const removeHolding = (symbol: string) => {
    saveHoldings(holdings.filter((h) => h.symbol !== symbol))
  }

  // Calculate portfolio metrics
  const portfolioMetrics = holdings.reduce(
    (acc, holding) => {
      const stock = stockData[holding.symbol]
      if (!stock) return acc

      const currentValue = stock.price * holding.shares
      const costBasis = holding.avgPrice * holding.shares
      const gainLoss = currentValue - costBasis

      return {
        totalValue: acc.totalValue + currentValue,
        totalCost: acc.totalCost + costBasis,
        totalGainLoss: acc.totalGainLoss + gainLoss,
      }
    },
    { totalValue: 0, totalCost: 0, totalGainLoss: 0 }
  )

  const totalReturn = portfolioMetrics.totalCost > 0
    ? ((portfolioMetrics.totalGainLoss / portfolioMetrics.totalCost) * 100)
    : 0

  const availableStocks = [
    "CRDB", "NMB", "TBL", "SWIS", "TOL", "TCCL", "TWIGA", "DSE", "NICO", "MKCB"
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground">Track and manage your investment holdings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Holding</DialogTitle>
              <DialogDescription>
                Enter the details of your stock purchase
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Stock Symbol</Label>
                <Select
                  value={newHolding.symbol}
                  onValueChange={(value) => setNewHolding({ ...newHolding, symbol: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStocks.map((symbol) => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Shares</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newHolding.shares}
                  onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Average Purchase Price (TZS)</Label>
                <Input
                  type="number"
                  placeholder="2500"
                  value={newHolding.avgPrice}
                  onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                />
              </div>
              <Button onClick={addHolding} className="w-full bg-gold text-navy hover:bg-gold/90">
                Add to Portfolio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <Wallet className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              TZS {portfolioMetrics.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost Basis
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              TZS {portfolioMetrics.totalCost.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gain/Loss
            </CardTitle>
            {portfolioMetrics.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioMetrics.totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              {portfolioMetrics.totalGainLoss >= 0 ? "+" : ""}
              TZS {portfolioMetrics.totalGainLoss.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Return
            </CardTitle>
            <PieChart className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Your current stock holdings</CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No holdings yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first stock holding to start tracking your portfolio
              </p>
              <Button
                className="mt-4 bg-gold text-navy hover:bg-gold/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Holding
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Symbol</th>
                    <th className="pb-3 font-medium">Shares</th>
                    <th className="pb-3 font-medium">Avg Price</th>
                    <th className="pb-3 font-medium">Current Price</th>
                    <th className="pb-3 font-medium">Market Value</th>
                    <th className="pb-3 font-medium">Gain/Loss</th>
                    <th className="pb-3 font-medium">Return</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const stock = stockData[holding.symbol]
                    if (!stock) return null

                    const marketValue = stock.price * holding.shares
                    const costBasis = holding.avgPrice * holding.shares
                    const gainLoss = marketValue - costBasis
                    const returnPct = (gainLoss / costBasis) * 100

                    return (
                      <tr key={holding.symbol} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="font-medium">{holding.symbol}</div>
                          <div className="text-sm text-muted-foreground">{stock.name}</div>
                        </td>
                        <td className="py-4">{holding.shares.toLocaleString()}</td>
                        <td className="py-4">TZS {holding.avgPrice.toLocaleString()}</td>
                        <td className="py-4">TZS {stock.price.toLocaleString()}</td>
                        <td className="py-4 font-medium">TZS {marketValue.toLocaleString()}</td>
                        <td className="py-4">
                          <div className={`flex items-center gap-1 ${gainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {gainLoss >= 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            TZS {Math.abs(gainLoss).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant={returnPct >= 0 ? "default" : "destructive"} className={returnPct >= 0 ? "bg-green-100 text-green-700" : ""}>
                            {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHolding(holding.symbol)}
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

      {/* Pro Feature Notice */}
      {user?.subscription?.plan === "free" && (
        <Card className="border-gold/20 bg-gold/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-foreground">Unlock Advanced Portfolio Features</h3>
              <p className="text-sm text-muted-foreground">
                Get portfolio optimization, risk analysis, and tax reports with Pro
              </p>
            </div>
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/contact">Inquire About Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
