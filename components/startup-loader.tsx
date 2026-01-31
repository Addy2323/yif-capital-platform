"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function StartupLoader() {
    const [loading, setLoading] = useState(true)
    const [shouldRender, setShouldRender] = useState(true)

    useEffect(() => {
        // Simulate initial load time or wait for window load
        const timer = setTimeout(() => {
            setLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 500) // Match the duration of the fade-out animation
            return () => clearTimeout(timer)
        }
    }, [loading])

    if (!shouldRender) return null

    return (
        <div
            className={cn(
                "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-navy transition-opacity duration-500 ease-in-out",
                !loading ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
        >
            <div className="relative flex flex-col items-center">
                {/* Animated Logo Container */}
                <div className="relative h-24 w-24 md:h-32 md:w-32">
                    {/* Outer Rotating Ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />

                    {/* Inner Pulsing Circle */}
                    <div className="absolute inset-2 rounded-full bg-navy flex items-center justify-center overflow-hidden border border-gold/10">
                        <Image
                            src="/logo.png"
                            alt="YIF Capital"
                            width={128}
                            height={128}
                            className="h-full w-full object-cover animate-pulse"
                            priority
                        />
                    </div>
                </div>

                {/* Brand Name */}
                <div className="mt-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                        YIF <span className="text-gold">CAPITAL</span>
                    </h1>
                    <div className="mt-2 h-1 w-48 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold animate-loading-bar" />
                    </div>
                    <p className="mt-4 text-white/50 text-sm font-medium uppercase tracking-[0.2em]">
                        Empowering Your Investments
                    </p>
                </div>
            </div>
        </div>
    )
}
