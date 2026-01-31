"use client"

import { useState, useMemo, useEffect } from "react"
import {
  dseStocks,
  generatePriceHistory,
  formatCurrency,
  formatNumber,
  getStockBySymbol
} from "@/lib/market-data"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Search,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Star,
  Settings2,
  X,
  Maximize2
} from "lucide-react"
import Link from "next/link"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ComposedChart,
  Cell
} from "recharts"
import { useTheme } from "next-themes"

const timeframes = [
  { value: "1d", label: "1D" },
  { value: "2d", label: "2D" },
  { value: "5d", label: "5D" },
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
]

export default function ChartsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"
  const [selectedSymbol, setSelectedSymbol] = useState(dseStocks[0].symbol)
  const [timeframe, setTimeframe] = useState("1m")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const stock = useMemo(() => getStockBySymbol(selectedSymbol) || dseStocks[0], [selectedSymbol])

  const priceHistory = useMemo(() => {
    const days = timeframe === "1d" ? 1 : timeframe === "2d" ? 2 : timeframe === "5d" ? 5 : timeframe === "1m" ? 30 : timeframe === "3m" ? 90 : timeframe === "6m" ? 180 : timeframe === "ytd" ? 120 : timeframe === "1y" ? 365 : 730
    return generatePriceHistory(stock.price, days)
  }, [stock.price, timeframe])

  // Get metrics for the info bar
  const metrics = useMemo(() => {
    const prices = priceHistory.map(p => p.price)
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      open: priceHistory[0]?.price || 0,
      close: priceHistory[priceHistory.length - 1]?.price || 0,
      vol: priceHistory.reduce((acc, p) => acc + (p.volume || 0), 0) / priceHistory.length
    }
  }, [priceHistory])

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -m-4 sm:-m-8 overflow-hidden bg-background">
      {/* Top Main Navigation / Header Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              className="pl-9 bg-muted/50 border-border h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-md border border-border">
              <span className="text-lg font-bold text-foreground">{stock.symbol}</span>
              <span className="text-sm text-muted-foreground opacity-60">|</span>
              <span className="text-sm font-medium text-foreground">{stock.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{formatCurrency(stock.price).replace('TZS', '').trim()}</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${stock.changePercent >= 0 ? "text-success" : "text-error"
                }`}>
                {stock.changePercent >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex border-border text-foreground hover:bg-muted" asChild>
            <Link href={`/dashboard/stock/${stock.symbol}`}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Exit Chart
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Sub-header Metrics Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 items-center px-4 py-1.5 border-b border-border bg-muted/20 text-[10px] sm:text-xs">
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="text-muted-foreground uppercase font-semibold">Price:</span>
          <span className="font-bold text-foreground">{metrics.close.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="text-muted-foreground uppercase font-semibold">Vol:</span>
          <span className="font-bold text-foreground">{formatNumber(metrics.vol)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="text-muted-foreground uppercase font-semibold">Open:</span>
          <span className="font-bold text-foreground">{metrics.open.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="text-muted-foreground uppercase font-semibold">High:</span>
          <span className="font-bold text-foreground">{metrics.high.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="text-muted-foreground uppercase font-semibold">Low:</span>
          <span className="font-bold text-foreground">{metrics.low.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="text-muted-foreground uppercase font-semibold">Time:</span>
          <span className="font-bold text-foreground">LIVE</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-0' : 'w-[300px] xl:w-[350px]'} transition-all duration-300 border-r border-border bg-card overflow-hidden flex flex-col relative`}>
          <div className="p-4 flex-1">
            {!user ? (
              <div className="h-full flex flex-col justify-center text-center space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Get your watchlists here</h3>
                  <p className="text-sm text-muted-foreground px-4">Log in or create a free account to see your watchlists in this sidebar. This makes it easy to quickly toggle between charts.</p>
                </div>
                <div className="space-y-3 px-6">
                  <Button className="w-full bg-gold text-navy hover:bg-gold/90 font-bold" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/10 font-bold" asChild>
                    <Link href="/register">Create Free Account</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3 flex items-center justify-between">
                    Watchlist
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
                  </h3>
                  <div className="space-y-1">
                    {dseStocks.slice(0, 8).map((s) => (
                      <button
                        key={s.symbol}
                        onClick={() => setSelectedSymbol(s.symbol)}
                        className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${selectedSymbol === s.symbol ? 'bg-muted text-gold' : 'hover:bg-muted/50 text-foreground'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Star className={`h-3.5 w-3.5 ${selectedSymbol === s.symbol ? 'fill-gold' : 'text-muted-foreground'}`} />
                          <span className="font-semibold">{s.symbol}</span>
                        </div>
                        <span className={`text-xs font-bold ${s.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                          {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-md border border-border">
              <span className="text-sm font-semibold text-muted-foreground">Theme</span>
              <div className="flex bg-muted rounded-md p-1 border border-border">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="w-full mt-4 flex items-center justify-between text-muted-foreground hover:text-foreground text-sm font-semibold group"
            >
              <span>Collapse Sidebar</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </aside>

        {/* Re-open sidebar button */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-card border border-l-0 border-border p-1 rounded-r-md z-20 hover:text-gold"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Main Content / Chart Area */}
        <main className="flex-1 flex flex-col relative min-w-0">
          {/* Chart */}
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceHistory} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#33B5FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#33B5FF" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="rgba(128,128,128,0.1)" />
                <XAxis
                  dataKey="date"
                  hide={true}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#888", fontWeight: "bold" }}
                  domain={['auto', 'auto']}
                  mirror={true}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="left"
                  hide={true}
                  domain={[0, (dataMax: number) => dataMax * 4]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(128,128,128,0.3)', strokeWidth: 1 }}
                />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#33B5FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  animationDuration={1000}
                />
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#8884d8"
                  opacity={0.3}
                  radius={[2, 2, 0, 0]}
                >
                  {priceHistory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index > 0 && priceHistory[index].price >= priceHistory[index - 1].price ? '#22C55E' : '#EF4444'}
                      strokeWidth={0}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>

            {/* Floating Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-md p-1 items-center gap-1 z-10">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-foreground"><Minus className="h-4 w-4" /></Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-foreground"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Bottom Controls / Timeframe Selector */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
            <div className="flex items-center gap-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${timeframe === tf.value
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <span>2024</span>
              <span>APR</span>
              <span>JUL</span>
              <span>OCT</span>
              <span>2025</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-3 bg-slate-950/90 backdrop-blur-md border border-white/20 rounded shadow-2xl text-white">
        <p className="text-[10px] font-bold text-white/50 mb-1">{data.date}</p>
        <div className="flex items-center justify-between gap-8 mb-1">
          <span className="text-xs font-semibold text-white/70">Price</span>
          <span className="text-sm font-bold">{data.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs font-semibold text-white/70">Volume</span>
          <span className="text-sm font-bold">{formatNumber(data.volume)}</span>
        </div>
      </div>
    )
  }
  return null
}
