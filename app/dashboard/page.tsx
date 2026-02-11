"use client"

import { useAuth } from "@/lib/auth-context"
import { indices, formatCurrency, formatNumber } from "@/lib/market-data"
import { useMarketData } from "@/lib/admin-data-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Briefcase,
  GraduationCap,
  Crown,
  Lightbulb,
  Globe,
  Target,
  Layers,
} from "lucide-react"
import Link from "next/link"
import { MarketTable } from "@/components/dashboard/market-table"

export default function DashboardPage() {
  const { user } = useAuth()
  const { stocks, etfList, ipoList, newsList } = useMarketData()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in the market today
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* {!isPro && (
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )} */}
        </div>
      </div>

      {/* Tanzania Use Case & Fun Fact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gold/20 bg-gold/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gold">
              <Globe className="h-4 w-4" />
              Tanzania Market Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Assess the market before trading on the Dar es Salaam Stock Exchange (DSE) or international markets.
              Track local giants like CRDB and NMB alongside global equities.
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-500">
              <Lightbulb className="h-4 w-4" />
              Did You Know?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dashboards reduce decision-making time by more than 30%. Stay informed and act faster.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Summary Tiles - Hidden as per request */}
      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        ...
      </div> */}

      {/* Indices */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {indices.map((index) => (
          <Card key={index.name}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {index.value.toLocaleString()}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-sm font-medium ${index.changePercent >= 0 ? "text-success" : "text-error"
                    }`}
                >
                  {index.changePercent >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {index.changePercent >= 0 ? "+" : ""}
                  {index.changePercent.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Hidden as per request */}
      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ...
      </div> */}

      {/* Market Movers & News - Hidden as per request */}
      {/* <div className="grid gap-8 lg:grid-cols-2">
        ...
      </div> */}
    </div>
  )
}
