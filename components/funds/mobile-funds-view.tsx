"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ChevronRight, TrendingUp, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Fund, FundType } from "@/lib/types/funds"
import { FUND_TYPE_CONFIG } from "@/lib/types/funds"
import { useState, useRef, useEffect } from "react"

interface MobileFundsViewProps {
  funds: Fund[]
  isLoading: boolean
  error: string | null
}

// Group funds by manager
function groupByManager(funds: Fund[]) {
  const map = new Map<string, { managerName: string; logoUrl: string | null | undefined; funds: Fund[] }>()
  for (const fund of funds) {
    const existing = map.get(fund.manager_name)
    if (existing) {
      existing.funds.push(fund)
    } else {
      map.set(fund.manager_name, {
        managerName: fund.manager_name,
        logoUrl: fund.logo_url,
        funds: [fund],
      })
    }
  }
  return [...map.values()].sort((a, b) => b.funds.length - a.funds.length)
}

// Get stats from funds
function getStats(funds: Fund[]) {
  const managers = groupByManager(funds)
  const topManager = managers[0]

  // Best quarterly growth (use best 1Y return as proxy)
  const bestReturn = funds.reduce((best, f) => {
    if (f.return_1y != null && (best == null || f.return_1y > best)) return f.return_1y
    return best
  }, null as number | null)

  return {
    totalFunds: funds.length,
    topManagerName: topManager?.managerName || "N/A",
    topManagerCount: topManager?.funds.length || 0,
    quarterlyGrowth: bestReturn != null ? `+${bestReturn.toFixed(1)}%` : "N/A",
  }
}

type StatsTab = "total" | "manager" | "market"

