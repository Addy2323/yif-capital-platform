"use client"

import { ChevronRight, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Fund, FundType } from "@/lib/types/funds"
import { TANZANIAN_SUMMARY, getManagerSlug } from "@/lib/data/tanzanian-funds"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

interface MobileFundsViewProps {
  funds: Fund[]
  isLoading: boolean
  error: string | null
}

// Category filter tabs (screenshot: Money Market, Equity, Bond Funds, Specialty Funds)
export type FundCategoryFilter = "money_market" | "equity" | "bond" | "specialty" | "all"

const CATEGORY_TABS: { key: FundCategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "money_market", label: "Money Market" },
  { key: "equity", label: "Equity Funds" },
  { key: "bond", label: "Bond Funds" },
  { key: "specialty", label: "Specialty Funds" },
]

function getCategoryLabel(fundType: FundType): string {
  if (fundType === "money_market") return "Money Market"
  if (fundType === "equity") return "Equity"
  if (fundType === "bond" || fundType === "fixed_income") return "Bond Funds"
  if (fundType === "balanced") return "Balanced"
  return "Specialty Funds"
}

function matchesCategoryFilter(fund: Fund, filter: FundCategoryFilter): boolean {
  if (filter === "all") return true
  if (filter === "money_market") return fund.fund_type === "money_market"
  if (filter === "equity") return fund.fund_type === "equity"
  if (filter === "bond") return fund.fund_type === "bond" || fund.fund_type === "fixed_income"
  if (filter === "specialty") return ["balanced", "income", "fund_family"].includes(fund.fund_type)
  return true
}

// Display name for Fund Managers list (e.g. "iTrust Finance" not "iTrust Finance Limited")
function getManagerDisplayName(name: string): string {
  if (name === "iTrust Finance Limited") return "iTrust Finance"
  return name
}

