"use client"

import {
  TrendingUp,
  Layers,
  Target,
  Newspaper,
  ArrowRight,
  Plus,
  Search
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { dseStocks, etfs, ipos, marketNews } from "@/lib/market-data"

export default function AdminContentPage() {
  const contentTypes = [
    {
      title: "Stocks",
      description: "Manage DSE listed companies and prices",
      icon: TrendingUp,
      count: dseStocks.length,
      href: "/admin/content/stocks",
      color: "text-gold",
      bgColor: "bg-gold/10"
    },
    {
      title: "ETFs",
      description: "Manage Exchange Traded Funds",
      icon: Layers,
      count: etfs.length,
      href: "/admin/content/etfs",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "IPOs",
      description: "Manage upcoming and recent IPOs",
      icon: Target,
      count: ipos.length,
      href: "/admin/content/ipos",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "News",
      description: "Manage market news and articles",
      icon: Newspaper,
      count: marketNews.length,
      href: "/admin/content/news",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Pricing",
      description: "Manage subscription plans and features",
      icon: Layers,
      count: 3,
      href: "/admin/content/pricing",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <p className="text-white/60">Manage all market data and news content on the platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {contentTypes.map((type) => (
          <Card key={type.title} className="bg-white/5 border-white/10 group hover:border-gold/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${type.bgColor} flex items-center justify-center ${type.color}`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{type.title}</h3>
                    <p className="text-sm text-white/60">{type.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{type.count}</p>
                  <p className="text-xs text-white/40">Items</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button asChild className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10">
                  <Link href={type.href}>
                    Manage Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="icon" className="bg-gold text-navy hover:bg-gold/90">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Search */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Content Search</CardTitle>
          <CardDescription className="text-white/60">Find any content across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by symbol, name, or title..."
              className="w-full pl-10 h-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
