"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    Search,
    AlertCircle,
    Check,
    X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface BookingUser {
    id: string
    name: string
    email: string
    avatar: string | null
    phoneNumber: string | null
}

interface Booking {
    id: string
    userId: string
    expertId: string
    sessionType: string
    category: string
    topic: string | null
    scheduledDate: string
    startTime: string
    endTime: string
    status: string
    price: number
    currency: string
    meetingUrl: string | null
    location: string | null
    notes: string | null
    cancelReason: string | null
    user: BookingUser
}

export default function BookingsManager() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("ALL")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [cancelReasonInput, setCancelReasonInput] = useState("")
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/bookings?role=expert")
            .then((r) => r.json())
            .then((data) => {
                setBookings(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => {
                toast.error("Failed to load bookings")
                setLoading(false)
            })
    }, [])

    const filteredBookings = bookings.filter((booking) => {
        const matchesTab = activeTab === "ALL" || booking.status === activeTab
        const clientName = booking.user?.name ?? ""
        const matchesSearch =
            clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.topic && booking.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
            booking.category.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesTab && matchesSearch
    })

    const handleAccept = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setBookings((prev) =>
            prev.map((b) =>
                b.id === id ? { ...b, status: "CONFIRMED" } : b
            )
        )
        try {
            await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CONFIRMED" }),
            })
            toast.success("Booking confirmed successfully!")
        } catch {
            toast.error("Failed to confirm booking")
        }
    }

    const handleOpenCancelDialog = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setBookingToCancel(id)
        setCancelReasonInput("")
        setIsCancelDialogOpen(true)
    }

    const handleCancelConfirm = async () => {
        if (!bookingToCancel) return
        const reason = cancelReasonInput || "Cancelled by expert"
        setBookings((prev) =>
            prev.map((b) =>
                b.id === bookingToCancel
                    ? { ...b, status: "CANCELLED", cancelReason: reason }
                    : b
            )
        )
        try {
            await fetch(`/api/bookings/${bookingToCancel}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED", cancelReason: reason }),
            })
            toast.error("Booking cancelled.")
        } catch {
            toast.error("Failed to cancel booking")
        }
        setIsCancelDialogOpen(false)
        setBookingToCancel(null)
    }

    const getSessionTypeBadge = (type: string) => {
        switch (type) {
            case "ONLINE":
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Online Video</Badge>
            case "PHYSICAL":
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">In-Person</Badge>
            case "GROUP":
                return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">Group Session</Badge>
            case "VIP_PRIVATE":
                return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-bold">VIP Private</Badge>
            default:
                return <Badge className="bg-white/10 text-foreground/80">{type}</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">Pending Approval</Badge>
            case "CONFIRMED":
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Confirmed</Badge>
            case "COMPLETED":
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Completed</Badge>
            case "CANCELLED":
                return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Cancelled</Badge>
            default:
                return <Badge className="bg-white/10 text-foreground/80">{status}</Badge>
        }
    }

    const formatCategory = (cat: string) => {
        return cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: "short", year: "numeric", month: "long", day: "numeric" }
        return new Date(dateString).toLocaleDateString("en-US", options)
    }

    if (loading) {
        return (
            <div className="space-y-8 min-h-screen p-1">
                <div className="h-10 w-64 bg-slate-700 rounded animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 min-h-screen p-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Consulting Bookings</h1>
                    <p className="text-muted-foreground">
                        Manage your incoming advisory requests, session schedule, and virtual classrooms.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border border-border">
                <div className="flex flex-wrap gap-2">
                    {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            variant={activeTab === tab ? "default" : "ghost"}
                            className={
                                activeTab === tab
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "text-foreground/70 hover:bg-muted/30 hover:text-foreground"
                            }
                            size="sm"
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by client, topic..."
                        className="w-full bg-background/60 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                    <Card
                        key={booking.id}
                        onClick={() => {
                            setSelectedBooking(booking)
                            setIsDetailsOpen(true)
                        }}
                        className="bg-card border-border hover:border-emerald-500/30 cursor-pointer transition-all duration-300 text-card-foreground group"
                    >
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                        {(booking.user?.name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-semibold group-hover:text-emerald-400 transition-colors">
                                                {booking.user?.name ?? "Unknown Client"}
                                            </h3>
                                            <Badge className="bg-muted text-emerald-400 border border-border/50 text-[11px]">
                                                {formatCategory(booking.category)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-foreground/90 line-clamp-1">
                                            {booking.topic || "No specific topic provided"}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-emerald-400" /> {formatDate(booking.scheduledDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5 text-emerald-400" /> {booking.startTime} - {booking.endTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-border/50 pt-4 lg:pt-0">
                                    <div className="text-left sm:text-right shrink-0">
                                        <span className="text-xs text-muted-foreground block">Earnings</span>
                                        <span className="text-lg font-bold text-emerald-400 tabular-nums">
                                            {booking.price.toLocaleString()} TZS
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end gap-1">
                                            {getSessionTypeBadge(booking.sessionType)}
                                            {getStatusBadge(booking.status)}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            {booking.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        onClick={(e) => { e.stopPropagation(); handleAccept(booking.id) }}
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3"
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> Accept
                                                    </Button>
                                                    <Button
                                                        onClick={(e) => handleOpenCancelDialog(booking.id, e)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-9 px-3"
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Decline
                                                    </Button>
                                                </>
                                            )}

                                            {booking.status === "CONFIRMED" && booking.meetingUrl && (
                                                <Link href={`/api/bookings/${booking.id}/join`} target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 flex items-center gap-1"
                                                    >
                                                        <Video className="h-4 w-4" /> Start Meeting
                                                    </Button>
                                                </Link>
                                            )}

                                            {booking.status === "CONFIRMED" && !booking.meetingUrl && booking.sessionType === "PHYSICAL" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-9 flex items-center gap-1"
                                                    onClick={() => toast.info(`Physical Session location: ${booking.location}`)}
                                                >
                                                    <MapPin className="h-4 w-4" /> Physical Meeting
                                                </Button>
                                            )}

                                            {booking.status === "CONFIRMED" && (
                                                <Button
                                                    onClick={(e) => handleOpenCancelDialog(booking.id, e)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 px-2"
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredBookings.length === 0 && (
                    <div className="text-center p-12 bg-muted/20 border border-dashed border-border rounded-2xl">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-foreground">No bookings found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                            No sessions match your search terms or filter constraints at the moment.
                        </p>
                    </div>
                )}
            </div>

            {selectedBooking && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="bg-background border-border text-foreground max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Session Details
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Detailed insights regarding the consultation booking.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 my-4">
                            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                                        {(selectedBooking.user?.name ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{selectedBooking.user?.name ?? "Unknown"}</h4>
                                        <p className="text-xs text-muted-foreground">Client Investor</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs text-foreground/70">
                                    <div>
                                        <span className="text-muted-foreground block">Email</span>
                                        <span className="font-mono">{selectedBooking.user?.email ?? "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Phone</span>
                                        <span className="font-mono">{selectedBooking.user?.phoneNumber ?? "—"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Topic / Subject</span>
                                    <p className="font-semibold text-foreground bg-card p-2.5 rounded-lg border border-border/50">
                                        {selectedBooking.topic || "No topic specified"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-0.5">Date & Time</span>
                                        <span className="font-medium text-foreground flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-emerald-400" /> {formatDate(selectedBooking.scheduledDate)}
                                        </span>
                                        <span className="text-xs text-muted-foreground block">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-0.5">Category</span>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                            {formatCategory(selectedBooking.category)}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-0.5">Meeting Type</span>
                                        {getSessionTypeBadge(selectedBooking.sessionType)}
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-0.5">Price</span>
                                        <span className="font-bold text-emerald-400">
                                            {selectedBooking.price.toLocaleString()} TZS
                                        </span>
                                    </div>
                                </div>

                                {selectedBooking.notes && (
                                    <div className="pt-2">
                                        <span className="text-xs text-muted-foreground block mb-1">Investor Notes</span>
                                        <div className="text-xs text-foreground/80 bg-muted/30 border border-border/50 p-3 rounded-lg leading-relaxed italic">
                                            "{selectedBooking.notes}"
                                        </div>
                                    </div>
                                )}

                                {selectedBooking.location && (
                                    <div className="pt-1">
                                        <span className="text-xs text-muted-foreground block mb-1">Physical Location</span>
                                        <p className="text-xs text-amber-400 flex items-center gap-1 bg-amber-500/5 p-2 rounded border border-amber-500/20">
                                            <MapPin className="h-3.5 w-3.5" /> {selectedBooking.location}
                                        </p>
                                    </div>
                                )}

                                {selectedBooking.status === "CANCELLED" && selectedBooking.cancelReason && (
                                    <div className="pt-2">
                                        <span className="text-xs text-muted-foreground block mb-1">Cancellation Reason</span>
                                        <p className="text-xs text-red-400 bg-red-500/5 p-2 rounded border border-red-500/20">
                                            {selectedBooking.cancelReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setIsDetailsOpen(false)}>
                                Close
                            </Button>
                            {selectedBooking.status === "PENDING" && (
                                <Button
                                    onClick={() => {
                                        handleAccept(selectedBooking.id)
                                        setIsDetailsOpen(false)
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Accept Request
                                </Button>
                            )}
                            {selectedBooking.status === "CONFIRMED" && selectedBooking.meetingUrl && (
                                <Link href={`/api/bookings/${selectedBooking.id}/join`} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5">
                                        <Video className="h-4 w-4" /> Start Session
                                    </Button>
                                </Link>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="bg-background border-border text-foreground max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Cancel Consultation</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Please provide a brief reason for declining or cancelling this booking. The client will be notified.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4">
                        <textarea
                            className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-red-500/50"
                            placeholder="e.g. Schedule overlap, need to reschedule..."
                            rows={3}
                            value={cancelReasonInput}
                            onChange={(e) => setCancelReasonInput(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setIsCancelDialogOpen(false)}>
                            Keep Booking
                        </Button>
                        <Button onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
