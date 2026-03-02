"use client"

import { useAuth } from "@/lib/auth-context"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
    const { user } = useAuth()

    return (
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
                {/* Search */}
                <div className="hidden md:flex flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                            type="search"
                            placeholder="Search users, content..."
                            className="w-full pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-gold/50"
                        />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 ml-auto">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-white/60 hover:text-white hover:bg-white/10"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                            3
                        </span>
                    </Button>

                    {/* Admin Badge */}
                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
                        <div className="text-right">
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-gold">Administrator</p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-navy font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
