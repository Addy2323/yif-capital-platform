"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PageInfo } from "@/components/dashboard/page-info"
import { Search, Filter, Layers, Star, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ETFScreenerPage() {
    const { etfList } = useMarketData()
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [provider, setProvider] = useState("all")

    const categories = [...new Set(etfList.map((e) => e.category))]
    const providers = [...new Set(etfList.map((e) => e.provider))]

    const filteredEtfs = etfList.filter((etf) => {
        const matchesSearch = etf.symbol.toLowerCase().includes(search.toLowerCase()) ||
            etf.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === "all" || etf.category === category
        const matchesProvider = provider === "all" || etf.provider === provider

        return matchesSearch && matchesCategory && matchesProvider
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">ETF Screener</h1>
                <p className="text-muted-foreground">Filter and discover Exchange-Traded Funds</p>
            </div>

            <PageInfo
                useCase="Provides diversified investment options for Tanzanian investors, allowing them to invest in baskets of stocks."
                funFact="One ETF can represent hundreds of different stocks, providing instant diversification."
            />

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Symbol or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select value={provider} onValueChange={setProvider}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Providers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Providers</SelectItem>
                                    {providers.map((p) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>Results ({filteredEtfs.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">ETF</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium text-right">Price</th>
                                    <th className="p-4 font-medium text-right">Change</th>
                                    <th className="p-4 font-medium text-right">Expense Ratio</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEtfs.map((etf) => (
                                    <tr key={etf.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <Link href={`/dashboard/etf/${etf.symbol}`} className="flex items-center gap-3 group">
                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground group-hover:text-gold transition-colors">{etf.symbol}</p>
                                                    <p className="text-xs text-muted-foreground">{etf.name}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                                                {etf.category}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(etf.price)}</td>
                                        <td className={`p-4 text-right font-medium ${etf.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {etf.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-muted-foreground">
                                            {etf.expenseRatio}%
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEtfs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No ETFs match your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
