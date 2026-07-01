"use client"

import { useAuth } from "@/lib/auth-context"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export function LmsHeader() {
    const { user } = useAuth()

    return (
        <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A1628] w-full">
            <div className="flex h-16 items-center justify-between pl-14 pr-4 lg:pl-8 lg:pr-8">
                {/* Search */}
                <div className="hidden md:flex flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                            type="search"
                            placeholder="Search courses, topics..."
                            className="w-full pl-10 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-blue-500/50"
                        />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 ml-auto">
                    <ThemeToggle />
                    <Link href="/lms/notifications">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                                3
                            </span>
                        </Button>
                    </Link>

                    {/* User Badge */}
                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-blue-500 dark:text-blue-400">
                                {user?.role === "admin" ? "Admin" :
                                 user?.role === "expert" ? "Instructor" :
                                 user?.role === "pro" ? "Pro Learner" :
                                 user?.role === "institutional" ? "Institutional" :
                                 "Learner"}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
