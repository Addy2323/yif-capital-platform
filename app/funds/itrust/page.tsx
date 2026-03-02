"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarChart3, ArrowLeft } from "lucide-react"
import Image from "next/image"

const itrustFunds = [
    {
        id: "itrust-icash",
        name: "iCash Fund",
        category: "Money Market",
        description: "Highly liquid money market fund with returns above bank deposits."
    },
    {
        id: "itrust-igrowth",
        name: "iGrowth Fund",
        category: "Growth",
        description: "Long-term capital appreciation through diversified equity investments."
    },
    {
        id: "itrust-isave",
        name: "iSave Fund",
        category: "Savings",
        description: "Build your wealth gradually with disciplined regular contributions."
    },
    {
        id: "itrust-iincome",
        name: "iIncome Fund",
        category: "Income",
        description: "Steady income generation through dividend-paying securities."
    },
    {
        id: "itrust-imaan",
        name: "Imaan Fund",
        category: "Shariah Compliant",
        description: "Islamic finance compliant investments adhering to Shariah principles."
    },
    {
        id: "itrust-idollar",
        name: "iDollar Fund",
        category: "USD Denominated",
        description: "USD-denominated investments for currency diversification."
    }
]

export default function ITrustPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            {/* Back Link */}
            <Link href="/funds" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to all funds
            </Link>

            {/* iTrust Header */}
            <div className="mb-12">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-muted overflow-hidden">
                        <Image 
                            src="/logo payment/background/itrust.svg" 
                            alt="iTrust Finance" 
                            width={80} 
                            height={80} 
                            className="object-contain w-full h-full p-2" 
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold mb-2">iTrust Finance</h1>
                        <p className="text-muted-foreground text-lg">
                            6 expertly designed funds tailored to match your investment goals, risk tolerance, and financial needs.
                        </p>
                    </div>
                </div>
            </div>

            {/* iTrust Funds Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {itrustFunds.map((fund) => (
                    <Link key={fund.id} href={`/funds/${fund.id}`}>
                        <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl font-bold">{fund.name}</CardTitle>
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                        {fund.category}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">iTrust Finance</p>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {fund.description}
                                </p>
                                <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                                    View Performance
                                    <BarChart3 className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
