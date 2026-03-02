"use client"

import { formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Calendar, Clock, Building2, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function IPOCalendarPage() {
    const { ipoList } = useMarketData()
    const upcomingIpos = ipoList.filter(i => i.status === "upcoming")

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">IPO Calendar</h1>
                <p className="text-muted-foreground">Upcoming Initial Public Offerings</p>
            </div>

            <PageInfo
                useCase="Helps Tanzanian investors prepare for new investment opportunities on the DSE."
                funFact="IPO dates can sometimes shift due to regulatory approvals or market conditions."
            />

            {upcomingIpos.length > 0 ? (
                <div className="space-y-4">
                    {upcomingIpos.map((ipo) => (
                        <Card key={ipo.symbol} className="overflow-hidden transition-all hover:border-gold/50">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="flex flex-col items-center justify-center bg-gold/5 p-6 sm:w-32">
                                        <span className="text-sm font-medium text-gold">
                                            {new Date(ipo.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-bold text-gold">
                                            {new Date(ipo.date).getDate()}
                                        </span>
                                        <span className="text-xs text-gold/70">
                                            {new Date(ipo.date).getFullYear()}
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center p-6">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-foreground">{ipo.name}</h3>
                                                    <Badge variant="outline" className="border-gold/50 text-gold">Upcoming</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{ipo.exchange} Listing</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 md:text-right">
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Expected Price</p>
                                                    <p className="text-lg font-bold">{formatCurrency(ipo.price)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Shares Offered</p>
                                                    <p className="text-lg font-bold">{formatNumber(ipo.shares)}</p>
                                                </div>
                                            </div>

                                            <Button variant="outline" size="sm">
                                                Set Reminder
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No upcoming IPOs</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check back later for new listing announcements
                    </p>
                </Card>
            )}
        </div>
    )
}
