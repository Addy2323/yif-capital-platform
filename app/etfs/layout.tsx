"use client"

import React from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MobileNav } from "@/components/mobile-nav"

function ETFsLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col lg:ml-64 pb-20 sm:pb-0">
                <DashboardHeader />
                <main className="flex-1">{children}</main>
                <MobileNav />
            </div>
        </div>
    )
}

export default function ETFsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ETFsLayoutContent>{children}</ETFsLayoutContent>
    )
}
