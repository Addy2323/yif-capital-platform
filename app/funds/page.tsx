"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FundCard, FundCardSkeleton } from "@/components/funds/fund-card"
import { MobileFundsView } from "@/components/funds/mobile-funds-view"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Database } from "lucide-react"
import type { Fund, FundType } from "@/lib/types/funds"
import { FUND_TYPE_CONFIG } from "@/lib/types/funds"

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFunds() {
      try {
        const response = await fetch("/api/v1/funds")
        const result = await response.json()

        if (result.success) {
          setFunds(result.data)
          setLastUpdated(result.metadata.last_updated_at)
        } else {
          setError(result.error || "Failed to load funds")
        }
      } catch (err) {
        setError("An error occurred while fetching funds")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFunds()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  // Filter and sort funds
  const filteredFunds = funds
    .filter((fund) => {
      const matchesSearch =
        searchQuery === "" ||
        fund.fund_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.manager_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === "all" || fund.fund_type === selectedType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "aum":
          return (b.aum || 0) - (a.aum || 0)
        case "return_1y":
          return (b.return_1y || 0) - (a.return_1y || 0)
        case "nav":
          return (b.current_nav || 0) - (a.current_nav || 0)
        default:
          return a.fund_name.localeCompare(b.fund_name)
      }
    })

  // Get unique fund types for filter
  const fundTypes = [...new Set(funds.map((f) => f.fund_type))]

  return (
    <>
      {/* Mobile Layout */}
      <MobileFundsView funds={funds} isLoading={isLoading} error={error} />

      {/* Desktop Layout */}
      <div className="min-h-screen bg-background/95 hidden md:block">
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden bg-slate-950 py-20 mb-12"
        >
          {/* Abstract background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-blue-500/10 blur-[100px] rounded-full" />
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary-foreground/80 bg-primary/5 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              Platform Overview
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
              Professional <span className="text-primary italic">Fund</span> Analytics
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Access real-time performance data and historical NAV tracking for Tanzania's leading investment funds.
            </p>
          </div>
        </motion.div>

        <div className="container mx-auto py-4 px-4 max-w-7xl">
          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-card/40 p-4 rounded-2xl border border-border/40 backdrop-blur-sm sticky top-4 z-40 shadow-sm"
          >
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                placeholder="Filter by fund name or manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-background/40 border-border/40 h-11 focus-visible:ring-primary/20 rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Fund Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48 bg-background/40 border-border/40 h-11 rounded-xl">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                    <SelectValue placeholder="All Types" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  {fundTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {FUND_TYPE_CONFIG[type as FundType]?.label || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 bg-background/40 border-border/40 h-11 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="name">Alphabetical</SelectItem>
                  <SelectItem value="aum">AUM High</SelectItem>
                  <SelectItem value="return_1y">1Y Return</SelectItem>
                  <SelectItem value="nav">NAV Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-8 px-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60"
          >
            <p>
              Showing <span className="text-foreground">{filteredFunds.length}</span> of{" "}
              <span className="text-foreground">{funds.length}</span> results
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-primary/60" />
                Sync: {new Date(lastUpdated).toLocaleDateString()}
              </div>
            )}
          </motion.div>

          {/* Funds Grid */}
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {[...Array(6)].map((_, i) => (
                  <FundCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : filteredFunds.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/40"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-semibold">No results found for your filters.</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedType("all") }}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pb-20"
              >
                {filteredFunds.map((fund) => (
                  <FundCard key={fund.fund_id} fund={fund} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 bg-muted/30 rounded-2xl p-8 border border-border/50"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Automated Data System</h3>
                <p className="text-muted-foreground text-sm">
                  Our platform delivers regularly refreshed NAV and pricing information through a secure
                  and fully automated process, ensuring dependable and timely data for informed
                  investment decisions.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-background rounded-lg border border-border/50 text-xs font-bold flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  LIVE UPDATES
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

