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
    Calendar,
    Award,
    Target,
    Compass,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    GraduationCap,
} from "lucide-react"

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
}

const navigation: NavItem[] = [
    { name: "Dashboard", href: "/lms", icon: LayoutDashboard },
    { name: "My Courses", href: "/lms/courses", icon: BookOpen },
    { name: "Explore", href: "/lms/explore", icon: Compass },
    { name: "My Bookings", href: "/lms/bookings", icon: Calendar },
    { name: "Certificates", href: "/lms/certificates", icon: Award },
    { name: "Readiness Quiz", href: "/lms/readiness", icon: Target },
    { name: "Teach on YIF LMS", href: "/lms/become-instructor", icon: GraduationCap },
    { name: "Notifications", href: "/lms/notifications", icon: Bell },
    { name: "Settings", href: "/lms/settings", icon: Settings },
]

export function LmsSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)

    const NavContent = () => (
        <div className="flex h-full flex-col bg-[#0A1628] border-r border-white/10">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Link href="/lms" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="YIF Capital" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                        <span className="text-lg font-bold text-white">YIF Capital</span>
                        <span className="ml-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                            LEARNER
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

            {/* User Info */}
            <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-blue-400">
                            {user?.role === "admin" ? "Admin" :
                             user?.role === "expert" ? "Instructor" :
                             user?.role === "pro" ? "Pro Learner" :
                             user?.role === "institutional" ? "Institutional" :
                             "Learner"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-600/20 text-blue-400"
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
        </div>
    )

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="fixed left-4 top-4 z-50 rounded-lg bg-[#0A1628] p-2 text-white lg:hidden"
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
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0A1628] transition-transform lg:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <NavContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0A1628] lg:flex h-screen">
                <NavContent />
            </aside>
        </>
    )
}
