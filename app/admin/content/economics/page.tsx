"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Trash2,
    Save,
    RefreshCcw,
    ArrowLeft,
    GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface EconomicIndicator {
    id?: string
    title: string
    value: string
    label: string
    change?: string
    previousValue?: string
    sortOrder: number
}

export default function AdminEconomicsPage() {
    const [indicators, setIndicators] = useState<EconomicIndicator[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchIndicators()
    }, [])

    const fetchIndicators = async () => {
        setLoading(true)
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

    const addIndicator = () => {
        setIndicators([
            ...indicators,
            { title: "", value: "", label: "", change: "", previousValue: "", sortOrder: indicators.length }
        ])
    }

    const removeIndicator = async (id?: string, index?: number) => {
        if (id) {
            if (!confirm("Are you sure you want to delete this indicator?")) return
            try {
                const res = await fetch(`/api/v1/economics?id=${id}`, { method: "DELETE" })
                const result = await res.json()
                if (result.success) {
                    setIndicators(indicators.filter(ind => ind.id !== id))
                }
            } catch (error) {
                console.error("Delete failed", error)
            }
        } else if (index !== undefined) {
            const newIndicators = [...indicators]
            newIndicators.splice(index, 1)
            setIndicators(newIndicators)
        }
    }

    const handleUpdate = (index: number, field: keyof EconomicIndicator, val: string | number) => {
        const newIndicators = [...indicators]
        newIndicators[index] = { ...newIndicators[index], [field]: val }
        setIndicators(newIndicators)
    }

    const saveAll = async () => {
        setSaving(true)
        try {
            for (const indicator of indicators) {
                await fetch("/api/v1/economics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(indicator)
                })
            }
            alert("All indicators saved successfully!")
            fetchIndicators()
        } catch (error) {
            console.error("Save failed", error)
            alert("Error saving indicators")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="text-white/60">
                        <Link href="/admin/content">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Economic Indicators</h1>
                        <p className="text-xs md:text-sm text-white/60">Manually update macroeconomic data for the platform.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <Button variant="outline" size="sm" onClick={fetchIndicators} className="border-white/10 text-white hover:bg-white/5 h-9 md:h-10 px-3 md:px-4">
                        <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden xs:inline">Refresh</span>
                    </Button>
                    <Button size="sm" onClick={saveAll} disabled={saving} className="bg-gold text-navy hover:bg-gold/90 h-9 md:h-10 px-3 md:px-4">
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <Card className="bg-white/5 border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/40">Indicator List</CardTitle>
                        <Button size="sm" onClick={addIndicator} className="bg-white/5 hover:bg-white/10 text-white border-white/10 border h-8">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add New Indicator
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/10">
                        {indicators.length === 0 && !loading && (
                            <div className="p-12 text-center text-white/40 italic">
                                No indicators added yet. Click &quot;Add New Indicator&quot; to get started.
                            </div>
                        )}

                        {indicators.map((indicator, index) => (
                            <div key={indicator.id || index} className="p-6 group hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="mt-2 text-white/20">
                                        <GripVertical className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {/* Row 1: Title, Value, Period */}
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Indicator Title</label>
                                                <input
                                                    value={indicator.title}
                                                    onChange={(e) => handleUpdate(index, "title", e.target.value)}
                                                    placeholder="e.g. Inflation Rate"
                                                    className="w-full bg-[#051430] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Value</label>
                                                <input
                                                    value={indicator.value}
                                                    onChange={(e) => handleUpdate(index, "value", e.target.value)}
                                                    placeholder="e.g. 3.5%"
                                                    className="w-full bg-[#051430] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Period / Label</label>
                                                <input
                                                    value={indicator.label}
                                                    onChange={(e) => handleUpdate(index, "label", e.target.value)}
                                                    placeholder="e.g. January 2026"
                                                    className="w-full bg-[#051430] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Change, Previous Value, Delete */}
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Change</label>
                                                <input
                                                    value={indicator.change || ""}
                                                    onChange={(e) => handleUpdate(index, "change", e.target.value)}
                                                    placeholder="e.g. ▲+0.12%"
                                                    className="w-full bg-[#051430] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Previous Value</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={indicator.previousValue || ""}
                                                        onChange={(e) => handleUpdate(index, "previousValue", e.target.value)}
                                                        placeholder="e.g. Prev: 3.3%"
                                                        className="flex-1 bg-[#051430] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeIndicator(indicator.id, index)}
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 h-10 w-10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <p className="text-xs text-white/40 italic flex items-center gap-1.5">
                    <Info className="h-3 w-3" />
                    Note: Changes are only applied when you click &quot;Save All Changes&quot;
                </p>
            </div>
        </div>
    )
}

function Info({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
