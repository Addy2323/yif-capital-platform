"use client"

import { useState, useEffect } from "react"
import {
    Users,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Download,
    Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    getSubscriptionStats,
    getAnalyticsData,
    exportUsersToCSV,
    type SubscriptionStats,
    type AnalyticsData
} from "@/lib/admin-service"
import { formatCurrency } from "@/lib/payment-service"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<SubscriptionStats | null>(null)
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

    useEffect(() => {
        setStats(getSubscriptionStats())
        setAnalytics(getAnalyticsData())
    }, [])

    if (!stats || !analytics) return null

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
                    <p className="text-white/60">Welcome back to the YIF Capital control panel.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={exportUsersToCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                    <Button className="bg-gold text-navy hover:bg-gold/90">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Total Users</p>
                            <Users className="h-4 w-4 text-gold" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>12% from last month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Active Subscriptions</p>
                            <CreditCard className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-white">{stats.proUsers + stats.institutionalUsers}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>8% from last month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Monthly Revenue</p>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-white">TZS {formatCurrency(stats.monthlyRevenue)}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>15% from last month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white/60">Platform Activity</p>
                            <Activity className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold text-white">94.2%</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                                <ArrowDownRight className="h-3 w-3" />
                                <span>2% from last month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* User Growth Chart */}
                <Card className="lg:col-span-2 bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">User Growth</CardTitle>
                        <CardDescription className="text-white/60">Number of new users over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-10 px-2 sm:px-4">
                            {analytics.userGrowth.length > 0 ? (
                                analytics.userGrowth.map((day, i) => {
                                    const max = Math.max(...analytics.userGrowth.map(d => d.count), 1)
                                    const height = (day.count / max) * 100
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-gold/40 to-gold/70 hover:from-gold/60 hover:to-gold/90 transition-all rounded-t-sm relative shadow-[0_0_15px_rgba(212,160,23,0.1)] group-hover:shadow-[0_0_20px_rgba(212,160,23,0.3)] cursor-pointer"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1.5 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap z-10 pointer-events-none">
                                                    {day.count} users
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-medium text-white/40 rotate-45 sm:rotate-0 whitespace-nowrap">
                                                {day.date.split('-').slice(1).join('/')}
                                            </span>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-white/40 italic">
                                    No data available for the selected period
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Distribution */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Subscription Mix</CardTitle>
                        <CardDescription className="text-white/60">Distribution by plan type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {analytics.subscriptionDistribution.map((item) => (
                            <div key={item.plan} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/80">{item.plan}</span>
                                    <span className="text-white font-medium">{item.percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full",
                                            item.plan === "Free" ? "bg-white/20" :
                                                item.plan === "Pro" ? "bg-gold" : "bg-blue-500"
                                        )}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/40">{item.count} users</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity (Mock) */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-white/60">Latest platform events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { user: "John Doe", action: "upgraded to Pro", time: "2 minutes ago", icon: Crown },
                            { user: "Alice Smith", action: "registered a new account", time: "15 minutes ago", icon: Users },
                            { user: "System", action: "processed monthly revenue report", time: "1 hour ago", icon: Activity },
                            { user: "Bob Wilson", action: "cancelled institutional trial", time: "3 hours ago", icon: CreditCard },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <item.icon className="h-5 w-5 text-gold" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white">
                                        <span className="font-semibold">{item.user}</span> {item.action}
                                    </p>
                                    <p className="text-xs text-white/40">{item.time}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">View</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}

import { Crown } from "lucide-react"
