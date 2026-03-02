"use client"

import { useRouter } from "next/navigation"
import { useEffect, use } from "react"

export default function FundDetailPage({ params }: { params: Promise<{ fundId: string }> }) {
    const { fundId } = use(params)
    const router = useRouter()

    useEffect(() => {
        // Map legacy IDs if necessary, otherwise just redirect
        router.push(`/funds/${fundId}`)
    }, [fundId, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground animate-pulse">Redirecting to professional analysis for {fundId}...</p>
            </div>
        </div>
    )
}
