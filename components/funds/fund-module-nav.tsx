"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import type { Fund, FundModuleId } from "@/lib/types/funds"
import { FUND_MODULE_TABS, FUND_TYPE_CONFIG } from "@/lib/types/funds"

// ── iTrust helpers ────────────────────────────────────────────────────────────

/** True when the fund belongs to the iTrust Finance Fund Family. */
function isITrustFund(fund: Fund): boolean {
  return (
    fund.fund_id.toLowerCase().startsWith("itrust") ||
    (fund.manager_name?.toLowerCase().includes("itrust") ?? false) ||
    (fund.fund_name?.toLowerCase().includes("itrust") ?? false)
  )
}

/**
 * Returns "iTrust Finance Fund Family" for any iTrust sub-fund,
 * or the fund's own name for everything else.
 */
function getFundDisplayName(fund: Fund): string {
  return isITrustFund(fund) ? "iTrust Finance Fund Family" : fund.fund_name
}

/**
 * For iTrust funds, extracts the sub-fund variant label.
 * Tries fund_slug first (used in URLs, e.g. "itrust-icash"),
 * then fund_id as a fallback.
 * Returns null when no meaningful variant can be determined.
 * e.g. "itrust-icash" → "i-Cash", "itrust-idollar" → "i-Dollar"
 */
function getITrustVariant(fund: Fund): string | null {
  if (!isITrustFund(fund)) return null

  // Prefer fund_slug (URL-based) over fund_id — DB ids may differ from URL slugs
  const source = (fund.fund_slug || fund.fund_id || "").toLowerCase()
  const slug = source.replace(/^itrust-?/, "").trim()

  // Only show a variant chip when we have a meaningful sub-fund name
  if (!slug) return null

  // "icash"   → "i-Cash"
  // "idollar" → "i-Dollar"
  // Already hyphenated slugs like "i-cash" are handled by the second replace
  return slug
    .replace(/^i([a-z])/, (_: string, c: string) => `i-${c.toUpperCase()}`)
    .replace(/-([a-z])/g, (_: string, c: string) => `-${c.toUpperCase()}`)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FundModuleNavProps {
  fund: Fund
  activeModule: FundModuleId
  userRole?: string
}

export function FundModuleNav({ fund, activeModule, userRole }: FundModuleNavProps) {
  const typeConfig = FUND_TYPE_CONFIG[fund.fund_type]
  const displayName = getFundDisplayName(fund)
  const variant = getITrustVariant(fund)

  // Hide Attribution tab from non-analysts / non-admins
  const visibleTabs = FUND_MODULE_TABS.filter((tab) => {
    if (tab.id === "attribution") {
      return userRole === "analyst" || userRole === "ADMIN" || userRole === "admin"
    }
    return true
  })

  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Fund Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-border/30">
          {/* Back link */}
          <div className="flex items-center gap-4">
            <Link
              href="/funds"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Funds
            </Link>
          </div>

          {/* Title + badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold">{displayName}</h1>

            {/* Sub-fund variant chip (e.g. "i-Cash") */}
            {variant && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-primary/40 text-primary bg-primary/5"
              >
                {variant}
              </Badge>
            )}

            {/* Fund type badge (e.g. "MONEY MARKET") */}
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-wider", typeConfig?.color)}
            >
              {typeConfig?.label || fund.fund_type}
            </Badge>
          </div>

          {/* Last updated */}
          {fund.date && (
            <div className="text-xs text-muted-foreground">
              Last Updated: {fund.date}
            </div>
          )}
        </div>

        {/* Module Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 scrollbar-hide">
          {visibleTabs.map((tab) => {
            const href = tab.route.replace("[fund_id]", fund.fund_id)
            const isActive = activeModule === tab.id

            return (
              <Link
                key={tab.id}
                href={href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function FundModuleNavSkeleton() {
  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4 border-b border-border/30">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
