"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    Calendar,
    DollarSign,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    ArrowLeft
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
    { name: "Dashboard", href: "/expert", icon: LayoutDashboard },
    { name: "My Courses", href: "/expert/courses", icon: BookOpen },
    { name: "Availability", href: "/expert/availability", icon: CalendarDays },
    { name: "Bookings", href: "/expert/bookings", icon: Calendar },
    { name: "Earnings", href: "/expert/earnings", icon: DollarSign },
    { name: "Students", href: "/expert/students", icon: Users },
    { name: "Settings", href: "/expert/settings", icon: Settings },
]

export function ExpertSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])

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
        <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                <Link href="/expert" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                        <span className="text-lg font-bold text-white">YIF Capital</span>
                        <span className="ml-2 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                            EXPERT
                        </span>
                    </div>
                </Link>
                <button
                    className="lg:hidden text-sidebar-foreground"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Expert Info */}
            <div className="border-b border-sidebar-border p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-900 font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-sidebar-foreground">{user?.name}</p>
                        <p className="text-xs text-sidebar-foreground/60">Investment Expert</p>
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
                                                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                                            isChildActive
                                                                ? "text-emerald-400 font-medium"
                                                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
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
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
            <div className="border-t border-sidebar-border p-3 space-y-1">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground lg:hidden"
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
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar lg:flex h-screen">
                <NavContent />
            </aside>
        </>
    )
}
