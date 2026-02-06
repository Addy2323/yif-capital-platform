"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  Home,
  Star,
  BarChart3,
  TrendingUp,
  Newspaper,
  LineChart,
  FileText,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronDown,
  ChevronRight,
  Search,
  Building2,
  Calendar,
  Factory,
  Users,
  Target,
  Zap,
  Globe,
  Layers,
  ArrowUpDown,
  Clock,
  Map,
  Shield,
} from "lucide-react"

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  pro?: boolean
  children?: {
    name: string
    href: string
  }[]
}

const navigation: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  {
    name: "Stocks",
    icon: BarChart3,
    children: [
      { name: "Stock Screener", href: "/dashboard/stocks/screener" },
      { name: "Stock Exchanges", href: "/dashboard/stocks/exchanges" },
      { name: "Comparison Tool", href: "/dashboard/stocks/comparison" },
      { name: "Earnings Calendar", href: "/dashboard/stocks/earnings" },
      { name: "By Industry", href: "/dashboard/stocks/industry" },
      { name: "Stock Lists", href: "/dashboard/stocks/lists" },
      { name: "Top Analysts", href: "/dashboard/stocks/analysts" },
      { name: "Top Stocks", href: "/dashboard/stocks/top" },
      { name: "Corporate Actions", href: "/dashboard/stocks/corporate-actions" },
    ],
  },
  {
    name: "IPOs",
    icon: Target,
    children: [
      { name: "Recent IPOs", href: "/dashboard/ipos/recent" },
      { name: "IPO Calendar", href: "/dashboard/ipos/calendar" },
      { name: "IPO Statistics", href: "/dashboard/ipos/statistics" },
      { name: "IPO News", href: "/dashboard/ipos/news" },
      { name: "IPO Screener", href: "/dashboard/ipos/screener" },
    ],
  },
  {
    name: "ETFs",
    icon: Layers,
    children: [
      { name: "ETF Screener", href: "/dashboard/etfs/screener" },
      { name: "Comparison Tool", href: "/dashboard/etfs/comparison" },
      { name: "New Launches", href: "/dashboard/etfs/new-launches" },
      { name: "ETF Providers", href: "/dashboard/etfs/providers" },
    ],
  },
  { name: "News", href: "/dashboard/news", icon: Newspaper },
  { name: "Trending", href: "/dashboard/trending", icon: TrendingUp },
  { name: "Articles", href: "/dashboard/articles", icon: FileText },
  { name: "Technical Chart", href: "/dashboard/charts", icon: LineChart },
  {
    name: "Market Movers",
    icon: ArrowUpDown,
    children: [
      { name: "Top Gainers", href: "/dashboard/market-movers/gainers" },
      { name: "Top Losers", href: "/dashboard/market-movers/losers" },
      { name: "Most Active", href: "/dashboard/market-movers/active" },
      { name: "Premarket", href: "/dashboard/market-movers/premarket" },
      { name: "After Hours", href: "/dashboard/market-movers/after-hours" },
      { name: "Market Heatmap", href: "/dashboard/market-movers/heatmap" },
    ],
  },
  { name: "Stock Analysis Pro", href: "/dashboard/analysis-pro", icon: Search, pro: true },
]

const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const adminNav = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional" || user?.role === "admin"

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true
    if (item.children) {
      return item.children.some((child) => pathname === child.href)
    }
    return false
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
          <span className="text-lg font-bold text-sidebar-foreground">YIF Capital</span>
        </Link>
        <button
          className="lg:hidden text-sidebar-foreground"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* User Info */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-medium">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-sidebar-foreground">{user?.name}</p>
            <div className="flex items-center gap-1">
              {isPro ? (
                <span className="flex items-center gap-1 text-xs text-sidebar-primary">
                  <Crown className="h-3 w-3" />
                  Pro
                </span>
              ) : (
                <span className="text-xs text-sidebar-foreground/60">Free Plan</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = isItemActive(item)
            const isExpanded = expandedItems.includes(item.name)
            const isLocked = item.pro && !isPro
            const hasChildren = item.children && item.children.length > 0

            if (hasChildren) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-sidebar-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                              isChildActive
                                ? "text-sidebar-primary font-medium"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                href={isLocked ? "/pricing" : item.href!}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {isLocked && (
                  <span className="ml-auto rounded bg-sidebar-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-primary">
                    PRO
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {user?.role === "admin" && adminNav.map((item) => {
          const isActive = pathname.startsWith(item.href!)

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
        {bottomNav.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
        <button
          onClick={() => {
            logout()
            setMobileOpen(false)
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-navy p-2 text-white lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar lg:flex">
        <NavContent />
      </aside>
    </>
  )
}
