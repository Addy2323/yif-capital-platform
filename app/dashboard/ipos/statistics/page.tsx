"use client"

import { ipos, formatCurrency, formatNumber } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react"

export default function IPOStatisticsPage() {
    const recentIpos = ipos.filter(i => i.status === "recent")
    const avgReturn = 12.5 // Mock average return

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">IPO Statistics</h1>
                <p className="text-muted-foreground">Performance data and trends for past IPOs</p>
            </div>

            <PageInfo
                useCase="Provides performance data for past IPOs, helping investors understand historical trends on the DSE."
                funFact="Historical data shows that sectors like Telecommunications and Banking have had some of the most successful IPOs in Tanzania."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Avg. First Day Return</p>
                            <TrendingUp className="h-4 w-4 text-success" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-foreground">+{avgReturn}%</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Total IPOs (12m)</p>
                            <Activity className="h-4 w-4 text-gold" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-foreground">{recentIpos.length}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                            <PieChart className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-foreground">85%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Historical Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Symbol</th>
                                    <th className="p-4 font-medium text-right">IPO Price</th>
                                    <th className="p-4 font-medium text-right">Current Price</th>
                                    <th className="p-4 font-medium text-right">Total Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentIpos.map((ipo) => (
                                    <tr key={ipo.symbol} className="border-b border-border transition-colors hover:bg-muted/50">
                                        <td className="p-4">
                                            <p className="font-medium text-foreground">{ipo.symbol}</p>
                                            <p className="text-xs text-muted-foreground">{ipo.name}</p>
                                        </td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(ipo.price)}</td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(ipo.price * 1.2)}</td>
                                        <td className="p-4 text-right font-medium text-success">
                                            +20.00%
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
