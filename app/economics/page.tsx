"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    TrendingUp,
    Activity,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Info
} from "lucide-react"

interface EconomicIndicator {
    title: string
    value: string
    label: string
    change?: string
    trend?: "up" | "down" | "neutral"
}

export default function EconomicsPage() {
    const [indicators, setIndicators] = useState<EconomicIndicator[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchIndicators = async () => {
            try {
                const res = await fetch("/api/v1/economics")
                const result = await res.json()
                if (result.success) {
                    setIndicators(result.data)
                }
            } catch (error) {
                console.error("Failed to fetch indicators", error)
            } finally {
                setLoading(false)
            }
        }
        fetchIndicators()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#051430] flex items-center justify-center">
                <Activity className="text-gold h-12 w-12 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#051430] text-white pb-20">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden bg-slate-950 py-20 mb-8 border-b border-white/5"
            >
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gold/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-blue-500/10 blur-[100px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center">
                    <div className="inline-block mb-4 border border-gold/30 text-gold bg-gold/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        Market Intelligence
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white flex flex-col items-center justify-center gap-2">
                        Economic <span className="text-gold italic">Indicators</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Monitor Tanzanian macroeconomic trends and key monetary policy rates in real-time.
                    </p>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content - Indicators List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="text-gold h-5 w-5" />
                                Selected Economic Indicators
                            </h2>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <Clock className="h-3 w-3" />
                                Updated: March 6, 2026
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {indicators.map((indicator, index) => (
                                <motion.div
                                    key={indicator.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/30 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{indicator.title}</h3>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-3xl md:text-4xl font-black text-white group-hover:text-gold transition-colors">{indicator.value}</span>
                                                {indicator.change && (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${indicator.trend === "up" ? "bg-green-500/10 text-green-500" :
                                                        indicator.trend === "down" ? "bg-red-500/10 text-red-500" :
                                                            "bg-slate-500/10 text-slate-500"
                                                        }`}>
                                                        {indicator.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                        {indicator.change}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-sm mt-1">{indicator.label}</p>
                                        </div>

                                        <div className="hidden md:block">
                                            <div className="h-12 w-32 bg-white/5 rounded-lg border border-white/5 overflow-hidden relative">
                                                {/* Sparkline decoration */}
                                                <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                                                    <path
                                                        d="M0 40 Q 15 35, 30 38 T 60 30 T 90 35 T 128 25"
                                                        fill="none"
                                                        stroke={indicator.trend === "up" ? "#22c55e" : indicator.trend === "down" ? "#ef4444" : "#eab308"}
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar - Policy & Info */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Info className="text-gold h-5 w-5" />
                            Policy Insights
                        </h2>

                        <div className="bg-gradient-to-br from-indigo-900/40 to-[#0A1F44] border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gold" />
                                Monetary Policy
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed italic mb-6">
                                "Maintain price stability and integrity of the financial system for inclusive economic growth."
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-gold mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-300">Central Bank Rate (CBR) serves as the primary signal for monetary policy stance.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-gold mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-300">Inflation targeting aims to keep the headline rate within the medium-term target of 5%.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-gold mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                {['Bank of Tanzania', 'National Bureau of Statistics', 'Ministry of Finance'].map(link => (
                                    <button key={link} className="w-full text-left text-sm text-slate-400 hover:text-white flex items-center justify-between group py-2 border-b border-white/5">
                                        {link}
                                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
