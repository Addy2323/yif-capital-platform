"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/market-data"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Activity,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Layers
} from "lucide-react"
import { ModuleLayout } from "@/components/funds/module-layout"
import { MultiSeriesNavChart } from "@/components/funds/multi-series-nav-chart"
import type { Fund } from "@/lib/types/funds"

interface FundRecord {
    date: string
    fund_name?: string
    nav_per_unit?: number
    total_nav?: number
    sale_price?: number
    repurchase_price?: number
    units?: number
    source: string
}

export default function FundDetailPage() {
    const { fund_id } = useParams()
    const fundId = fund_id as string

    const [data, setData] = useState<FundRecord[]>([])
    const [fund, setFund] = useState<Fund | null>(null)
    const [performanceData, setPerformanceData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage, setEntriesPerPage] = useState(50)
    const [selectedScheme, setSelectedScheme] = useState<string>("all")

    useEffect(() => {
        let isMounted = true

        async function fetchData() {
            try {
                // Fetch fund metadata, historical data, and performance analytics
                const [fundRes, dataRes, perfRes] = await Promise.all([
                    fetch(`/api/v1/funds/${fundId}`),
                    fetch(`/api/funds/${fundId}`),
                    fetch(`/api/v1/funds/${fundId}/performance?timeframe=1Y`)
                ])

                const fundResult = await fundRes.json()
                const dataResult = await dataRes.json()
                const perfResult = await perfRes.json()

                if (isMounted) {
                    if (fundResult.success) {
                        setFund(fundResult.data)
                    }

                    if (dataResult.success) {
                        setData(dataResult.data)
                    }

                    if (perfResult.success) {
                        setPerformanceData(perfResult.data)
                    }

                    if (!fundResult.success && !dataResult.success) {
                        setError(dataResult.error || fundResult.error || "Failed to load data")
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError("An error occurred while fetching fund data")
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        if (fundId) {
            fetchData()
        }

        return () => {
            isMounted = false
        }
    }, [fundId])


    if (error) {
        return (
            <ModuleLayout fund={fund} fundId={fundId} activeModule="performance">
                <div className="container mx-auto py-24 text-center">
                    <div className="bg-destructive/10 text-destructive p-6 rounded-xl max-w-md mx-auto border border-destructive/20">
                        <h2 className="text-xl font-bold mb-2">Error</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </ModuleLayout>
        )
    }

    // Get unique scheme names for filtering
    const schemeNames = Array.from(new Set(data.map(r => r.fund_name).filter(Boolean))) as string[]

    // Filter data by selected scheme
    const filteredData = selectedScheme === "all" ? data : data.filter(r => r.fund_name === selectedScheme)

    // Pagination logic
    const indexOfLastEntry = currentPage * entriesPerPage
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
    const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry)
    const totalPages = Math.ceil(filteredData.length / entriesPerPage)

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    // Calculations for KPIs
    const latest = data[0] || {}
    const previous = data[1] || {}
    const change = (latest.nav_per_unit || 0) - (previous.nav_per_unit || 0)
    const changePercent = (previous.nav_per_unit && previous.nav_per_unit !== 0) ? (change / previous.nav_per_unit) * 100 : 0

    return (
        <ModuleLayout
            fund={fund}
            fundId={fundId}
            activeModule="performance"
            isLoading={isLoading}
            lastUpdated={latest.date}
        >
            <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Current NAV</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold">TZS {latest.nav_per_unit ? latest.nav_per_unit.toFixed(4) : "-"}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${change >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
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

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <DollarSign className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Net Asset Value (AUM)</p>
                            </div>
                            <h3 className="text-2xl font-bold">
                                {latest.total_nav ? formatNumber(latest.total_nav) : "N/A"}
                            </h3>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <Layers className="w-4 h-4 text-orange-500" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">Outstanding Units</p>
                            </div>
                            <h3 className="text-2xl font-bold">
                                {latest.units ? formatNumber(latest.units) : "N/A"}
                            </h3>
                        </CardContent>
                    </Card>
                </div>

                {/* === NAV Performance Trends Chart === */}
                {data.length > 0 && (
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">NAV Performance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MultiSeriesNavChart
                                data={data}
                                processedData={performanceData?.multi_series_returns}
                                isPerformance={true}
                                height={380}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Performance Table */}
                <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-lg">Historical Performance Log</CardTitle>
                            <div className="flex items-center gap-3">
                                {/* Scheme filter */}
                                {schemeNames.length > 1 && (
                                    <select
                                        value={selectedScheme}
                                        onChange={(e) => {
                                            setSelectedScheme(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="bg-background border border-border/50 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="all">All Schemes</option>
                                        {schemeNames.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Show</span>
                                    <select
                                        value={entriesPerPage}
                                        onChange={(e) => {
                                            setEntriesPerPage(Number(e.target.value))
                                            setCurrentPage(1)
                                        }}
                                        className="bg-background border border-border/50 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                    </select>
                                    <span>Entries</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/50">
                                    <TableHead className="w-[100px]">#</TableHead>
                                    <TableHead className="w-[120px]">Date Valued</TableHead>
                                    <TableHead>Scheme Name</TableHead>
                                    <TableHead className="text-right">Net Asset Value</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Outstanding Number of Units</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Nav Per Unit</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Sale Price</TableHead>
                                    <TableHead className="text-right">Repurchase</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentEntries.map((record, index) => {
                                    const globalIndex = indexOfFirstEntry + index
                                    const prev = data[globalIndex + 1]
                                    const dChange = prev ? (record.nav_per_unit || 0) - (prev.nav_per_unit || 0) : 0
                                    const rowNumber = globalIndex + 1

                                    return (
                                        <TableRow key={globalIndex} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground">{rowNumber}</TableCell>
                                            <TableCell className="font-medium text-xs">{record.date}</TableCell>
                                            <TableCell className="font-semibold text-sm">{record.fund_name || "-"}</TableCell>
                                            <TableCell className="text-right tabular-nums font-bold text-sm">
                                                {record.total_nav ? formatNumber(record.total_nav) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                                                {record.units ? formatNumber(record.units) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold">{record.nav_per_unit ? record.nav_per_unit.toFixed(4) : "-"}</span>
                                                    {prev && prev.fund_name === record.fund_name && (
                                                        <span className={`text-[10px] flex items-center ${dChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                            {dChange >= 0 ? '+' : ''}{dChange.toFixed(4)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-xs text-muted-foreground whitespace-nowrap">
                                                {record.sale_price ? record.sale_price.toFixed(4) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-xs text-muted-foreground whitespace-nowrap">
                                                {record.repurchase_price ? record.repurchase_price.toFixed(4) : "-"}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {data.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No performance data available yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border/50">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to <span className="font-medium text-foreground">{Math.min(indexOfLastEntry, filteredData.length)}</span> of <span className="font-medium text-foreground">{filteredData.length}</span> entries
                                {selectedScheme !== "all" && <span className="ml-1">(filtered)</span>}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-md border border-border/50 text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1 mx-2">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        // Simple logic to show pages around current
                                        let pageNum = currentPage
                                        if (totalPages <= 5) pageNum = i + 1
                                        else if (currentPage <= 3) pageNum = i + 1
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                                        else pageNum = currentPage - 2 + i

                                        if (pageNum > totalPages || pageNum < 1) return null

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${currentPage === pageNum
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "hover:bg-muted/50 text-muted-foreground border border-transparent"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded-md border border-border/50 text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </ModuleLayout>
    )
}
