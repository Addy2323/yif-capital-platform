"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    ArrowLeft,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Layers,
    Building2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NAVRecord {
    date: string
    fund_name: string
    code: string
    currency: string
    total_nav: number
    units: number
    nav_per_unit: number
    sale_price: number
    repurchase_price: number
    source: string
}

function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
}

function formatCurrency(num: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num).replace('TZS', 'TZS ')
}

export default function SanlamPesaPage() {
    const [data, setData] = useState<NAVRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage, setEntriesPerPage] = useState(50)

    useEffect(() => {
        let isMounted = true

        async function fetchData() {
            try {
                const response = await fetch('/api/funds/sanlam-pesa')
                const result = await response.json()

                if (isMounted) {
                    if (result.success) {
                        setData(result.data)
                    } else {
                        setError(result.error || "Failed to load data")
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

        fetchData()

        return () => {
            isMounted = false
        }
    }, [])

    if (isLoading) {
        return (
            <div className="container mx-auto py-24 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading Sanlam Pesa Fund data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-24 text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-xl max-w-md mx-auto border border-destructive/20">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                    <Link href="/funds" className="inline-flex items-center mt-4 text-sm font-semibold hover:underline">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Funds
                    </Link>
                </div>
            </div>
        )
    }

    // Pagination logic
    const indexOfLastEntry = currentPage * entriesPerPage
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
    const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry)
    const totalPages = Math.ceil(data.length / entriesPerPage)

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    // Calculations for KPIs
    const latest = data[0] || {} as NAVRecord
    const previous = data[1] || {} as NAVRecord
    const navChange = (latest.nav_per_unit || 0) - (previous.nav_per_unit || 0)
    const aumChange = (latest.total_nav || 0) - (previous.total_nav || 0)

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <Link href="/funds" className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to All Funds
            </Link>

            {/* Fund Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-muted overflow-hidden">
                        <Image 
                            src="/logo payment/background/sanlama.svg" 
                            alt="Sanlam Allianz" 
                            width={64} 
                            height={64} 
                            className="object-contain w-full h-full p-2" 
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">SanlamAllianz Pesa Fund</h1>
                        <p className="text-muted-foreground mt-1 flex items-center">
                            <span className="font-semibold">Sanlam Allianz Investments</span>
                            <span className="mx-2 text-muted-foreground/30">•</span>
                            <span>Money Market Fund (Code: 001)</span>
                        </p>
                    </div>
                </div>
                {latest.date && (
                    <div className="bg-muted/50 px-4 py-2 rounded-lg border border-border/50 flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Last Updated: {latest.date}
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">Current NAV per Unit</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold">TZS {latest.nav_per_unit ? latest.nav_per_unit.toFixed(4) : "-"}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${aumChange >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                                {aumChange >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">Daily AUM Change</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className={`text-2xl font-bold ${aumChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {aumChange >= 0 ? '+' : ''}{formatNumber(aumChange)}
                            </h3>
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
                            {latest.total_nav ? formatCurrency(latest.total_nav) : "N/A"}
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

            {/* Fund Info */}
            <Card className="mb-8 border-border/50 bg-gradient-to-br from-card/50 to-muted/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">About This Fund</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                The SanlamAllianz Pesa Money Market Fund is a highly liquid, low-risk investment 
                                vehicle designed for investors seeking capital preservation with steady returns. 
                                Invest from as low as <strong>TZS 10,000</strong>. The fund invests in treasury bills, 
                                corporate bonds, and other short-term money market instruments. Data sourced from 
                                <a href="https://invest-tz.sanlamallianzinvestments.com/en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                    Sanlam Allianz Investments
                                </a>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Table */}
            <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-lg">Historical NAV Data</CardTitle>
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
                            </select>
                            <span>Entries</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/50">
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead className="w-[140px]">Date</TableHead>
                                <TableHead>Fund Name</TableHead>
                                <TableHead className="w-[80px]">Code</TableHead>
                                <TableHead className="w-[80px]">Currency</TableHead>
                                <TableHead className="text-right">Net Asset Value</TableHead>
                                <TableHead className="text-right">Outstanding Units</TableHead>
                                <TableHead className="text-right">NAV/Unit</TableHead>
                                <TableHead className="text-right">Sale Price</TableHead>
                                <TableHead className="text-right">Buy Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentEntries.map((record, index) => {
                                const globalIndex = indexOfFirstEntry + index
                                const rowNumber = globalIndex + 1

                                return (
                                    <TableRow key={globalIndex} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-xs text-muted-foreground">{rowNumber}</TableCell>
                                        <TableCell className="font-medium text-xs">{record.date}</TableCell>
                                        <TableCell className="font-semibold text-sm">{record.fund_name}</TableCell>
                                        <TableCell className="text-xs">{record.code}</TableCell>
                                        <TableCell className="text-xs">{record.currency}</TableCell>
                                        <TableCell className="text-right tabular-nums font-bold text-sm">
                                            {formatNumber(record.total_nav)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                                            {formatNumber(record.units)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-bold">
                                            {record.nav_per_unit.toFixed(4)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                                            {record.sale_price.toFixed(4)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                                            {record.repurchase_price.toFixed(4)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                        No NAV data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border/50">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to <span className="font-medium text-foreground">{Math.min(indexOfLastEntry, data.length)}</span> of <span className="font-medium text-foreground">{data.length}</span> entries
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

            {/* Source */}
            <div className="text-center text-xs text-muted-foreground">
                <p>Data scraped from <a href="https://invest-tz.sanlamallianzinvestments.com/en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">invest-tz.sanlamallianzinvestments.com</a></p>
            </div>
        </div>
    )
}
