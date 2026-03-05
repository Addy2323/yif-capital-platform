"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Building2,
    BarChart3,
    DollarSign,
    Activity,
    Layers,
    PieChart,
    Percent,
    RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StockDetail {
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
    sharesOut: number | null
    averageVolume: number | null
    beta: number | null
    rsi: number | null
    description: string | null
    sector: string | null
    industry: string | null
    scrapedAt: string
}

type DetailTab = "overview" | "financials" | "dividends" | "valuation"

function formatNumber(num: number): string {
    const abs = Math.abs(num)
    if (abs >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (abs >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (abs >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (abs >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
}

function formatLargeNumber(num: number): string {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function StockDetailPage() {
    const params = useParams()
    const router = useRouter()
    const symbol = (params.symbol as string)?.toUpperCase()

    const [stock, setStock] = useState<StockDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<DetailTab>("overview")

    useEffect(() => {
        if (!symbol) return
        fetchStock()
    }, [symbol])

    async function fetchStock() {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/v1/stocks/${symbol}`)
            const data = await res.json()
            if (!data.success) throw new Error(data.error)
            setStock(data.data)
        } catch (err: any) {
            setError(err.message || "Failed to load stock data")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <RefreshCw className="w-8 h-8 text-primary/50" />
                </motion.div>
            </div>
        )
    }

    if (error || !stock) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-lg text-muted-foreground">{error || "Stock not found"}</p>
                <button
                    onClick={() => router.push("/stocks")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                >
                    Back to Stocks
                </button>
            </div>
        )
    }

    const isPositive = stock.changePct >= 0

    const overviewStats = [
        { label: "Market Cap", value: stock.marketCap ? formatNumber(stock.marketCap) : "—", icon: Building2 },
        { label: "Volume", value: stock.volume ? formatLargeNumber(stock.volume) : "—", icon: BarChart3 },
        { label: "Revenue (ttm)", value: stock.revenue ? formatNumber(stock.revenue) : "—", icon: DollarSign },
        { label: "Avg Volume", value: stock.averageVolume ? formatLargeNumber(stock.averageVolume) : "—", icon: Activity },
        { label: "Net Income", value: stock.netIncome ? formatNumber(stock.netIncome) : "—", icon: TrendingUp },
        { label: "Shares Out", value: stock.sharesOut ? formatLargeNumber(stock.sharesOut) : "—", icon: Layers },
        { label: "EPS", value: stock.eps ? stock.eps.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—", icon: DollarSign },
        { label: "PE Ratio", value: stock.peRatio ? stock.peRatio.toFixed(2) : "—", icon: PieChart },
        { label: "Dividend", value: stock.dps ? `${stock.dps.toFixed(2)} (${stock.dividendYield?.toFixed(2) || "—"}%)` : "—", icon: Percent },
        { label: "Beta", value: stock.beta ? stock.beta.toFixed(5) : "—", icon: Activity },
        { label: "RSI", value: stock.rsi ? stock.rsi.toFixed(2) : "—", icon: BarChart3 },
        { label: "Payout Ratio", value: stock.payoutRatio ? `${stock.payoutRatio.toFixed(2)}%` : "—", icon: PieChart },
    ]

    const performanceMetrics = [
        { label: "1W", value: stock.change1w },
        { label: "1M", value: stock.change1m },
        { label: "6M", value: stock.change6m },
        { label: "YTD", value: stock.ytdChange },
        { label: "1Y", value: stock.change1y },
        { label: "3Y", value: stock.change3y },
        { label: "5Y", value: stock.change5y },
    ]

    const financialMetrics = [
        { label: "Market Cap", value: stock.marketCap ? formatNumber(stock.marketCap) : "—" },
        { label: "Revenue", value: stock.revenue ? formatNumber(stock.revenue) : "—" },
        { label: "Operating Income", value: stock.operatingIncome ? formatNumber(stock.operatingIncome) : "—" },
        { label: "Net Income", value: stock.netIncome ? formatNumber(stock.netIncome) : "—" },
        { label: "FCF", value: stock.fcf ? formatNumber(stock.fcf) : "—" },
        { label: "FCF/Share", value: stock.fcfPerShare ? stock.fcfPerShare.toFixed(2) : "—" },
        { label: "EPS", value: stock.eps ? stock.eps.toLocaleString() : "—" },
        { label: "ROE", value: stock.roe ? `${stock.roe.toFixed(2)}%` : "—" },
        { label: "ROA", value: stock.roa ? `${stock.roa.toFixed(2)}%` : "—" },
        { label: "Debt/Equity", value: stock.debtToEquity ? stock.debtToEquity.toFixed(2) : "—" },
    ]

    const dividendMetrics = [
        { label: "Dividend Per Share", value: stock.dps ? stock.dps.toFixed(2) : "—" },
        { label: "Dividend Yield", value: stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : "—" },
        { label: "Payout Ratio", value: stock.payoutRatio ? `${stock.payoutRatio.toFixed(2)}%` : "—" },
        { label: "Dividend Growth", value: stock.dividendGrowth !== null && stock.dividendGrowth !== undefined ? `${stock.dividendGrowth.toFixed(2)}%` : "—", isChange: true, changeValue: stock.dividendGrowth },
        { label: "Payout Frequency", value: stock.payoutFrequency || "—" },
    ]

    const valuationMetrics = [
        { label: "PE Ratio", value: stock.peRatio ? stock.peRatio.toFixed(2) : "—" },
        { label: "PS Ratio", value: stock.psRatio ? stock.psRatio.toFixed(2) : "—" },
        { label: "PB Ratio", value: stock.pbRatio ? stock.pbRatio.toFixed(2) : "—" },
        { label: "ROE", value: stock.roe ? `${stock.roe.toFixed(2)}%` : "—" },
        { label: "ROA", value: stock.roa ? `${stock.roa.toFixed(2)}%` : "—" },
        { label: "Debt/Equity", value: stock.debtToEquity ? stock.debtToEquity.toFixed(2) : "—" },
    ]

    return (
        <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push("/stocks")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Stocks
            </motion.button>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            {stock.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                                DAR:{stock.symbol}
                            </span>
                            {stock.sector && (
                                <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                                    {stock.sector}
                                </span>
                            )}
                            {stock.industry && (
                                <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                                    {stock.industry}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
                            Delayed Price · Currency is TZS
                        </p>
                        <p className="text-xs text-muted-foreground/50">
                            Last updated: {new Date(stock.scrapedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-4 flex-wrap">
                    <span className="text-5xl md:text-6xl font-black tracking-tight tabular-nums text-foreground">
                        {Number(stock.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <div className={`flex items-center gap-2 text-lg font-bold tabular-nums ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        <span>{stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-sm ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            {isPositive ? "+" : ""}{stock.changePct.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Overview Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
            >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {overviewStats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.03 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <stat.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 mb-0.5">
                                            {stat.label}
                                        </p>
                                        <p className="text-sm font-bold text-foreground font-mono">
                                            {stat.value}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tabbed Sections */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* Tab Buttons */}
                <div className="flex bg-muted/30 p-1.5 rounded-t-2xl border-x border-t border-border/50 overflow-x-auto hide-scrollbar w-max max-w-full">
                    {(["overview", "financials", "dividends", "valuation"] as DetailTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${activeTab === tab
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <Card className="rounded-t-none border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-5">Performance</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                    {performanceMetrics.map((metric) => {
                                        const val = metric.value
                                        const isPos = val !== null && val !== undefined && val >= 0
                                        return (
                                            <div
                                                key={metric.label}
                                                className="bg-muted/30 rounded-xl p-4 text-center border border-border/30"
                                            >
                                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 mb-2">
                                                    {metric.label}
                                                </p>
                                                <p className={`text-lg font-black font-mono tabular-nums ${val !== null && val !== undefined
                                                    ? isPos
                                                        ? "text-emerald-500"
                                                        : "text-red-500"
                                                    : "text-muted-foreground/40"
                                                    }`}>
                                                    {val !== null && val !== undefined
                                                        ? `${isPos ? "+" : ""}${val.toFixed(2)}%`
                                                        : "—"}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* About Section */}
                                <div className="mt-8 pt-6 border-t border-border/30">
                                    <h3 className="text-lg font-bold text-foreground mb-3">
                                        About {stock.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {stock.description ||
                                            `${stock.name} (${stock.symbol}) is listed on the Dar es Salaam Stock Exchange (DSE)${stock.sector ? ` in the ${stock.sector} sector` : ""}${stock.industry ? `, specifically in ${stock.industry}` : ""}. The stock is currently trading at TZS ${Number(stock.price).toLocaleString()} with a market capitalization of ${stock.marketCap ? formatNumber(stock.marketCap) : "N/A"}.`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Financials Tab */}
                        {activeTab === "financials" && (
                            <div className="space-y-0 divide-y divide-border/30">
                                {financialMetrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="flex items-center justify-between py-4"
                                    >
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {metric.label}
                                        </span>
                                        <span className="text-sm font-bold font-mono text-foreground">
                                            {metric.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dividends Tab */}
                        {activeTab === "dividends" && (
                            <div className="space-y-0 divide-y divide-border/30">
                                {dividendMetrics.map((metric: any) => (
                                    <div
                                        key={metric.label}
                                        className="flex items-center justify-between py-4"
                                    >
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {metric.label}
                                        </span>
                                        <span className={`text-sm font-bold font-mono ${metric.isChange && metric.changeValue !== null
                                            ? metric.changeValue >= 0
                                                ? "text-emerald-500"
                                                : "text-red-500"
                                            : "text-foreground"
                                            }`}>
                                            {metric.isChange && metric.changeValue !== null && metric.changeValue >= 0 ? "+" : ""}
                                            {metric.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Valuation Tab */}
                        {activeTab === "valuation" && (
                            <div className="space-y-0 divide-y divide-border/30">
                                {valuationMetrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="flex items-center justify-between py-4"
                                    >
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {metric.label}
                                        </span>
                                        <span className="text-sm font-bold font-mono text-foreground">
                                            {metric.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
