"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LmsSidebar } from "@/components/lms/sidebar"
import { LmsHeader } from "@/components/lms/header"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"

function LmsLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#060E1C]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#060E1C] text-white">
                <Lock className="h-16 w-16 text-blue-500 mb-4" />
                <h1 className="text-2xl font-bold">Sign In Required</h1>
                <p className="text-white/60 mt-2">Please sign in to access the Learning Portal.</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-[#060E1C]">
            <LmsSidebar />
            <div className="flex flex-1 flex-col lg:ml-64">
                <LmsHeader />
                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    )
}

export default function LmsLayout({ children }: { children: React.ReactNode }) {
    return <LmsLayoutContent>{children}</LmsLayoutContent>
}
