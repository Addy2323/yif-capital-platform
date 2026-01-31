"use client"

import { etfs, formatCurrency } from "@/lib/market-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { Sparkles, Calendar, Layers, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ETFNewLaunchesPage() {
  // Mock new launches (using existing ETFs for demo)
  const newLaunches = etfs.slice(0, 2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Launches</h1>
        <p className="text-muted-foreground">Newly introduced Exchange-Traded Funds</p>
      </div>

      <PageInfo 
        useCase="Keeps investors updated on the latest investment products available in the Tanzanian market."
        funFact="New ETFs often target emerging sectors or specific investment themes like ESG or Technology."
      />

      <div className="grid gap-6">
        {newLaunches.map((etf) => (
          <Card key={etf.symbol} className="overflow-hidden transition-all hover:border-gold/50">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col items-center justify-center bg-blue-500/5 p-6 md:w-48">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <Badge className="mt-3 bg-blue-500 text-white">New Launch</Badge>
                </div>
                <div className="flex flex-1 flex-col justify-center p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground">{etf.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{etf.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{etf.category}</Badge>
                        <span className="text-xs text-muted-foreground">Launched: Jan 2026</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 md:text-right">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Launch Price</p>
                        <p className="text-lg font-bold">{formatCurrency(etf.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Provider</p>
                        <p className="text-lg font-bold">{etf.provider}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      Learn More
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
