"use client"

import { useState, useEffect } from "react"
import {
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    Smartphone,
    Building2,
    Loader2,
    Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"

interface PayoutRequest {
    id: string
    amount: number
    expertAmount: number
    platformFee: number
    status: "PENDING" | "APPROVED" | "REJECTED"
    payoutMethod: string
    mobileProvider: string | null
    mobileNumber: string | null
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
    branchName: string | null
    adminNote: string | null
    requestedAt: string
    processedAt: string | null
    expert: {
        user: {
            id: string
            name: string
            email: string
            phoneNumber: string | null
            avatar: string | null
        }
    }
}

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const

export default function AdminPayoutRequestsPage() {
    const [requests, setRequests] = useState<PayoutRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<typeof STATUS_FILTERS[number]>("ALL")

    // Action dialog
    const [actionDialog, setActionDialog] = useState<{
        open: boolean
        mode: "APPROVE" | "REJECT"
        request: PayoutRequest | null
    }>({ open: false, mode: "APPROVE", request: null })
    const [adminNote, setAdminNote] = useState("")
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        loadRequests()
    }, [])

    async function loadRequests() {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/payout-requests")
            if (res.ok) setRequests(await res.json())
        } catch {
            toast.error("Failed to load payout requests")
        } finally {
            setLoading(false)
        }
    }

    async function handleAction() {
        if (!actionDialog.request) return
        setProcessing(true)
        try {
            const res = await fetch(`/api/admin/payout-requests/${actionDialog.request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: actionDialog.mode, adminNote: adminNote || undefined }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed")
            }
            const updated = await res.json()
            setRequests(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
            toast.success(`Payout request ${actionDialog.mode === "APPROVE" ? "approved" : "rejected"} successfully.`)
            setActionDialog({ open: false, mode: "APPROVE", request: null })
            setAdminNote("")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Action failed")
        } finally {
            setProcessing(false)
        }
    }

    const filtered = filter === "ALL" ? requests : requests.filter(r => r.status === filter)
    const pending = requests.filter(r => r.status === "PENDING")
    const totalPending = pending.reduce((s, r) => s + r.amount, 0)
    const totalExpertShare = pending.reduce((s, r) => s + r.expertAmount, 0)
    const totalPlatformFee = pending.reduce((s, r) => s + r.platformFee, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Payout Requests</h1>
                <p className="text-white/60 text-sm mt-1">Review and process expert payout requests. All amounts are in TZS.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-slate-700/50 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400">{pending.length}</div>
                        <p className="text-xs text-white/50 mt-1">Total gross: {totalPending.toLocaleString()} TZS</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Expert Payouts (80%)</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{totalExpertShare.toLocaleString()} TZS</div>
                        <p className="text-xs text-white/50 mt-1">To be sent to experts</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-white/60">Platform Revenue (20%)</CardTitle>
                        <DollarSign className="h-4 w-4 text-gold" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gold">{totalPlatformFee.toLocaleString()} TZS</div>
                        <p className="text-xs text-white/50 mt-1">Platform fee from pending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-white/50" />
                {STATUS_FILTERS.map(s => (
                    <Button
                        key={s}
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilter(s)}
                        className={filter === s
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }
                    >
                        {s}
                        {s !== "ALL" && (
                            <span className="ml-1.5 text-xs opacity-70">
                                ({requests.filter(r => r.status === s).length})
                            </span>
                        )}
                    </Button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No {filter !== "ALL" ? filter.toLowerCase() : ""} payout requests.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(req => (
                        <Card key={req.id} className="bg-slate-700/40 border-white/10">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Expert info */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold shrink-0">
                                            {req.expert.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white">{req.expert.user.name}</p>
                                            <p className="text-xs text-white/50">{req.expert.user.email}</p>
                                            {req.expert.user.phoneNumber && (
                                                <p className="text-xs text-white/40">{req.expert.user.phoneNumber}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount breakdown */}
                                    <div className="flex gap-4 text-sm shrink-0">
                                        <div className="text-center">
                                            <p className="text-white/50 text-xs">Gross (100%)</p>
                                            <p className="font-bold text-white tabular-nums">{req.amount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-emerald-400 text-xs">Expert (80%)</p>
                                            <p className="font-bold text-emerald-400 tabular-nums">{req.expertAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gold text-xs">Platform (20%)</p>
                                            <p className="font-bold text-gold tabular-nums">{req.platformFee.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Payment method */}
                                    <div className="text-sm shrink-0">
                                        <div className="flex items-center gap-1.5 text-white/60">
                                            {req.payoutMethod === "MOBILE_MONEY"
                                                ? <Smartphone className="h-3.5 w-3.5" />
                                                : <Building2 className="h-3.5 w-3.5" />
                                            }
                                            <span className="text-xs">
                                                {req.payoutMethod === "MOBILE_MONEY"
                                                    ? `${req.mobileProvider ?? "Mobile"} · ${req.mobileNumber}`
                                                    : `${req.bankName ?? "Bank"} · ${req.accountNumber}`
                                                }
                                            </span>
                                        </div>
                                        {req.accountName && <p className="text-xs text-white/40 mt-0.5">{req.accountName}</p>}
                                    </div>

                                    {/* Date + Status + Actions */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <p className="text-xs text-white/40">
                                            {new Date(req.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                        <Badge className={
                                            req.status === "APPROVED"
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                : req.status === "REJECTED"
                                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                        }>
                                            {req.status}
                                        </Badge>
                                        {req.status === "PENDING" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                                                    onClick={() => {
                                                        setActionDialog({ open: true, mode: "APPROVE", request: req })
                                                        setAdminNote("")
                                                    }}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1"
                                                    onClick={() => {
                                                        setActionDialog({ open: true, mode: "REJECT", request: req })
                                                        setAdminNote("")
                                                    }}
                                                >
                                                    <XCircle className="h-3.5 w-3.5" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                        {req.adminNote && (
                                            <p className="text-xs text-white/40 max-w-[180px] text-right">{req.adminNote}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Action Dialog */}
            <Dialog
                open={actionDialog.open}
                onOpenChange={open => !open && !processing && setActionDialog(d => ({ ...d, open: false }))}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.mode === "APPROVE" ? "Approve Payout" : "Reject Payout"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.request && (
                                <>
                                    Expert: <strong>{actionDialog.request.expert.user.name}</strong> ·
                                    Amount: <strong>TZS {actionDialog.request.expertAmount.toLocaleString()}</strong> (80% of {actionDialog.request.amount.toLocaleString()})
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {actionDialog.request && actionDialog.mode === "APPROVE" && (
                            <div className="rounded-lg bg-muted/30 border border-border p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Gross</span>
                                    <span className="font-mono">{actionDialog.request.amount.toLocaleString()} TZS</span>
                                </div>
                                <div className="flex justify-between text-emerald-500">
                                    <span>Send to expert (80%)</span>
                                    <span className="font-mono font-bold">{actionDialog.request.expertAmount.toLocaleString()} TZS</span>
                                </div>
                                <div className="flex justify-between text-amber-500">
                                    <span>Platform keeps (20%)</span>
                                    <span className="font-mono">{actionDialog.request.platformFee.toLocaleString()} TZS</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                {actionDialog.mode === "REJECT" ? "Reason (required)" : "Note (optional)"}
                            </label>
                            <Textarea
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                placeholder={actionDialog.mode === "REJECT"
                                    ? "Explain why the request is rejected..."
                                    : "Any notes for the expert..."
                                }
                                className="text-foreground resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog(d => ({ ...d, open: false }))} disabled={processing} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={processing || (actionDialog.mode === "REJECT" && !adminNote.trim())}
                            className={actionDialog.mode === "APPROVE"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }
                        >
                            {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {actionDialog.mode === "APPROVE" ? "Approve & Notify Expert" : "Reject & Notify Expert"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
