"use client"

import React from "react"

import { useState } from "react"
import { indices, formatCurrency, formatNumber, type Stock } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, TrendingDown, Search, ArrowUpDown, Star } from "lucide-react"
import Link from "next/link"

type SortKey = "symbol" | "price" | "change" | "volume" | "marketCap"
type SortOrder = "asc" | "desc"

export default function MarketPage() {
  const { stocks } = useMarketData()
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("symbol")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const sectors = [...new Set(stocks.map((s) => s.sector))]

  const filteredStocks = stocks
    .filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase())
      const matchesSector = sector === "all" || stock.sector === sector
      return matchesSearch && matchesSector
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol)
          break
        case "price":
          comparison = a.price - b.price
          break
        case "change":
          comparison = a.changePercent - b.changePercent
          break
        case "volume":
          comparison = a.volume - b.volume
          break
        case "marketCap":
          comparison = a.marketCap - b.marketCap
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  const SortButton = ({ columnKey, children }: { columnKey: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(columnKey)}
      className="flex items-center gap-1 font-medium hover:text-gold"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Market Overview</h1>
        <p className="text-muted-foreground">DSE listed securities and market indices</p>
      </div>

      {/* Indices */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {indices.map((index) => (
          <Card key={index.name}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by symbol or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listed Securities ({filteredStocks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">
                    <SortButton columnKey="symbol">Symbol</SortButton>
                  </th>
                  <th className="hidden p-4 font-medium md:table-cell">Sector</th>
                  <th className="p-4 font-medium text-right">
                    <SortButton columnKey="price">Price (TZS)</SortButton>
                  </th>
                  <th className="p-4 font-medium text-right">
                    <SortButton columnKey="change">Change</SortButton>
                  </th>
                  <th className="hidden p-4 font-medium text-right lg:table-cell">
                    <SortButton columnKey="volume">Volume</SortButton>
                  </th>
                  <th className="hidden p-4 font-medium text-right xl:table-cell">
                    <SortButton columnKey="marketCap">Market Cap</SortButton>
                  </th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <Link href={`/dashboard/stock/${stock.symbol}`} className="block">
                        <p className="font-medium text-foreground hover:text-gold">
                          {stock.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </Link>
                    </td>
                    <td className="hidden p-4 md:table-cell">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">{formatCurrency(stock.price)}</td>
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
                    <td className="hidden p-4 text-right text-muted-foreground lg:table-cell">
                      {formatNumber(stock.volume)}
                    </td>
                    <td className="hidden p-4 text-right text-muted-foreground xl:table-cell">
                      {formatNumber(stock.marketCap)}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Star className="h-4 w-4" />
                        <span className="sr-only">Add to watchlist</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
