"use client"

import { useState } from "react"
import { ipos, formatCurrency, formatNumber } from "@/lib/market-data"
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
import { Search, Filter, Rocket, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function IPOScreenerPage() {
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")
    const [exchange, setExchange] = useState("all")

    const filteredIpos = ipos.filter((ipo) => {
        const matchesSearch = ipo.symbol.toLowerCase().includes(search.toLowerCase()) ||
            ipo.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = status === "all" || ipo.status === status
        const matchesExchange = exchange === "all" || ipo.exchange === exchange

        return matchesSearch && matchesStatus && matchesExchange
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">IPO Screener</h1>
                <p className="text-muted-foreground">Filter and discover Initial Public Offerings</p>
            </div>

            <PageInfo
                useCase="Helps investors identify and filter new listings based on their investment criteria."
                funFact="IPO screeners are essential tools for institutional investors to manage their pipeline of new investments."
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
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="recent">Recent</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Exchange</Label>
                            <Select value={exchange} onValueChange={setExchange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Exchanges" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Exchanges</SelectItem>
                                    <SelectItem value="DSE">DSE</SelectItem>
                                    <SelectItem value="NYSE">NYSE</SelectItem>
                                    <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>Results ({filteredIpos.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Company</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Price</th>
                                    <th className="p-4 font-medium text-right">Exchange</th>
                                    <th className="p-4 font-medium text-right">Market Cap</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIpos.map((ipo) => (
                                    <tr key={ipo.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-gold/10 text-gold">
                                                    <Rocket className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{ipo.symbol}</p>
                                                    <p className="text-xs text-muted-foreground">{ipo.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={
                                                ipo.status === "recent" ? "bg-success/10 text-success border-success/20" : "bg-gold/10 text-gold border-gold/20"
                                            }>
                                                {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(ipo.price)}</td>
                                        <td className="p-4 text-right text-muted-foreground">{ipo.exchange}</td>
                                        <td className="p-4 text-right text-muted-foreground">
                                            {formatNumber(ipo.marketCap)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredIpos.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No IPOs match your criteria
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
