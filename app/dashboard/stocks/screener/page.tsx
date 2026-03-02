"use client"

import { useState } from "react"
import { formatCurrency, formatNumber } from "@/lib/market-data"
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
import { Search, Filter, ArrowUpDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StockScreenerPage() {
    const { stocks } = useMarketData()
    const [search, setSearch] = useState("")
    const [sector, setSector] = useState("all")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")

    const sectors = [...new Set(stocks.map((s) => s.sector))]

    const filteredStocks = stocks.filter((stock) => {
        const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
            stock.name.toLowerCase().includes(search.toLowerCase())
        const matchesSector = sector === "all" || stock.sector === sector
        const matchesMinPrice = minPrice === "" || stock.price >= Number(minPrice)
        const matchesMaxPrice = maxPrice === "" || stock.price <= Number(maxPrice)

        return matchesSearch && matchesSector && matchesMinPrice && matchesMaxPrice
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Stock Screener</h1>
                <p className="text-muted-foreground">Filter and discover stocks based on your criteria</p>
            </div>

            <PageInfo
                useCase="Helps investors identify high-potential stocks listed on the DSE or foreign exchanges."
                funFact="Stock screeners originated on Wall Street trading floors in the 1980s."
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                            <Label>Sector</Label>
                            <Select value={sector} onValueChange={setSector}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Sectors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sectors</SelectItem>
                                    {sectors.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Min Price (TZS)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Max Price (TZS)</Label>
                            <Input
                                type="number"
                                placeholder="100,000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>Results ({filteredStocks.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Symbol</th>
                                    <th className="p-4 font-medium">Sector</th>
                                    <th className="p-4 font-medium text-right">Price</th>
                                    <th className="p-4 font-medium text-right">Change</th>
                                    <th className="p-4 font-medium text-right">Market Cap</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStocks.map((stock) => (
                                    <tr key={stock.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <Link href={`/dashboard/stock/${stock.symbol}`} className="block">
                                                <p className="font-medium text-foreground hover:text-gold">{stock.symbol}</p>
                                                <p className="text-sm text-muted-foreground">{stock.name}</p>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                                                {stock.sector}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(stock.price)}</td>
                                        <td className={`p-4 text-right font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-right text-muted-foreground">
                                            {formatNumber(stock.marketCap)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStocks.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No stocks match your criteria
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
