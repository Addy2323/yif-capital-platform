"use client"

import { marketNews } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Newspaper, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function IPONewsPage() {
    // Filter news related to IPOs or companies
    const ipoNews = marketNews.filter(n => n.category === "company" || n.category === "market")

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">IPO News</h1>
                <p className="text-muted-foreground">Latest news and updates related to IPO activities</p>
            </div>

            <PageInfo
                useCase="Keeps investors informed about upcoming listings and regulatory changes affecting IPOs in Tanzania."
                funFact="Financial news can significantly impact the subscription rate of an IPO during its offer period."
            />

            <div className="grid gap-6">
                {ipoNews.map((news) => (
                    <Card key={news.id} className="overflow-hidden transition-all hover:border-gold/50">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex flex-1 flex-col justify-center p-6">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-gold font-medium">
                                            {news.category.toUpperCase()}
                                        </span>
                                        <span>•</span>
                                        <span>{news.date}</span>
                                        <span>•</span>
                                        <span>{news.source}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">{news.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{news.summary}</p>
                                    <Button variant="link" className="p-0 h-auto text-gold hover:text-gold/80 w-fit">
                                        Read Full Story <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
