"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Layers, Clock } from "lucide-react"

export default function ETFsPage() {
    return (
        <div className="min-h-screen bg-background/95 pb-20">
            {/* Hero Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden bg-slate-950 py-20 mb-12"
            >
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-indigo-500/10 blur-[100px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center">
                    <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-400 bg-purple-500/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        Diversified Assets
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white flex flex-col md:flex-row items-center justify-center gap-3">
                        Exchange Traded <span className="text-purple-400 italic">Funds</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Track broad market indices and sector performance with low-cost diversified investment vehicles.
                    </p>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 max-w-2xl text-center mt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/40"
                >
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-purple-400/80" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Coming Soon</h2>
                    <p className="text-muted-foreground font-semibold text-lg max-w-md mx-auto">
                        We are expanding our data coverage. ETF tracking and analytics will be available shortly.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
