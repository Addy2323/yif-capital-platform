"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, GraduationCap, MessageSquare } from "lucide-react"

export function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        {
            name: "LMS",
            href: "/academy",
            icon: GraduationCap,
        },
        {
            name: "Forum",
            href: "https://forum.yifcapital.co.tz",
            icon: MessageSquare,
        },
        {
            name: "Analytics",
            href: "/analytics",
            icon: BarChart3,
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-6 py-3 sm:hidden">
            <div className="flex items-center justify-between mx-auto max-w-md">
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center gap-1 min-w-[64px]"
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isActive ? "bg-navy/5" : "bg-transparent"
                            )}>
                                <item.icon
                                    className={cn(
                                        "h-6 w-6 stroke-[1.5]",
                                        isActive ? "text-navy fill-current" : "text-gray-500"
                                    )}
                                />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium leading-none",
                                isActive ? "text-navy font-semibold" : "text-gray-500"
                            )}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="h-0.5 w-8 bg-gold rounded-full mt-1" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