// Skeleton for loading
function MobileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-white/10 rounded" />
      <div className="h-4 w-64 bg-white/5 rounded" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function MobileFundsView({ funds, isLoading, error }: MobileFundsViewProps) {
  const [activeTab, setActiveTab] = useState<StatsTab>("total")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  if (error) {
    return (
      <div className="min-h-screen bg-navy px-4 py-8 md:hidden">
        <p className="text-white/60 text-center">{error}</p>
      </div>
    )
  }

  const query = searchQuery.toLowerCase().trim()

  // Filter funds by search
  const filteredFunds = query
    ? funds.filter(
      (f) =>
        f.fund_name.toLowerCase().includes(query) ||
        f.manager_name.toLowerCase().includes(query) ||
        (FUND_TYPE_CONFIG[f.fund_type]?.label || "").toLowerCase().includes(query)
    )
    : funds

  const stats = getStats(funds)
  const managers = groupByManager(filteredFunds)
  const topFunds = [...filteredFunds]
    .filter((f) => f.return_1y != null)
    .sort((a, b) => (b.return_1y || 0) - (a.return_1y || 0))
    .slice(0, 5)

  // Max return for progress bar scale
  const maxReturn = topFunds.reduce((m, f) => Math.max(m, Math.abs(f.return_1y || 0)), 1)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628] md:hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-emerald-400 tracking-tight">
              Tanzania Funds Insight
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                if (searchOpen) setSearchQuery("")
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <p className="text-white/50 text-xs font-medium ml-11">
          Your Guide to Investment Funds in Tanzania
        </p>

        {/* Expandable Search Bar */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            searchOpen ? "max-h-14 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
          )}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search funds, managers..."
              className="w-full h-10 pl-10 pr-4 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.08] transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-4">
          <MobileSkeleton />
        </div>
      ) : (
        <>
          {/* Stats Tabs Strip */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              {/* Total Funds Tab */}
              <button
                onClick={() => setActiveTab("total")}
                className={cn(
                  "rounded-xl p-3 text-left transition-all duration-200 border",
                  activeTab === "total"
                    ? "bg-[#1a3a6e]/80 border-blue-500/30 shadow-lg shadow-blue-500/5"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  Total Funds
                </p>
                <p className="text-2xl font-black text-white">{stats.totalFunds}</p>
                <p className="text-[10px] text-white/40 font-medium mt-0.5">Licensed Funds</p>
              </button>

              {/* Top Fund Manager Tab */}
              <button
                onClick={() => setActiveTab("manager")}
                className={cn(
                  "rounded-xl p-3 text-left transition-all duration-200 border",
                  activeTab === "manager"
                    ? "bg-[#1a3a6e]/80 border-blue-500/30 shadow-lg shadow-blue-500/5"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  Top Fund Manager
                </p>
                <div className="flex items-center gap-1.5">
                  {managers[0]?.logoUrl && (
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 shrink-0">
                      <Image
                        src={managers[0].logoUrl}
                        alt={stats.topManagerName}
                        width={20}
                        height={20}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                  <p className="text-xs font-bold text-white truncate">{stats.topManagerName.split(' ')[0]}</p>
                </div>
                <p className="text-[10px] text-white/40 font-medium mt-0.5">
                  {stats.topManagerCount} Funds
                </p>
              </button>

              {/* Market Updates Tab */}
              <button
                onClick={() => setActiveTab("market")}
                className={cn(
                  "rounded-xl p-3 text-left transition-all duration-200 border",
                  activeTab === "market"
                    ? "bg-[#1a3a6e]/80 border-blue-500/30 shadow-lg shadow-blue-500/5"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  Market Updates
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-base font-black text-white">{stats.quarterlyGrowth}</p>
                </div>
                <p className="text-[10px] text-white/40 font-medium mt-0.5">Quarterly Growth</p>
              </button>
            </div>
          </div>

          {/* Featured Fund Managers */}
          <div className="px-4 pb-4">
            <h2 className="text-sm font-bold text-white mb-3 tracking-tight">
              Featured Fund Managers
            </h2>
            <div className="space-y-2">
              {managers.slice(0, 4).map((manager) => (
                <Link
                  key={manager.managerName}
                  href={`/funds?manager=${encodeURIComponent(manager.managerName)}`}
                  className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl px-4 py-3 transition-all duration-200 group"
                >
                  {/* Manager Logo */}
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                    {manager.logoUrl ? (
                      <Image
                        src={manager.logoUrl}
                        alt={manager.managerName}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full p-1"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white/40">
                        {manager.managerName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </span>
                    )}
                  </div>

                  {/* Manager Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {manager.managerName}
                    </p>
                    <p className="text-xs text-white/40 font-medium">
                      {manager.funds.length} Fund{manager.funds.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Top Investment Funds */}
          <div className="px-4 pb-6">
            <h2 className="text-sm font-bold text-white mb-3 tracking-tight">
              Top Investment Funds
            </h2>
            <div className="space-y-2">
              {topFunds.map((fund) => {
                const typeConfig = FUND_TYPE_CONFIG[fund.fund_type]
                const returnVal = fund.return_1y || 0
                const barWidth = Math.min(Math.abs(returnVal) / maxReturn * 100, 100)

                return (
                  <Link
                    key={fund.fund_id}
                    href={`/funds/${fund.fund_id}/overview`}
                    className="block bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl px-4 py-3 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Color indicator */}
                        <div className={cn("w-1.5 h-8 rounded-full mt-0.5 shrink-0", typeConfig?.color || "bg-blue-500")} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {fund.fund_name}
                          </p>
                          <p className="text-[11px] text-white/40 font-medium">
                            {typeConfig?.label || fund.fund_type}
                          </p>
                        </div>
                      </div>

                      {/* Return Value */}
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "text-base font-black tracking-tight",
                            returnVal >= 0 ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {returnVal >= 0 ? "↑" : "↓"}{Math.abs(returnVal).toFixed(1)}%
                          <span className="text-[10px] font-bold text-white/30 ml-1">YTD</span>
                        </p>
                        {fund.current_nav != null && (
                          <p className="text-[10px] text-white/30 font-medium">
                            {fund.base_currency} {fund.current_nav.toLocaleString("en-TZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          returnVal >= 0
                            ? "bg-gradient-to-r from-emerald-500/60 to-emerald-400"
                            : "bg-gradient-to-r from-rose-500/60 to-rose-400"
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* View All Button */}
            <div className="mt-5 flex justify-center">
              <Link
                href="/funds"
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
