"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Fund, FundType } from "@/lib/types/funds"
import { FUND_TYPE_CONFIG } from "@/lib/types/funds"

interface FundCardProps {
  fund: Fund
  className?: string
}

// Get initials for avatar fallback
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Format currency for display
function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Format large numbers (K, M, B, T)
function formatLargeNumber(value: number): string {
  if (value >= 1e12) return (value / 1e12).toFixed(1) + "T"
  if (value >= 1e9) return (value / 1e9).toFixed(1) + "B"
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M"
  if (value >= 1e3) return (value / 1e3).toFixed(1) + "K"
  return value.toString()
}

export function FundCard({ fund, className }: FundCardProps) {
  const typeConfig = FUND_TYPE_CONFIG[fund.fund_type]

  return (
    <Link href={`/funds/${fund.fund_id}/overview`} className="block h-full">
      <Card
        className={cn(
          "group h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-border/40 bg-card/60 backdrop-blur-md overflow-hidden",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {/* Logo or Avatar */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50 border border-border/50 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
              {fund.logo_url ? (
                <Image
                  src={fund.logo_url}
                  alt={fund.fund_name}
                  width={56}
                  height={56}
                  className="object-contain w-full h-full p-2"
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground/50">
                  {getInitials(fund.fund_name)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base font-extrabold line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {fund.fund_name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 border-none text-white",
                      typeConfig?.color
                    )}
                  >
                    {typeConfig?.label || fund.fund_type}
                  </Badge>
                  <p className="text-xs font-semibold text-muted-foreground truncate">
                    {fund.manager_name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6 min-h-[40px]">
            {fund.description}
          </p>

          <div className="mt-auto space-y-4">
            {/* KPI Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current NAV */}
              <div className="bg-muted/40 rounded-xl p-3 border border-border/20">
                <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">
                  Current NAV
                </p>
                <p className="text-base font-black tracking-tight">
                  {fund.current_nav
                    ? `${fund.base_currency} ${fund.current_nav.toFixed(4)}`
                    : "N/A"}
                </p>
                {fund.nav_change_1d !== undefined && fund.nav_change_1d !== null && (
                  <p
                    className={cn(
                      "text-[10px] font-black mt-0.5",
                      fund.nav_change_1d >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {fund.nav_change_1d >= 0 ? "▲" : "▼"} {Math.abs(fund.nav_change_1d).toFixed(2)}%
                  </p>
                )}
              </div>

              {/* 1Y Return Design Improvement */}
              {fund.return_1y != null && (
                <div className="bg-muted/30 rounded-xl p-3 border border-border/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <div className="bg-muted/50 p-1.5 rounded-lg">
                      <BarChart3 className="w-3.5 h-3.5 text-primary/70" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      Return (1Y)
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p
                      className={cn(
                        "text-2xl font-black tracking-tight",
                        fund.return_1y >= 0 ? "text-slate-900" : "text-rose-500"
                      )}
                    >
                      {fund.return_1y >= 0 ? "+" : ""}{fund.return_1y.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors pt-2 border-t border-border/20">
              <span className="flex items-center">
                View Performance
                <BarChart3 className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-current rotate-45" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Skeleton loader
export function FundCardSkeleton() {
  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/30 rounded-lg p-2 h-14 animate-pulse" />
          <div className="bg-muted/30 rounded-lg p-2 h-14 animate-pulse" />
        </div>
        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}
