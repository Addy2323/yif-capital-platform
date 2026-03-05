"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency, formatNumber } from "@/lib/market-data"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, SlidersHorizontal, Database, TrendingUp, TrendingDown, Info, ArrowUpDown } from "lucide-react"

export interface StockData {
    symbol: string
    name: string
    price: number
    change: number
    changePct: number
    marketCap: number | null
    volume: number | null
    revenue: number | null
    peRatio: number | null
    dividendYield: number | null
    payoutRatio: number | null
    netIncome: number | null
    eps: number | null
    ytdChange: number | null
    change1w: number | null
    change1m: number | null
    change6m: number | null
    change1y: number | null
    change3y: number | null
    change5y: number | null
    psRatio: number | null
    pbRatio: number | null
    roe: number | null
    roa: number | null
    debtToEquity: number | null
    dps: number | null
    dividendGrowth: number | null
    payoutFrequency: string | null
    operatingIncome: number | null
    fcf: number | null
    fcfPerShare: number | null
    sector: string | null
    industry: string | null
}

export default function StocksPage() {
    const router = useRouter()
    const [stocks, setStocks] = useState<StockData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters & Formatting
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSector, setSelectedSector] = useState<string>("all")
    const [sortBy, setSortBy] = useState<keyof StockData>("marketCap")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)
    const [availableSectors, setAvailableSectors] = useState<string[]>([])

    type TabView = "general" | "performance" | "analysts" | "dividends" | "financials" | "valuation"
    const [activeTab, setActiveTab] = useState<TabView>("general")

    useEffect(() => {
        async function fetchStocks() {
            try {
                const response = await fetch("/api/v1/stocks")
                const result = await response.json()

                if (result.success) {
                    setStocks(result.data)
                    setLastUpdated(result.metadata.last_updated)
                    setAvailableSectors(result.metadata.sectors || [])
                } else {
                    setError(result.error || "Failed to load stocks")
                }
            } catch (err) {
                setError("An error occurred while fetching stocks")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStocks()
    }, [])

    const handleSort = (field: keyof StockData) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("desc")
        }
    }

    // Filter and sort stocks
    const filteredStocks = useMemo(() => {
        return stocks
            .filter((stock) => {
                const matchesSearch =
                    searchQuery === "" ||
                    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    stock.name.toLowerCase().includes(searchQuery.toLowerCase())

                const matchesSector = selectedSector === "all" || stock.sector === selectedSector

                return matchesSearch && matchesSector
            })
            .sort((a, b) => {
                const aVal = a[sortBy]
                const bVal = b[sortBy]

                if (aVal === null && bVal === null) return 0
                if (aVal === null) return sortOrder === "asc" ? 1 : -1
                if (bVal === null) return sortOrder === "asc" ? -1 : 1

                if (typeof aVal === "string" && typeof bVal === "string") {
                    return sortOrder === "asc"
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal)
                }

                return sortOrder === "asc"
                    ? (aVal as number) - (bVal as number)
                    : (bVal as number) - (aVal as number)
            })
    }, [stocks, searchQuery, selectedSector, sortBy, sortOrder])

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    }

    return (
        <div className="min-h-screen bg-background/95">
            {/* Hero Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden bg-slate-950 py-20 mb-12"
            >
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-blue-500/10 blur-[100px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center">
                    <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        Live Market Data
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
                        Tanzania <span className="text-emerald-400 italic">Equities</span> Market
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Monitor all 27 listed companies on the Dar es Salaam Stock Exchange with real-time analytics and tracking.
                    </p>
                </div>
            </motion.div>

            <div className="container mx-auto py-4 px-4 max-w-7xl">
                {/* Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm"
                >
                    {/* Search */}
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search by ticker or company name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 bg-background/50 border-border/50 h-11 focus-visible:ring-emerald-500/20 rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 w-full md:w-auto">
                        {/* Sector Filter */}
                        <Select value={selectedSector} onValueChange={setSelectedSector}>
                            <SelectTrigger className="w-full sm:w-48 bg-background/50 border-border/50 h-11 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                                    <SelectValue placeholder="All Sectors" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Sectors</SelectItem>
                                {availableSectors.map((sector) => (
                                    <SelectItem key={sector} value={sector}>
                                        {sector}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Results Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between mb-6 px-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60"
                >
                    <p>
                        Showing <span className="text-foreground">{filteredStocks.length}</span> of{" "}
                        <span className="text-foreground">{stocks.length}</span> listed companies
                    </p>
                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-emerald-600/70">
                            <Database className="w-3.5 h-3.5" />
                            Live Sync: {new Date(lastUpdated).toLocaleDateString()}
                        </div>
                    )}
                </motion.div>

                {/* Data Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    {/* View Tabs */}
                    <div className="flex bg-muted/30 p-1.5 rounded-t-2xl border-x border-t border-border/50 overflow-x-auto hide-scrollbar w-max max-w-full">
                        {(['general', 'performance', 'analysts', 'dividends', 'financials', 'valuation'] as TabView[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <Card className="border-border/50 shadow-sm overflow-hidden rounded-b-2xl rounded-tr-2xl md:rounded-tr-none">
                        <CardContent className="p-0 overflow-x-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-20">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 text-red-500 font-medium">
                                    {error}
                                </div>
                            ) : filteredStocks.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-muted-foreground font-semibold">No stocks match your filters.</p>
                                </div>
                            ) : (
                                <div className="min-w-[800px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 font-bold uppercase tracking-wider text-[10px] hover:bg-muted/30">
                                                <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort('symbol')}>
                                                    <div className="flex items-center gap-1.5">
                                                        COMPANY / TICKER
                                                        {sortBy === 'symbol' && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                                                    </div>
                                                </TableHead>
                                                {activeTab === 'general' && (
                                                    <>
                                                        <TableHead className="cursor-pointer" onClick={() => handleSort('sector')}>
                                                            <div className="flex items-center gap-1.5">SECTOR {sortBy === 'sector' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                                                            <div className="flex items-center justify-end gap-1.5">PRICE (TZS) {sortBy === 'price' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('changePct')}>
                                                            <div className="flex items-center justify-end gap-1.5">CHANGE % {sortBy === 'changePct' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                                                            <div className="flex items-center justify-end gap-1.5">MARKET CAP {sortBy === 'marketCap' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('volume')}>
                                                            <div className="flex items-center justify-end gap-1.5">VOLUME {sortBy === 'volume' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('peRatio')}>
                                                            <div className="flex items-center justify-end gap-1.5 pr-4">PE RATIO {sortBy === 'peRatio' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                    </>
                                                )}
                                                {activeTab === 'performance' && (
                                                    <>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                                                            <div className="flex items-center justify-end gap-1.5">PRICE (TZS) {sortBy === 'price' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('changePct')}>
                                                            <div className="flex items-center justify-end gap-1.5">1D % {sortBy === 'changePct' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('change1w')}>
                                                            <div className="flex items-center justify-end gap-1.5">1W % {sortBy === 'change1w' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('change1m')}>
                                                            <div className="flex items-center justify-end gap-1.5">1M % {sortBy === 'change1m' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('change6m')}>
                                                            <div className="flex items-center justify-end gap-1.5">6M % {sortBy === 'change6m' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('ytdChange')}>
                                                            <div className="flex items-center justify-end gap-1.5">YTD % {sortBy === 'ytdChange' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('change1y')}>
                                                            <div className="flex items-center justify-end gap-1.5">1Y % {sortBy === 'change1y' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('change3y')}>
                                                            <div className="flex items-center justify-end gap-1.5 pr-4">3Y % {sortBy === 'change3y' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                    </>
                                                )}
                                                {activeTab === 'analysts' && (
                                                    <>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                                                            <div className="flex items-center justify-end gap-1.5">MARKET CAP {sortBy === 'marketCap' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                                                            <div className="flex items-center justify-end gap-1.5 pr-4">STOCK PRICE {sortBy === 'price' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                    </>
                                                )}
                                                {activeTab === 'dividends' && (
                                                    <>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                                                            <div className="flex items-center justify-end gap-1.5">MARKET CAP {sortBy === 'marketCap' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('dps')}>
                                                            <div className="flex items-center justify-end gap-1.5">DIV. ($) {sortBy === 'dps' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('dividendYield')}>
                                                            <div className="flex items-center justify-end gap-1.5">DIV. YIELD {sortBy === 'dividendYield' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('payoutRatio')}>
                                                            <div className="flex items-center justify-end gap-1.5">PAYOUT RATIO {sortBy === 'payoutRatio' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('dividendGrowth')}>
                                                            <div className="flex items-center justify-end gap-1.5">DIV. GROWTH {sortBy === 'dividendGrowth' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            <div className="flex items-center justify-end gap-1.5 pr-4">PAYOUT FREQ.</div>
                                                        </TableHead>
                                                    </>
                                                )}
                                                {activeTab === 'financials' && (
                                                    <>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                                                            <div className="flex items-center justify-end gap-1.5">MARKET CAP {sortBy === 'marketCap' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('revenue')}>
                                                            <div className="flex items-center justify-end gap-1.5">REVENUE {sortBy === 'revenue' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('operatingIncome')}>
                                                            <div className="flex items-center justify-end gap-1.5">OP. INCOME {sortBy === 'operatingIncome' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('netIncome')}>
                                                            <div className="flex items-center justify-end gap-1.5">NET INCOME {sortBy === 'netIncome' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('fcf')}>
                                                            <div className="flex items-center justify-end gap-1.5">FCF {sortBy === 'fcf' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('eps')}>
                                                            <div className="flex items-center justify-end gap-1.5 pr-4">EPS {sortBy === 'eps' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                    </>
                                                )}
                                                {activeTab === 'valuation' && (
                                                    <>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>
                                                            <div className="flex items-center justify-end gap-1.5">MARKET CAP {sortBy === 'marketCap' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('peRatio')}>
                                                            <div className="flex items-center justify-end gap-1.5">PE RATIO {sortBy === 'peRatio' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('psRatio')}>
                                                            <div className="flex items-center justify-end gap-1.5">PS RATIO {sortBy === 'psRatio' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('pbRatio')}>
                                                            <div className="flex items-center justify-end gap-1.5">PB RATIO {sortBy === 'pbRatio' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('roe')}>
                                                            <div className="flex items-center justify-end gap-1.5">ROE % {sortBy === 'roe' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('roa')}>
                                                            <div className="flex items-center justify-end gap-1.5">ROA % {sortBy === 'roa' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort('debtToEquity')}>
                                                            <div className="flex items-center justify-end gap-1.5 pr-4">DEBT/EQUITY {sortBy === 'debtToEquity' && <ArrowUpDown className="w-3 h-3 opacity-50" />}</div>
                                                        </TableHead>
                                                    </>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {filteredStocks.map((stock) => {
                                                    const isPositive = stock.changePct >= 0;

                                                    return (
                                                        <motion.tr
                                                            key={stock.symbol}
                                                            variants={rowVariants}
                                                            initial="hidden"
                                                            animate="show"
                                                            exit="hidden"
                                                            layout
                                                            className="group transition-colors hover:bg-muted/20 border-b border-border/40 last:border-0 cursor-pointer"
                                                            onClick={() => router.push(`/stocks/${stock.symbol}`)}
                                                        >
                                                            <TableCell className="py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-border shadow-sm flex items-center justify-center font-bold text-sm text-foreground shrink-0">
                                                                        {stock.symbol.substring(0, 2)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-bold text-foreground text-sm truncate flex items-center gap-2">
                                                                            {stock.symbol}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground truncate w-[180px]" title={stock.name}>
                                                                            {stock.name}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            {activeTab === 'general' && (
                                                                <>
                                                                    <TableCell>
                                                                        <Badge variant="secondary" className="bg-muted text-[10px] font-medium px-2 py-0.5 whitespace-nowrap">
                                                                            {stock.sector || 'Other'}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] font-medium text-foreground">
                                                                        {Number(stock.price).toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className={`inline-flex items-center justify-end gap-1 px-2.5 py-1 rounded-[6px] font-mono text-[12px] font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                                            {isPositive ? <TrendingUp className="w-3 h-3 hidden sm:block" /> : <TrendingDown className="w-3 h-3 hidden sm:block" />}
                                                                            {isPositive ? '+' : ''}{stock.changePct.toFixed(2)}%
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.marketCap ? formatNumber(stock.marketCap) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.volume ? stock.volume.toLocaleString() : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground pr-4">
                                                                        {stock.peRatio ? stock.peRatio.toFixed(2) : '—'}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            {activeTab === 'performance' && (
                                                                <>
                                                                    <TableCell className="text-right font-mono text-[13px] font-medium text-foreground">
                                                                        {Number(stock.price).toLocaleString()}
                                                                    </TableCell>
                                                                    {[
                                                                        { key: 'changePct', val: stock.changePct },
                                                                        { key: 'change1w', val: stock.change1w },
                                                                        { key: 'change1m', val: stock.change1m },
                                                                        { key: 'change6m', val: stock.change6m },
                                                                        { key: 'ytdChange', val: stock.ytdChange },
                                                                        { key: 'change1y', val: stock.change1y },
                                                                        { key: 'change3y', val: stock.change3y },
                                                                    ].map((item, idx, arr) => (
                                                                        <TableCell key={item.key} className={`text-right ${idx === arr.length - 1 ? 'pr-4' : ''}`}>
                                                                            <div className={`inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-[4px] font-mono text-[12px] font-bold ${item.val && item.val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                                {item.val !== null ? `${item.val >= 0 ? '+' : ''}${item.val.toFixed(2)}%` : '—'}
                                                                            </div>
                                                                        </TableCell>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {activeTab === 'analysts' && (
                                                                <>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.marketCap ? formatNumber(stock.marketCap) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] font-medium text-foreground pr-4">
                                                                        {Number(stock.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            {activeTab === 'dividends' && (
                                                                <>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.marketCap ? formatNumber(stock.marketCap) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.dps ? stock.dps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.payoutRatio ? `${stock.payoutRatio.toFixed(2)}%` : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className={`inline-flex items-center justify-end font-mono text-[12px] font-bold ${stock.dividendGrowth && stock.dividendGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                            {stock.dividendGrowth !== null && stock.dividendGrowth !== undefined ? `${stock.dividendGrowth >= 0 ? '+' : ''}${stock.dividendGrowth.toFixed(2)}%` : '—'}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground pr-4">
                                                                        {stock.payoutFrequency || '—'}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            {activeTab === 'financials' && (
                                                                <>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.marketCap ? formatNumber(stock.marketCap) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.revenue ? formatNumber(stock.revenue) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.operatingIncome ? formatNumber(stock.operatingIncome) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.netIncome ? formatNumber(stock.netIncome) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.fcf ? formatNumber(stock.fcf) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground pr-4">
                                                                        {stock.eps ? stock.eps.toLocaleString() : '—'}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            {activeTab === 'valuation' && (
                                                                <>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.marketCap ? formatNumber(stock.marketCap) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.peRatio ? stock.peRatio.toFixed(2) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.psRatio ? stock.psRatio.toFixed(2) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.pbRatio ? stock.pbRatio.toFixed(2) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.roe ? `${stock.roe.toFixed(2)}%` : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground">
                                                                        {stock.roa ? `${stock.roa.toFixed(2)}%` : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-mono text-[13px] text-muted-foreground pr-4">
                                                                        {stock.debtToEquity ? stock.debtToEquity.toFixed(2) : '—'}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                        </motion.tr>
                                                    )
                                                })}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-12 bg-muted/30 rounded-2xl p-6 border border-border/50"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <Info className="w-5 h-5 text-emerald-500" />
                                DSE Live Data Feed
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Stock metrics are automatically synced from the Dar es Salaam Stock Exchange daily.
                                Data includes end-of-day market caps, trading volume, and percentage changes to help
                                you track the Tanzanian equities market comprehensively.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
