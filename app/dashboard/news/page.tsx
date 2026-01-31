"use client"

import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Newspaper, ExternalLink, Globe, Building2, TrendingUp, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewsPage() {
  const { newsList } = useMarketData()
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "market": return TrendingUp
      case "company": return Building2
      case "economy": return Globe
      default: return BarChart3
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">News</h1>
        <p className="text-muted-foreground">Financial and market-related news</p>
      </div>

      <PageInfo
        useCase="Access Tanzanian financial news and international market updates to stay informed about factors affecting your investments."
        funFact="Negative news often has a stronger market impact than positive news, a phenomenon known as negativity bias."
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="economy">Economy</TabsTrigger>
        </TabsList>

        {["all", "market", "company", "economy"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <div className="grid gap-6">
              {newsList
                .filter(n => tab === "all" || n.category === tab)
                .map((news) => {
                  const Icon = getCategoryIcon(news.category)
                  return (
                    <Card key={news.id} className="overflow-hidden transition-all hover:border-gold/50">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex flex-col items-center justify-center bg-muted/30 p-6 md:w-24">
                            <Icon className="h-6 w-6 text-gold" />
                          </div>
                          <div className="flex flex-1 flex-col justify-center p-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Badge variant="outline" className={
                                news.category === "market" ? "border-gold/50 text-gold" :
                                  news.category === "company" ? "border-blue-500/50 text-blue-500" :
                                    news.category === "economy" ? "border-green-500/50 text-green-500" :
                                      "border-purple-500/50 text-purple-500"
                              }>
                                {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
                              </Badge>
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
                  )
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
