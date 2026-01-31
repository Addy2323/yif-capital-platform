"use client"

import { use } from "react"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp,
    TrendingDown,
    Star,
    Bell,
    Download,
    Share2,
    Crown,
    ArrowLeft,
    Layers,
    Info,
    BarChart3,
    PieChart,
    History,
} from "lucide-react"
import Link from "next/link"

export default function ETFDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = use(params)
    const { user } = useAuth()
    const { getEtfBySymbol } = useMarketData()
    const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

    const etf = getEtfBySymbol(symbol)

    if (!etf) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <h1 className="text-2xl font-bold text-foreground">ETF Not Found</h1>
                <p className="mt-2 text-muted-foreground">The symbol "{symbol}" was not found.</p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard/etfs/screener">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to ETF Screener
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/dashboard/etfs/screener">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to ETF Screener
                </Link>
            </Button>

            {/* ETF Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-foreground">{etf.symbol}</h1>
                            <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                                {etf.category}
                            </Badge>
                        </div>
                        <p className="mt-1 text-lg text-muted-foreground">{etf.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Watchlist
                    </Button>
                    <Button variant="outline" size="sm">
                        <Bell className="mr-2 h-4 w-4" />
                        Alert
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Price Info */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap items-baseline gap-4">
                            <span className="text-4xl font-bold text-foreground">{formatCurrency(etf.price)}</span>
                            <span
                                className={`flex items-center gap-1 text-xl font-semibold ${etf.changePercent >= 0 ? "text-success" : "text-error"
                                    }`}
                            >
                                {etf.changePercent >= 0 ? (
                                    <TrendingUp className="h-5 w-5" />
                                ) : (
                                    <TrendingDown className="h-5 w-5" />
                                )}
                                {etf.changePercent >= 0 ? "+" : ""}
                                {etf.changePercent.toFixed(2)}%
                            </span>
                        </div>

                        {/* Performance Metrics */}
                        <div className="mt-8">
                            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Performance Metrics</h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {etf.performance.map((p) => (
                                    <div key={p.period} className="rounded-lg bg-muted/30 p-3 text-center">
                                        <p className="text-xs text-muted-foreground">{p.period}</p>
                                        <p className={`mt-1 font-bold ${p.return >= 0 ? "text-success" : "text-error"}`}>
                                            {p.return >= 0 ? "+" : ""}{p.return}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isPro && (
                            <div className="mt-6 rounded-lg bg-gold/10 p-4">
                                <div className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-gold" />
                                    <span className="font-medium text-foreground">Upgrade to Pro for deep analysis</span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get full historical NAV data, benchmark comparisons, and detailed holdings.
                                </p>
                                <Button asChild size="sm" className="mt-3 bg-gold text-navy hover:bg-gold/90">
                                    <Link href="/pricing">Upgrade Now</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Key Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fund Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Expense Ratio", value: `${etf.expenseRatio}%` },
                                { label: "Provider", value: etf.provider },
                                { label: "Manager", value: etf.manager },
                                { label: "Inception Date", value: etf.inceptionDate },
                                { label: "Benchmark", value: etf.benchmark },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                                    <span className="font-medium text-foreground">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="flex flex-wrap h-auto p-1">
                    <TabsTrigger value="profile">
                        <Info className="mr-2 h-4 w-4" />
                        Fund Profile
                    </TabsTrigger>
                    <TabsTrigger value="allocation">
                        <PieChart className="mr-2 h-4 w-4" />
                        Asset Allocation
                    </TabsTrigger>
                    <TabsTrigger value="nav">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        NAV History
                    </TabsTrigger>
                    <TabsTrigger value="distributions">
                        <History className="mr-2 h-4 w-4" />
                        Distributions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Investment Objectives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {etf.objectives}
                            </p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border border-border p-4">
                                    <p className="text-sm text-muted-foreground">Fund Manager</p>
                                    <p className="mt-1 font-medium text-foreground">{etf.manager}</p>
                                </div>
                                <div className="rounded-lg border border-border p-4">
                                    <p className="text-sm text-muted-foreground">Benchmark Index</p>
                                    <p className="mt-1 font-medium text-foreground">{etf.benchmark}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="allocation" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Asset Allocation Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {etf.assetAllocation.map((item) => (
                                    <div key={item.category} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-foreground">{item.category}</span>
                                            <span className="text-muted-foreground">{item.weight}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-blue-500 transition-all"
                                                style={{ width: `${item.weight}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nav" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Historical NAV Data</CardTitle>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium text-right">Net Asset Value (NAV)</th>
                                            <th className="p-4 font-medium text-right">Daily Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {etf.navHistory.map((point, idx) => (
                                            <tr key={idx} className="border-b border-border last:border-0">
                                                <td className="p-4 text-sm">{point.date}</td>
                                                <td className="p-4 text-right text-sm font-medium">{formatCurrency(point.nav)}</td>
                                                <td className="p-4 text-right text-sm text-success">
                                                    {idx < etf.navHistory.length - 1 ? (
                                                        `${((point.nav / etf.navHistory[idx + 1].nav - 1) * 100).toFixed(2)}%`
                                                    ) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="distributions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dividend / Distribution History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {etf.dividendHistory ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                                <th className="p-4 font-medium">Ex-Dividend Date</th>
                                                <th className="p-4 font-medium text-right">Amount (TZS)</th>
                                                <th className="p-4 font-medium text-right">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {etf.dividendHistory.map((div, idx) => (
                                                <tr key={idx} className="border-b border-border last:border-0">
                                                    <td className="p-4 text-sm">{div.date}</td>
                                                    <td className="p-4 text-right text-sm font-medium">{formatCurrency(div.amount)}</td>
                                                    <td className="p-4 text-right text-sm">Cash Dividend</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-lg bg-muted/50 p-8 text-center">
                                    <p className="text-muted-foreground">No distribution history available for this fund.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
