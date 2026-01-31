"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageInfo } from "@/components/dashboard/page-info"
import { BookOpen, Clock, User, ArrowRight, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const articles = [
  {
    id: "1",
    title: "Understanding the Dar es Salaam Stock Exchange",
    excerpt: "A comprehensive guide to investing in Tanzania's primary stock exchange, including listing requirements and market structure.",
    author: "YIF Research Team",
    date: "2026-01-20",
    readTime: "8 min read",
    category: "Education",
  },
  {
    id: "2",
    title: "Dividend Investing: Building Passive Income",
    excerpt: "Learn how to create a dividend portfolio using DSE-listed stocks for consistent passive income.",
    author: "Investment Analyst",
    date: "2026-01-18",
    readTime: "6 min read",
    category: "Strategy",
  },
  {
    id: "3",
    title: "Technical Analysis for Beginners",
    excerpt: "An introduction to chart patterns, indicators, and technical analysis tools for Tanzanian investors.",
    author: "YIF Academy",
    date: "2026-01-15",
    readTime: "10 min read",
    category: "Education",
  },
]

export default function ArticlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Articles</h1>
        <p className="text-muted-foreground">Educational and analytical financial content</p>
      </div>

      <PageInfo 
        useCase="Improves financial literacy and investment knowledge for Tanzanian investors entering the market."
        funFact="Financial education increases long-term investment success by helping investors make informed decisions."
      />

      <div className="grid gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden transition-all hover:border-gold/50 group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-gold/50 text-gold">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 leading-snug group-hover:text-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 text-gold hover:text-gold/80 hover:bg-gold/5">
                  Read Article <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
