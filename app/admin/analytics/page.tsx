"use client"

import { useState, useEffect } from "react"
import {
    BarChart3,
    TrendingUp,
    Users,
    CreditCard,
    Download,
    Calendar,
    ArrowUpRight,
    PieChart,
    Activity,
    Newspaper,
    Layers
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    getAnalyticsData,
    getSubscriptionStats,
    type AnalyticsData,
    type SubscriptionStats
} from "@/lib/admin-service"
import { formatCurrency } from "@/lib/payment-service"

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [stats, setStats] = useState<SubscriptionStats | null>(null)

    useEffect(() => {
        setAnalytics(getAnalyticsData())
        setStats(getSubscriptionStats())
    }, [])

    if (!analytics || !stats) return null

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
                    <p className="text-white/60">Detailed insights into platform performance and user behavior.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF Report
                    </Button>
                </div>
            </div>

            {/* Revenue Trends */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Revenue Trends</CardTitle>
                            <CardDescription className="text-white/60">Monthly recurring revenue over the last 6 months</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gold">TZS {formatCurrency(stats.monthlyRevenue)}</p>
                            <p className="text-xs text-green-500">Current MRR</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-end justify-between gap-4 pt-12 px-2 sm:px-6">
                        {analytics.revenueByMonth.length > 0 ? (
                            analytics.revenueByMonth.map((item, i) => {
                                const max = Math.max(...analytics.revenueByMonth.map(d => d.revenue), 1)
                                const height = (item.revenue / max) * 100
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                        <div
                                            className="w-full bg-gradient-to-t from-green-500/30 to-green-400/60 hover:from-green-500/50 hover:to-green-400/80 transition-all rounded-t-sm relative shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[10px] font-bold px-3 py-2 rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap z-10 pointer-events-none">
                                                <p className="text-white/50 text-[8px] uppercase mb-0.5">{item.month} Revenue</p>
                                                <p className="text-green-400 text-xs">TZS {formatCurrency(item.revenue)}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors">{item.month}</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-white/40 italic">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* User Retention (Mock) */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">User Retention</CardTitle>
                        <CardDescription className="text-white/60">Percentage of users active after 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { label: "Free Users", value: 45, color: "bg-white/20" },
                                { label: "Pro Users", value: 82, color: "bg-gold" },
                                { label: "Institutional", value: 95, color: "bg-blue-500" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/80">{item.label}</span>
                                        <span className="text-white font-medium">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.color}`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Engagement (Mock) */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Content Engagement</CardTitle>
                        <CardDescription className="text-white/60">Most visited sections this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Stock Screener", value: "12.4k views", icon: TrendingUp },
                                { label: "Market News", value: "8.2k views", icon: Newspaper },
                                { label: "ETF Comparison", value: "5.1k views", icon: Layers },
                                { label: "Academy Courses", value: "3.9k views", icon: Activity },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4 text-gold" />
                                        <span className="text-sm text-white">{item.label}</span>
                                    </div>
                                    <span className="text-sm text-white/40">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
