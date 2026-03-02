"use client"

import { exchanges } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Building2, Clock, MapPin, Globe } from "lucide-react"

export default function StockExchangesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Stock Exchanges</h1>
                <p className="text-muted-foreground">Information about local and global stock markets</p>
            </div>

            <PageInfo
                useCase="Educates users about local and global stock markets, helping them understand where they can invest."
                funFact="The DSE was officially established in 1996."
            />

            <div className="grid gap-6 md:grid-cols-2">
                {exchanges.map((exchange) => (
                    <Card key={exchange.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">{exchange.name}</CardTitle>
                                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                                    {exchange.id}
                                </span>
                            </div>
                            <CardDescription>{exchange.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Location:</span>
                                    <span className="text-muted-foreground">{exchange.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Timezone:</span>
                                    <span className="text-muted-foreground">{exchange.timezone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Trading Hours:</span>
                                    <span className="text-muted-foreground">{exchange.hours}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
