"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, User, ArrowRight, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
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
    <div className="min-h-screen bg-background/95">
      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden bg-slate-950 py-20 mb-12"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-emerald-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center">
          <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400 bg-blue-500/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
            Educational Content
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white flex items-center justify-center gap-3">
            Latest <span className="text-blue-400 italic">Articles</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Stay updated with the latest news, market trends, and educational articles to empower your investments.
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 max-w-7xl">
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
    </div>
  )
}
