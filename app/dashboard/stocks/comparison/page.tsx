"use client"

import { useState } from "react"
import Link from "next/link"
import { dseStocks, formatCurrency, formatNumber, getStockBySymbol } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { ArrowLeftRight, Plus, X, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ComparisonToolPage() {
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["CRDB", "NMB"])

    const addStock = (symbol: string) => {
        if (selectedSymbols.length < 4 && !selectedSymbols.includes(symbol)) {
            setSelectedSymbols([...selectedSymbols, symbol])
        }
    }

    const removeStock = (symbol: string) => {
        setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol))
    }

    const selectedStocks = selectedSymbols.map(symbol => getStockBySymbol(symbol)).filter(Boolean)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Comparison Tool</h1>
                    <p className="text-muted-foreground">Compare two or more stocks side-by-side</p>
                </div>
                {selectedSymbols.length < 4 && (
                    <div className="w-full sm:w-64">
                        <Select onValueChange={addStock}>
                            <SelectTrigger>
                                <Plus className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Add stock to compare" />
                            </SelectTrigger>
                            <SelectContent>
                                {dseStocks
                                    .filter(s => !selectedSymbols.includes(s.symbol))
                                    .map((s) => (
                                        <SelectItem key={s.symbol} value={s.symbol}>
                                            {s.symbol} - {s.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <PageInfo
                useCase="Investors can compare local banks such as CRDB vs NMB to make better investment decisions."
                funFact="Comparative analysis improves investment accuracy by highlighting relative strengths and weaknesses."
            />

            {selectedStocks.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {selectedStocks.map((stock) => stock && (
                        <Card key={stock.symbol} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeStock(stock.symbol)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <CardHeader>
                                <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Price</p>
                                    <p className="text-xl font-bold">{formatCurrency(stock.price)}</p>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                        {stock.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Market Cap</span>
                                        <span className="font-medium">{formatNumber(stock.marketCap)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">P/E Ratio</span>
                                        <span className="font-medium">{stock.pe || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Dividend</span>
                                        <span className="font-medium">{stock.dividend ? `${stock.dividend}%` : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sector</span>
                                        <span className="font-medium">{stock.sector}</span>
                                    </div>
                                </div>

                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/dashboard/stock/${stock.symbol}`}>View Details</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                    <ArrowLeftRight className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No stocks selected</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Select at least one stock to start comparing
                    </p>
                </Card>
            )}
        </div>
    )
}
