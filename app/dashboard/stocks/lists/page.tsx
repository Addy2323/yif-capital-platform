"use client"

import { dseStocks, formatCurrency, formatNumber } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { ListChecks, TrendingUp, DollarSign, Activity, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StockListsPage() {
    const mostTraded = [...dseStocks].sort((a, b) => b.volume - a.volume).slice(0, 5)
    const highDividend = [...dseStocks].filter(s => s.dividend).sort((a, b) => (b.dividend || 0) - (a.dividend || 0)).slice(0, 5)
    const topPerforming = [...dseStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)

    const ListTable = ({ stocks }: { stocks: typeof dseStocks }) => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                        <th className="p-4 font-medium">Symbol</th>
                        <th className="p-4 font-medium text-right">Price</th>
                        <th className="p-4 font-medium text-right">Change</th>
                        <th className="p-4 font-medium text-right">Metric</th>
                        <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock) => (
                        <tr key={stock.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                            <td className="p-4">
                                <Link href={`/dashboard/stock/${stock.symbol}`} className="block">
                                    <p className="font-medium text-foreground hover:text-gold">{stock.symbol}</p>
                                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                                </Link>
                            </td>
                            <td className="p-4 text-right font-medium">{formatCurrency(stock.price)}</td>
                            <td className={`p-4 text-right font-medium ${stock.changePercent >= 0 ? "text-success" : "text-error"}`}>
                                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            </td>
                            <td className="p-4 text-right text-muted-foreground">
                                {stock.dividend ? `${stock.dividend}% Div` : formatNumber(stock.volume)}
                            </td>
                            <td className="p-4 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Star className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Stock Lists</h1>
                <p className="text-muted-foreground">Predefined lists of stocks based on performance and metrics</p>
            </div>

            <PageInfo
                useCase="Provides quick access to high-interest stocks on the DSE, helping investors spot opportunities faster."
                funFact="Dividend stocks are popular among long-term investors for providing a steady stream of passive income."
            />

            <Tabs defaultValue="most-traded" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="most-traded">Most Traded</TabsTrigger>
                    <TabsTrigger value="high-dividend">High Dividend</TabsTrigger>
                    <TabsTrigger value="top-performing">Top Performing</TabsTrigger>
                </TabsList>

                <Card className="mt-6">
                    <TabsContent value="most-traded" className="m-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4 text-gold" />
                                Most Traded Stocks
                            </CardTitle>
                            <CardDescription>Stocks with the highest trading volume today</CardDescription>
                        </CardHeader>
                        <ListTable stocks={mostTraded} />
                    </TabsContent>

                    <TabsContent value="high-dividend" className="m-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-4 w-4 text-success" />
                                High Dividend Stocks
                            </CardTitle>
                            <CardDescription>Companies with the highest dividend yields</CardDescription>
                        </CardHeader>
                        <ListTable stocks={highDividend} />
                    </TabsContent>

                    <TabsContent value="top-performing" className="m-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                Top Performing Stocks
                            </CardTitle>
                            <CardDescription>Stocks with the highest price increase today</CardDescription>
                        </CardHeader>
                        <ListTable stocks={topPerforming} />
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    )
}
