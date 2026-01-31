"use client"

import { etfs } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Building2, ShieldCheck, Globe, ExternalLink, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ETFProvidersPage() {
    const providers = [...new Set(etfs.map((e) => e.provider))]

    const providerDetails: Record<string, any> = {
        "YIF Capital": {
            description: "Leading investment firm in Tanzania focusing on innovative financial products.",
            location: "Dar es Salaam, Tanzania",
            etfCount: 5,
        },
        "Standard Bank": {
            description: "Global financial institution with a strong presence in African markets.",
            location: "Johannesburg, South Africa",
            etfCount: 12,
        },
        "State Street": {
            description: "One of the world's largest asset managers and ETF providers.",
            location: "Boston, USA",
            etfCount: 140,
        },
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">ETF Providers</h1>
                <p className="text-muted-foreground">Institutions offering Exchange-Traded Funds</p>
            </div>

            <PageInfo
                useCase="Helps investors identify reputable institutions offering ETFs in the Tanzanian and global markets."
                funFact="The largest ETF providers manage trillions of dollars in assets globally."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => {
                    const details = providerDetails[provider] || {
                        description: "Financial institution providing diversified investment products.",
                        location: "Global",
                        etfCount: 2,
                    }

                    return (
                        <Card key={provider} className="flex flex-col">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">{provider}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col pt-6">
                                <p className="text-sm text-muted-foreground mb-6 flex-1">
                                    {details.description}
                                </p>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{details.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{details.etfCount} ETFs Available</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <ShieldCheck className="h-4 w-4 text-success" />
                                        <span className="text-success font-medium">Verified Provider</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">
                                    View ETFs <ExternalLink className="ml-2 h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
