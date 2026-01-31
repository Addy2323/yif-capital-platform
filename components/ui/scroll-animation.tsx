"use client"

import React, { useRef } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface ScrollAnimationProps {
    children: React.ReactNode
    className?: string
    animation?: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in"
    delay?: number
    duration?: number
    threshold?: number
    once?: boolean
}

export function ScrollAnimation({
    children,
    className,
    animation = "fade-in",
    delay = 0,
    duration = 500,
    threshold = 0.1,
    once = true,
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement>(null)
    const entry = useIntersectionObserver(ref, { threshold, freezeOnceVisible: once })
    const isVisible = !!entry?.isIntersecting

    const animations = {
        "fade-in": "animate-in fade-in",
        "slide-up": "animate-in fade-in slide-in-from-bottom-10",
        "slide-down": "animate-in fade-in slide-in-from-top-10",
        "slide-left": "animate-in fade-in slide-in-from-right-10",
        "slide-right": "animate-in fade-in slide-in-from-left-10",
        "zoom-in": "animate-in fade-in zoom-in-95",
    }

    return (
        <div
            ref={ref}
            className={cn(
                "duration-500 fill-mode-both",
                isVisible ? animations[animation] : "opacity-0",
                className
            )}
            style={{
                animationDelay: `${delay}ms`,
                animationDuration: `${duration}ms`,
            }}
        >
            {children}
        </div>
    )
}
