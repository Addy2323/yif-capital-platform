"use client"

import { useState } from "react"
import { etfs, formatCurrency } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { ArrowLeftRight, Plus, X, TrendingUp, TrendingDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ETFComparisonToolPage() {
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(["TZTOP20", "AFRICA50"])

    const addEtf = (symbol: string) => {
        if (selectedSymbols.length < 4 && !selectedSymbols.includes(symbol)) {
            setSelectedSymbols([...selectedSymbols, symbol])
        }
    }

    const removeEtf = (symbol: string) => {
        setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol))
    }

    const selectedEtfs = selectedSymbols.map(symbol => etfs.find(e => e.symbol === symbol)).filter(Boolean)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">ETF Comparison Tool</h1>
                    <p className="text-muted-foreground">Compare multiple ETFs side-by-side</p>
                </div>
                {selectedSymbols.length < 4 && (
                    <div className="w-full sm:w-64">
                        <Select onValueChange={addEtf}>
                            <SelectTrigger>
                                <Plus className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Add ETF to compare" />
                            </SelectTrigger>
                            <SelectContent>
                                {etfs
                                    .filter(e => !selectedSymbols.includes(e.symbol))
                                    .map((e) => (
                                        <SelectItem key={e.symbol} value={e.symbol}>
                                            {e.symbol} - {e.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <PageInfo
                useCase="Helps investors compare different ETF options to find the best fit for their risk profile and investment goals."
                funFact="Comparing expense ratios is crucial as lower fees can significantly impact long-term returns."
            />

            {selectedEtfs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {selectedEtfs.map((etf) => etf && (
                        <Card key={etf.symbol} className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeEtf(etf.symbol)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <CardHeader>
                                <CardTitle className="text-lg">{etf.symbol}</CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-1">{etf.name}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Price</p>
                                    <p className="text-xl font-bold">{formatCurrency(etf.price)}</p>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${etf.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                        {etf.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(2)}%
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium">{etf.category}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Provider</span>
                                        <span className="font-medium">{etf.provider}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Expense Ratio</span>
                                        <span className="font-medium">{etf.expenseRatio}%</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full">
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                    <Layers className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No ETFs selected</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Select at least one ETF to start comparing
                    </p>
                </Card>
            )}
        </div>
    )
}
