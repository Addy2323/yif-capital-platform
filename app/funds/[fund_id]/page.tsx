"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    TrendingUp,
    TrendingDown,
    Activity,
    DollarSign,
    Layers,
    ChevronLeft,
    ChevronRight,
    Filter,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ModuleLayout } from "@/components/funds/module-layout"
import { MultiSeriesNavChart } from "@/components/funds/multi-series-nav-chart"
import type { Fund, NavRecord, PerformanceData } from "@/lib/types/funds"

export default function FundDetailPage() {
    const params = useParams()
    const fundId = params.fund_id as string

    const [fund, setFund] = useState<Fund | null>(null)
    const [navHistory, setNavHistory] = useState<NavRecord[]>([])
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pagination & Filtering
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const itemsPerPage = 10

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    }

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const [fundRes, navRes, perfRes] = await Promise.all([
                    fetch(`/api/v1/funds/${fundId}`),
                    fetch(`/api/v1/funds/${fundId}/nav`),
                    fetch(`/api/v1/funds/${fundId}/performance`)
                ])

                const [fundData, navData, perfData] = await Promise.all([
                    fundRes.json(),
                    navRes.json(),
                    perfRes.json()
                ])

                if (fundData.success) setFund(fundData.data)
                if (navData.success) setNavHistory(navData.data)
                if (perfData.success) setPerformanceData(perfData.data)

                if (!fundData.success || !navData.success) {
                    setError("Failed to load fund performance data")
                }
            } catch (err) {
                setError("An error occurred while fetching data")
            } finally {
                setIsLoading(false)
            }
        }

        if (fundId) {
            fetchData()
        }
    }, [fundId])

    const filteredHistory = navHistory.filter(record =>
        record.date.includes(searchTerm) ||
        record.nav_per_unit.toString().includes(searchTerm) ||
        (record.scheme_name && record.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num)
    }

    if (isLoading) {
        return <ModuleLayout fund={null} fundId={fundId} activeModule="performance" isLoading={true}><></></ModuleLayout>
    }

    const latest = navHistory[0] || {}
    const previous = navHistory[1] || {}
    const change = latest.nav_per_unit && previous.nav_per_unit
        ? latest.nav_per_unit - previous.nav_per_unit
        : 0
    const changePercent = previous.nav_per_unit
        ? (change / previous.nav_per_unit) * 100
        : 0

    return (
        <ModuleLayout
            fund={fund}
            fundId={fundId}
            activeModule="performance"
            isLoading={isLoading}
            lastUpdated={latest.date}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* KPI Cards */}
                <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Current NAV</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold">TZS {latest.nav_per_unit ? latest.nav_per_unit.toFixed(4) : "-"}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${change >= 0 ? 'bg-success/10' : 'bg-destructive/10'} group-hover:scale-110 transition-transform`}>
                                    {change >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Daily Change</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className={`text-2xl font-bold ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {change >= 0 ? '+' : ''}{change.toFixed(4)}
                                </h3>
                                <span className={`text-xs font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    ({changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Net Asset Value (AUM)</p>
                            </div>
                            <h3 className="text-2xl font-bold">
                                {latest.total_nav ? formatNumber(latest.total_nav) : "N/A"}
                            </h3>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-orange-500/10 group-hover:scale-110 transition-transform">
                                    <Layers className="w-4 h-4 text-orange-500" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Outstanding Units</p>
                            </div>
                            <h3 className="text-2xl font-bold">
                                {latest.units ? formatNumber(latest.units) : "N/A"}
                            </h3>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* === NAV Performance Trends Chart === */}
                {navHistory.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <Card className="border-border/50 shadow-sm overflow-hidden hover:border-primary/20 transition-colors group">
                            <CardHeader className="pb-2 bg-muted/5 group-hover:bg-muted/10 transition-colors">
                                <CardTitle className="text-lg">NAV Performance Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <MultiSeriesNavChart
                                    data={navHistory}
                                    processedData={performanceData?.multi_series_returns}
                                    isPerformance={true}
                                    height={380}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Performance Table */}
                <motion.div variants={itemVariants}>
                    <Card className="border-border/50 shadow-sm overflow-hidden mb-8 hover:border-primary/20 transition-colors">
                        <CardHeader className="bg-muted/10 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="text-lg font-bold">Historical Performance Log</CardTitle>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search dates..."
                                            className="pl-9 h-9 bg-background/50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" className="h-9">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5 font-bold uppercase tracking-wider text-[10px]">
                                        <TableHead>Valuation Date</TableHead>
                                        <TableHead>Scheme / Fund</TableHead>
                                        <TableHead className="text-right">NAV per Unit (TZS)</TableHead>
                                        <TableHead className="text-right">Total Fund NAV</TableHead>
                                        <TableHead className="text-right">Outstanding Units</TableHead>
                                        <TableHead className="text-right">Daily Change</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedHistory.map((record, index) => {
                                        const idx = navHistory.findIndex(r => r.date === record.date)
                                        const prev = navHistory[idx + 1]
                                        const dChange = prev ? record.nav_per_unit - prev.nav_per_unit : 0
                                        const dPct = prev ? (dChange / prev.nav_per_unit) * 100 : 0

                                        return (
                                            <TableRow key={`${record.date}-${record.scheme_name || index}`} className="hover:bg-muted/5 transition-colors">
                                                <TableCell className="font-medium text-sm">
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-muted-foreground">
                                                    {record.scheme_name || '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    {record.nav_per_unit.toFixed(4)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {formatNumber(record.total_nav)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {formatNumber(record.units)}
                                                </TableCell>
                                                <TableCell className={`text-right font-medium text-sm ${dChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {dChange !== 0 ? (
                                                        <span>{dChange > 0 ? '+' : ''}{dChange.toFixed(4)} ({dPct.toFixed(2)}%)</span>
                                                    ) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 bg-muted/5 border-t">
                                <p className="text-xs text-muted-foreground font-medium">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </ModuleLayout>
    )
}

