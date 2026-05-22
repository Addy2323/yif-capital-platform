"use client"

import React from "react"
import { useAuth } from "@/lib/auth-context"
import { ExpertSidebar } from "@/components/expert/sidebar"
import { ExpertHeader } from "@/components/expert/header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

function ExpertLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "expert")) {
            router.push("/dashboard")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (!user || user.role !== "expert") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-white">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-white/60 mt-2">You don't have permission to access this area.</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">
            <ExpertSidebar />
            <div className="flex flex-1 flex-col lg:ml-64">
                <ExpertHeader />
                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    )
}

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
    return (
        <ExpertLayoutContent>{children}</ExpertLayoutContent>
    )
}
