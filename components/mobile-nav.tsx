"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, GraduationCap, MessageSquare, Activity, Briefcase, Home, GitCompare, Wrench, Search } from "lucide-react"

const defaultNavItems = [
    { name: "LMS", href: "/academy", icon: GraduationCap },
    { name: "Forum", href: "https://forum.yifcapital.co.tz", icon: MessageSquare },
    { name: "Funds", href: "/funds", icon: Activity },
    { name: "Stocks", href: "/stocks", icon: BarChart3 },
    { name: "Portfolio", href: "/portfolio", icon: Briefcase },
]

// Funds page bottom nav (screenshot: Dashboard, Funds, Compare, Tools, Find Fund)
const fundsNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Funds", href: "/funds", icon: Activity },
    { name: "Compare", href: "/funds/compare", icon: GitCompare },
    { name: "Tools", href: "/funds", icon: Wrench },
]

export function MobileNav() {
    const pathname = usePathname()
    const isFundsPage = pathname === "/funds" || pathname.startsWith("/funds/")
    const navItems = isFundsPage ? fundsNavItems : defaultNavItems

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-3 sm:hidden">
            <div className={cn(
                "flex items-center mx-auto max-w-md",
                isFundsPage ? "justify-between gap-1" : "justify-between"
            )}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center gap-1 min-w-[56px]"
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isActive ? "bg-[#0a1628]/10" : "bg-transparent"
                            )}>
                                <item.icon
                                    className={cn(
                                        "h-6 w-6 stroke-[1.5]",
                                        isActive ? "text-[#0a1628] fill-current" : "text-gray-500"
                                    )}
                                />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium leading-none",
                                isActive ? "text-[#0a1628] font-semibold" : "text-gray-500"
                            )}>
                                {item.name}
                            </span>
                            {isActive && !isFundsPage && (
                                <div className="h-0.5 w-8 bg-gold rounded-full mt-1" />
                            )}
                        </Link>
                    )
                })}
                {isFundsPage && (
                    <Link
                        href="/funds"
                        className="flex flex-col items-center gap-1 min-w-[64px] px-3 py-2 rounded-xl bg-[#0a1628] text-white"
                    >
                        <Search className="h-5 w-5" />
                        <span className="text-[10px] font-semibold leading-none">Find Fund</span>
                    </Link>
                )}
            </div>
        </div>
    )
}
