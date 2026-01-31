"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { FileText, Calendar, DollarSign, ArrowUpRight, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const corporateActions = [
    {
        symbol: "CRDB",
        type: "Dividend",
        description: "Final dividend of TZS 45 per share for the year ended 31 Dec 2025.",
        date: "2026-05-15",
        status: "Announced",
    },
    {
        symbol: "NMB",
        type: "Stock Split",
        description: "Proposed 2-for-1 stock split to improve liquidity.",
        date: "2026-06-20",
        status: "Proposed",
    },
    {
        symbol: "TBL",
        type: "Rights Issue",
        description: "Rights issue of 1 new share for every 5 shares held at TZS 10,000.",
        date: "2026-04-10",
        status: "Upcoming",
    },
]

export default function CorporateActionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Corporate Actions</h1>
                <p className="text-muted-foreground">Company-related events that affect shareholders</p>
            </div>

            <PageInfo
                useCase="Keeps Tanzanian investors informed about corporate decisions that impact their holdings."
                funFact="A stock split does not change a company’s total value, only the number of shares and their price."
            />

            <div className="grid gap-6">
                {corporateActions.map((action, index) => (
                    <Card key={`${action.symbol}-${index}`} className="transition-all hover:border-gold/50">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-gold/50 text-gold">
                                        {action.type}
                                    </Badge>
                                    <span className="text-sm font-bold text-foreground">{action.symbol}</span>
                                </div>
                                <Badge className={
                                    action.status === "Announced" ? "bg-success/10 text-success border-success/20" :
                                        action.status === "Proposed" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            "bg-gold/10 text-gold border-gold/20"
                                }>
                                    {action.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-foreground leading-relaxed">{action.description}</p>
                                </div>
                                <div className="flex items-center gap-6 border-t border-border pt-4 md:border-0 md:pt-0">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Effective Date</p>
                                            <p className="text-sm font-medium">{action.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold">
                                        <Info className="h-5 w-5" />
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
