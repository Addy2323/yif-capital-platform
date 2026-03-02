"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function FundsPage() {
    const router = useRouter()

    useEffect(() => {
        router.push("/funds")
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground animate-pulse">Redirecting to professional funds analytics...</p>
            </div>
        </div>
    )
}
