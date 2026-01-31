"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    CreditCard,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    TrendingUp,
    Layers,
    Target,
    Newspaper,
    ArrowLeft,
} from "lucide-react"

interface NavItem {
    name: string
    href?: string
    icon: React.ElementType
    children?: {
        name: string
        href: string
        icon?: React.ElementType
    }[]
}

const navigation: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    {
        name: "Content",
        icon: FileText,
        children: [
            { name: "Stocks", href: "/admin/content/stocks", icon: TrendingUp },
            { name: "ETFs", href: "/admin/content/etfs", icon: Layers },
            { name: "IPOs", href: "/admin/content/ipos", icon: Target },
            { name: "News", href: "/admin/content/news", icon: Newspaper },
        ],
    },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>(["Content"])

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
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Link href="/admin" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                        <span className="text-lg font-bold text-white">YIF Capital</span>
                        <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                            ADMIN
                        </span>
                    </div>
                </Link>
                <button
                    className="lg:hidden text-white"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Admin Info */}
            <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-navy font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-white/60">Administrator</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = isItemActive(item)
                        const isExpanded = expandedItems.includes(item.name)
                        const hasChildren = item.children && item.children.length > 0

                        if (hasChildren) {
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => toggleExpanded(item.name)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "text-white"
                                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-white/50" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-white/50" />
                                        )}
                                    </button>
                                    {isExpanded && (
                                        <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-3">
                                            {item.children!.map((child) => {
                                                const isChildActive = pathname === child.href
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                                            isChildActive
                                                                ? "text-gold font-medium"
                                                                : "text-white/60 hover:text-white"
                                                        )}
                                                        onClick={() => setMobileOpen(false)}
                                                    >
                                                        {child.icon && <child.icon className="h-3.5 w-3.5" />}
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
                                href={item.href!}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-gold/10 text-gold"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                )}
                                onClick={() => setMobileOpen(false)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t border-white/10 p-3 space-y-1">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <button
                    onClick={() => {
                        logout()
                        setMobileOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
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
                className="fixed left-4 top-4 z-50 rounded-lg bg-slate-800 p-2 text-white lg:hidden"
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
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-800 transition-transform lg:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <NavContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-800 lg:flex">
                <NavContent />
            </aside>
        </>
    )
}
