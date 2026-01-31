"use client"

import React from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "admin")) {
            router.push("/dashboard")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
        )
    }

    if (!user || user.role !== "admin") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-white/60 mt-2">You don't have permission to access this area.</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-900">
            <AdminSidebar />
            <div className="flex flex-1 flex-col lg:ml-64">
                <AdminHeader />
                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    )
}
