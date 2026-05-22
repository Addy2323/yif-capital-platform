"use client"

import { useState, useEffect } from "react"
import {
    DollarSign,
    TrendingUp,
    Download,
    Percent,
    Clock,
    CheckCircle,
    Smartphone,
    Building,
    ArrowUpRight,
    XCircle,
    Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

interface MonthlyEntry {
    month: string
    earnings: number
    sessions: number
}

interface EarningsData {
    totalEarnings: number
    thisMonth: number
    lastMonth: number
    monthlyBreakdown: MonthlyEntry[]
    recentPayouts: { id: string; amount: number; date: string; status: string; description: string }[]
    pendingEarnings: number
}

interface PayoutRequest {
    id: string
    amount: number
    expertAmount: number
    platformFee: number
    status: string
    payoutMethod: string
    mobileProvider: string | null
    mobileNumber: string | null
    bankName: string | null
    accountNumber: string | null
    requestedAt: string
    processedAt: string | null
    adminNote: string | null
}

export default function ExpertEarningsPage() {
    const [data, setData] = useState<EarningsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([])

    // Payout settings form
    const [payoutMethod, setPayoutMethod] = useState("MOBILE_MONEY")
    const [mobileProvider, setMobileProvider] = useState("M-Pesa")
    const [mobileNumber, setMobileNumber] = useState("")
    const [bankName, setBankName] = useState("CRDB Bank")
    const [bankAccount, setBankAccount] = useState("")
    const [bankBranch, setBankBranch] = useState("")
    const [accountName, setAccountName] = useState("")

    // Confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const EXPERT_SHARE = 0.80
    const PLATFORM_FEE = 0.20

    useEffect(() => {
        Promise.all([
            fetch("/api/expert/earnings").then(r => r.json()),
            fetch("/api/expert/payout-requests").then(r => r.json()),
        ]).then(([earningsData, payouts]) => {
            setData(earningsData)
            if (Array.isArray(payouts)) setPayoutHistory(payouts)
        }).catch(() => { }).finally(() => setIsLoading(false))
    }, [])

    const pendingAmount = data?.pendingEarnings ?? 0
    const expertShare = Math.round(pendingAmount * EXPERT_SHARE)
    const platformFeeAmt = Math.round(pendingAmount * PLATFORM_FEE)
    const netEarnings = data ? Math.round(data.totalEarnings * EXPERT_SHARE) : 0
    const maxEarnings = data?.monthlyBreakdown?.length
        ? Math.max(...data.monthlyBreakdown.map(m => m.earnings), 1)
        : 1

    const canRequest = pendingAmount > 0 &&
        (payoutMethod === "MOBILE_MONEY" ? !!mobileNumber.trim() : !!bankAccount.trim())

    const handleRequestPayout = async () => {
        if (!canRequest) return
        setSubmitting(true)
        try {
            const res = await fetch("/api/expert/payout-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: pendingAmount,
                    payoutMethod,
                    mobileProvider: payoutMethod === "MOBILE_MONEY" ? mobileProvider : undefined,
                    mobileNumber: payoutMethod === "MOBILE_MONEY" ? mobileNumber : undefined,
                    bankName: payoutMethod === "BANK_TRANSFER" ? bankName : undefined,
                    accountNumber: payoutMethod === "BANK_TRANSFER" ? bankAccount : undefined,
                    accountName: payoutMethod === "BANK_TRANSFER" ? accountName : undefined,
                    branchName: payoutMethod === "BANK_TRANSFER" ? bankBranch : undefined,
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || "Failed")

            setPayoutHistory(prev => [json, ...prev])
            setData(prev => prev ? { ...prev, pendingEarnings: 0 } : prev)
            setConfirmOpen(false)
            toast.success(
                `Request submitted! You will receive TZS ${expertShare.toLocaleString()} (80%). Platform fee: TZS ${platformFeeAmt.toLocaleString()} (20%). Settlement within 24–48 hours.`,
                { duration: 7000 }
            )
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to submit payout request")
        } finally {
            setSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-64 bg-muted/40 rounded" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-card" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Earnings & Payouts</h1>
                    <p className="text-muted-foreground">Track your revenue. 80% goes to you, 20% is the platform fee.</p>
                </div>
                <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={pendingAmount === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 h-11 shrink-0 disabled:opacity-50"
                >
                    <Download className="h-5 w-5" /> Request Payout
                </Button>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gross Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tabular-nums text-foreground">
                            {(data?.totalEarnings ?? 0).toLocaleString()} TZS
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total collected from students</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Your Net (80%)</CardTitle>
                        <Percent className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tabular-nums text-emerald-400">
                            {netEarnings.toLocaleString()} TZS
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">After 20% platform fee</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available to Request</CardTitle>
                        <Clock className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tabular-nums text-amber-400">
                            {pendingAmount.toLocaleString()} TZS
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ready for payout request</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tabular-nums text-foreground">
                            {(data?.thisMonth ?? 0).toLocaleString()} TZS
                        </div>
                        {data && data.lastMonth > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                                vs {data.lastMonth.toLocaleString()} last month
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left — Chart + Payout History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Monthly Breakdown */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">6-Month Revenue Breakdown</CardTitle>
                            <CardDescription className="text-muted-foreground">Gross earnings by month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data?.monthlyBreakdown?.length ? (
                                <div className="space-y-3">
                                    {data.monthlyBreakdown.map(entry => (
                                        <div key={entry.month} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-foreground/80">{entry.month}</span>
                                                <span className="font-bold text-emerald-400 tabular-nums">
                                                    {entry.earnings.toLocaleString()} TZS
                                                    <span className="text-muted-foreground font-normal ml-2">({entry.sessions} sessions)</span>
                                                </span>
                                            </div>
                                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.round((entry.earnings / maxEarnings) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No earnings data yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payout Request History */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Payout Request History</CardTitle>
                            <CardDescription className="text-muted-foreground">All your payout requests and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {payoutHistory.length ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground text-xs">
                                                <th className="py-3 font-semibold">Date</th>
                                                <th className="py-3 font-semibold">Gross</th>
                                                <th className="py-3 font-semibold text-emerald-400">Your 80%</th>
                                                <th className="py-3 font-semibold">Fee 20%</th>
                                                <th className="py-3 font-semibold">Method</th>
                                                <th className="py-3 font-semibold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {payoutHistory.map(p => (
                                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                        {new Date(p.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                    </td>
                                                    <td className="py-3 tabular-nums text-foreground">{p.amount.toLocaleString()}</td>
                                                    <td className="py-3 tabular-nums font-bold text-emerald-400">{p.expertAmount.toLocaleString()} TZS</td>
                                                    <td className="py-3 tabular-nums text-muted-foreground">{p.platformFee.toLocaleString()}</td>
                                                    <td className="py-3 text-xs text-muted-foreground">
                                                        {p.payoutMethod === "MOBILE_MONEY"
                                                            ? `Mobile (${p.mobileProvider ?? ""})`
                                                            : `Bank (${p.bankName ?? ""})`}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <Badge className={
                                                            p.status === "APPROVED"
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : p.status === "REJECTED"
                                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                        }>
                                                            {p.status}
                                                        </Badge>
                                                        {p.adminNote && (
                                                            <p className="text-xs text-muted-foreground mt-1">{p.adminNote}</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No payout requests yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right — Payout Settings */}
                <div>
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Payout Account Setup</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Configure where to receive your 80% share.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground/70 block">Payout Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => setPayoutMethod("MOBILE_MONEY")}
                                            className={payoutMethod === "MOBILE_MONEY"
                                                ? "bg-emerald-600 text-white"
                                                : "bg-transparent border border-border text-foreground hover:bg-muted/30"
                                            }
                                            size="sm"
                                        >
                                            <Smartphone className="h-4 w-4 mr-1.5" /> Mobile
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setPayoutMethod("BANK_TRANSFER")}
                                            className={payoutMethod === "BANK_TRANSFER"
                                                ? "bg-emerald-600 text-white"
                                                : "bg-transparent border border-border text-foreground hover:bg-muted/30"
                                            }
                                            size="sm"
                                        >
                                            <Building className="h-4 w-4 mr-1.5" /> Bank
                                        </Button>
                                    </div>
                                </div>

                                {payoutMethod === "MOBILE_MONEY" ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground/70">Provider</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                                value={mobileProvider}
                                                onChange={e => setMobileProvider(e.target.value)}
                                            >
                                                <option value="M-Pesa">Vodacom M-Pesa</option>
                                                <option value="Tigo Pesa">Tigo Pesa</option>
                                                <option value="Airtel Money">Airtel Money</option>
                                                <option value="HaloPesa">Halotel HaloPesa</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground/70">Phone Number *</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-emerald-500"
                                                placeholder="+255 712 345 678"
                                                value={mobileNumber}
                                                onChange={e => setMobileNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground/70">Bank Name</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                                value={bankName}
                                                onChange={e => setBankName(e.target.value)}
                                            >
                                                <option value="CRDB Bank">CRDB Bank Plc</option>
                                                <option value="NMB Bank">NMB Bank Plc</option>
                                                <option value="NBC Bank">NBC Bank Tanzania</option>
                                                <option value="Stanbic Bank">Stanbic Bank Tanzania</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground/70">Account Holder Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                                placeholder="Full legal name"
                                                value={accountName}
                                                onChange={e => setAccountName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground/70">Account Number *</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-emerald-500"
                                                placeholder="015xxxxxxxxxx"
                                                value={bankAccount}
                                                onChange={e => setBankAccount(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-foreground/70">Branch Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                                                placeholder="e.g. Dar es Salaam Main"
                                                value={bankBranch}
                                                onChange={e => setBankBranch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Breakdown preview */}
                                {pendingAmount > 0 && (
                                    <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 space-y-1 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Gross amount</span>
                                            <span className="font-mono">{pendingAmount.toLocaleString()} TZS</span>
                                        </div>
                                        <div className="flex justify-between text-red-400">
                                            <span>Platform fee (20%)</span>
                                            <span className="font-mono">− {platformFeeAmt.toLocaleString()} TZS</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-emerald-400 border-t border-border pt-1 mt-1">
                                            <span>You receive (80%)</span>
                                            <span className="font-mono">{expertShare.toLocaleString()} TZS</span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={pendingAmount === 0 || !canRequest}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2 disabled:opacity-50"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Request Payout
                                </Button>
                                {pendingAmount === 0 && (
                                    <p className="text-xs text-muted-foreground text-center">No pending earnings available.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirm Dialog */}
            <Dialog open={confirmOpen} onOpenChange={open => !open && !submitting && setConfirmOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Confirm Payout Request</DialogTitle>
                        <DialogDescription>
                            Review your payout breakdown before submitting.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                            <div className="flex justify-between text-foreground">
                                <span className="text-muted-foreground">Gross amount</span>
                                <span className="font-bold font-mono">{pendingAmount.toLocaleString()} TZS</span>
                            </div>
                            <div className="flex justify-between text-red-400">
                                <span>Platform fee (20%)</span>
                                <span className="font-mono">− {platformFeeAmt.toLocaleString()} TZS</span>
                            </div>
                            <div className="flex justify-between font-bold text-emerald-400 border-t border-border pt-2">
                                <span>You will receive (80%)</span>
                                <span className="font-mono text-lg">{expertShare.toLocaleString()} TZS</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground space-y-1">
                            <p className="font-medium text-foreground">Payment to:</p>
                            {payoutMethod === "MOBILE_MONEY" ? (
                                <p>{mobileProvider} · {mobileNumber}</p>
                            ) : (
                                <p>{bankName} · {accountNumber}{accountName ? ` · ${accountName}` : ""}</p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            By submitting, you confirm your payout details. The admin will review and process within 24–48 hours. You will receive an SMS confirmation once approved.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestPayout}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
