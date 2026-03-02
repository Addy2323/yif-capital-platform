"use client"

import { earningsCalendar } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Calendar, Building2, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EarningsCalendarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Earnings Calendar</h1>
                <p className="text-muted-foreground">Upcoming corporate earnings announcements</p>
            </div>

            <PageInfo
                useCase="Tracks earnings reports for Tanzanian listed companies, helping investors prepare for market volatility."
                funFact="Stock prices are often most volatile on earnings release days as markets react to financial performance."
            />

            <div className="space-y-4">
                {earningsCalendar.map((event) => (
                    <Card key={event.symbol} className="overflow-hidden transition-all hover:border-gold/50">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                                <div className="flex flex-col items-center justify-center bg-muted/50 p-6 sm:w-32">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-2xl font-bold text-foreground">
                                        {new Date(event.date).getDate()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(event.date).getFullYear()}
                                    </span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{event.symbol}</h3>
                                            <p className="text-sm text-muted-foreground">{event.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 sm:text-right">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Period</p>
                                                <p className="font-medium">{event.period}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimate</p>
                                                <p className="font-medium">{event.estimate}</p>
                                            </div>
                                        </div>
                                        <Button asChild variant="ghost" size="sm" className="w-fit">
                                            <Link href={`/dashboard/stock/${event.symbol}`}>
                                                View Stock <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