// Group funds by manager (same fund count: Orbit Securities before Tanzania Securities)
function groupByManager(funds: Fund[]) {
  const managers: Record<string, { managerName: string; logoUrl?: string; funds: Fund[] }> = {}
  funds.forEach((fund) => {
    if (!managers[fund.manager_name]) {
      managers[fund.manager_name] = {
        managerName: fund.manager_name,
        logoUrl: fund.logo_url,
        funds: [],
      }
    }
    managers[fund.manager_name].funds.push(fund)
  })
  return Object.values(managers).sort((a, b) => {
    if (b.funds.length !== a.funds.length) return b.funds.length - a.funds.length
    // When tied (e.g. both 2 funds), show Orbit Securities before Tanzania Securities Limited
    if (a.managerName === "Orbit Securities") return -1
    if (b.managerName === "Orbit Securities") return 1
    return a.managerName.localeCompare(b.managerName)
  })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function MobileFundsView({ funds, isLoading, error }: MobileFundsViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<FundCategoryFilter>("all")
  const [sortBy, setSortBy] = useState<"name" | "nav" | "return">("name")

  if (error) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 md:hidden">
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    )
  }

  const categoryFiltered = categoryFilter === "all" ? funds : funds.filter((f) => matchesCategoryFilter(f, categoryFilter))
  const sortedFunds = [...categoryFiltered].sort((a, b) => {
    if (sortBy === "return") return (b.return_1y ?? -999) - (a.return_1y ?? -999)
    if (sortBy === "nav") return (b.current_nav ?? 0) - (a.current_nav ?? 0)
    return a.fund_name.localeCompare(b.fund_name)
  })

  const managers = groupByManager(funds)
  const topPerforming = [...funds]
    .filter((f) => f.return_1y != null)
    .sort((a, b) => (b.return_1y ?? 0) - (a.return_1y ?? 0))
    .slice(0, 3)

  const totalManagers = managers.length
  const totalFunds = funds.length
  const activeFundsCount = funds.filter((f) => f.is_active).length

  return (
    <div className="min-h-screen bg-[#f5f5f5] md:hidden pb-24">
      {/* Header: YIF CAPITAL logo | Tanzanian Mutual Funds (static) | Bell */}
      <header className="bg-[#0a1628] text-white px-4 pt-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">YIF</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">CAPITAL</span>
          </Link>
          <div className="flex-1 min-w-0 flex items-center justify-center px-2">
            <span className="text-sm font-medium text-white text-center">
              Tanzanian Mutual Funds
            </span>
          </div>
          <button type="button" className="relative p-2 rounded-full hover:bg-white/10 shrink-0">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Four white metric cards - grid so last card is never cut off */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-white rounded-xl px-2 py-3 shadow-sm min-w-0">
            <p className="text-xl font-bold text-[#0a1628] truncate">{totalManagers}</p>
            <p className="text-[9px] text-gray-500 font-medium mt-0.5">Fund Managers</p>
          </div>
          <div className="bg-white rounded-xl px-2 py-3 shadow-sm min-w-0">
            <p className="text-xl font-bold text-[#0a1628] truncate">{totalFunds}</p>
            <p className="text-[9px] text-gray-500 font-medium mt-0.5">Mutual Funds</p>
          </div>
          <div className="bg-white rounded-xl px-2 py-3 shadow-sm min-w-0">
            <p className="text-sm font-bold text-[#0a1628] leading-tight">{TANZANIAN_SUMMARY.totalAumFormatted}</p>
            <p className="text-[9px] text-gray-500 font-medium mt-0.5">Total AUM</p>
          </div>
          <div className="bg-white rounded-xl px-2 py-3 shadow-sm min-w-0">
            <p className="text-xl font-bold text-emerald-600">{activeFundsCount}</p>
            <p className="text-[9px] text-gray-500 font-medium mt-0.5">Active Funds</p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="px-4 py-6">
          <MobileSkeleton />
        </div>
      ) : (
        <div className="px-4 -mt-2 space-y-5">
          {/* Fund Managers */}
          <section className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Fund Managers</h2>
              <Link href="/funds/managers" className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {managers.slice(0, 3).map((manager) => (
                <motion.div key={manager.managerName} variants={itemVariants}>
                  <Link
                    href={`/funds/managers/${getManagerSlug(manager.managerName)}`}
                    className="flex items-center gap-3 py-2.5 rounded-lg hover:bg-gray-50 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                      {manager.logoUrl ? (
                        <Image src={manager.logoUrl} alt={manager.managerName} width={40} height={40} className="object-contain w-full h-full p-1" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          {manager.managerName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{getManagerDisplayName(manager.managerName)}</p>
                      <p className="text-xs text-gray-500">{manager.funds.length} Funds</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Fund Categories - wrap so all visible without horizontal scroll */}
          <section>
            <h2 className="text-sm font-bold text-gray-900 mb-2">Fund Categories</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategoryFilter(tab.key)}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs font-medium transition-colors",
                    categoryFilter === tab.key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {/* Top Performing Funds - vertical bar chart */}
          <section className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Top Performing Funds</h2>
            <div className="flex items-end justify-between gap-3 h-32">
              {topPerforming.map((fund, i) => {
                const pct = fund.return_1y ?? 0
                const maxPct = Math.max(...topPerforming.map((f) => f.return_1y ?? 0), 1)
                const heightPct = maxPct ? (pct / maxPct) * 100 : 0
                const barColor = i === 0 ? "bg-blue-500" : i === 1 ? "bg-amber-500" : "bg-emerald-500"
                const shortLabel = fund.manager_name.includes("Zan") ? "ZanSec" : fund.manager_name.split(" ")[0]
                return (
                  <div key={fund.fund_id} className="flex-1 flex flex-col items-center gap-1">
                    <span className={cn("text-xs font-bold", pct >= 0 ? "text-green-600" : "text-red-600")}>+{pct.toFixed(1)}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      className={cn("w-full max-w-[48px] min-h-[20px] rounded-t-md", barColor)}
                    />
                    <p className="text-[10px] font-medium text-gray-600 text-center leading-tight">
                      {fund.fund_name} / {shortLabel}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Mutual Fund Performance - card list, no dropdowns; filter via categories above, sort via chips */}
          <section className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Mutual Fund Performance</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { key: "name" as const, label: "Name" },
                { key: "nav" as const, label: "NAV" },
                { key: "return" as const, label: "YTD Return" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    sortBy === opt.key ? "bg-[#0a1628] text-white" : "bg-gray-100 text-gray-600 border border-gray-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {sortedFunds.map((fund) => {
                const initials = fund.fund_name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const subtitle = [
                  getCategoryLabel(fund.fund_type),
                  fund.return_1y != null ? `${fund.return_1y >= 0 ? "+" : ""}${fund.return_1y.toFixed(1)}% YTD` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
                return (
                  <motion.div key={fund.fund_id} variants={itemVariants}>
                    <Link
                      href={`/funds/${fund.fund_id}/overview`}
                      className="flex items-center gap-3 py-2.5 rounded-lg hover:bg-gray-50 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                        <span className="text-xs font-bold text-gray-600">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{fund.fund_name}</p>
                        <p className="text-xs text-gray-500 truncate">{subtitle || (fund.current_nav != null ? `${fund.base_currency} ${fund.current_nav.toLocaleString("en-TZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "")}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </section>
        </div>
      )}
    </div>
  )
}

function MobileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

