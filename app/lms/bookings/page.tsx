"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, MapPin, Clock, Plus } from "lucide-react"

interface Booking {
    id: string
    scheduledDate: string
    startTime: string
    endTime: string
    status: string
    sessionType: string
    topic: string | null
    notes: string | null
    expert: { user: { name: string; avatar: string | null } }
}

const STATUS_STYLES: Record<string, string> = {
    CONFIRMED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

export default function LmsBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/bookings")
                if (res.ok) {
                    const data = await res.json()
                    setBookings(data.bookings || data || [])
                }
            } catch {
                // silently handle
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const now = new Date()
    const upcoming = bookings.filter(b => new Date(b.scheduledDate) >= now && b.status !== "CANCELLED")
    const past = bookings.filter(b => new Date(b.scheduledDate) < now || b.status === "COMPLETED" || b.status === "CANCELLED")
    const displayed = tab === "upcoming" ? upcoming : past

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
                    <p className="text-slate-500 dark:text-white/50 mt-1">Manage your consultation sessions with experts</p>
                </div>
                <Link href="/experts">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Book a Session
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg w-fit">
                {(["upcoming", "past"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                            tab === t
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        {t} {t === "upcoming" ? `(${upcoming.length})` : `(${past.length})`}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse" />)}
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Calendar className="h-16 w-16 text-gray-300 dark:text-white/20" />
                    <div className="text-center">
                        <p className="font-semibold text-slate-500 dark:text-white/60">
                            {tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
                        </p>
                        {tab === "upcoming" && (
                            <Link href="/experts">
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Find an Expert</Button>
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayed.map(booking => {
                        const date = new Date(booking.scheduledDate)
                        return (
                            <Card key={booking.id} className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                                        <span className="text-[10px] font-medium uppercase">
                                            {date.toLocaleDateString("en-US", { month: "short" })}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-slate-900 dark:text-white">{booking.expert?.user?.name}</p>
                                            <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING}`}>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                        {booking.topic && (
                                            <p className="text-sm text-slate-600 dark:text-white/70 mt-0.5 truncate">{booking.topic}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 dark:text-white/50">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {booking.startTime} – {booking.endTime} · {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {booking.sessionType === "ONLINE" || booking.sessionType === "VIP_PRIVATE" ? (
                                                    <><Video className="h-3 w-3" /> Online</>
                                                ) : (
                                                    <><MapPin className="h-3 w-3" /> In-Person</>
                                                )}
                                            </span>
                                        </div>
                                        {booking.notes && (
                                            <p className="text-xs text-slate-400 dark:text-white/40 mt-1 truncate">{booking.notes}</p>
                                        )}
                                    </div>
                                    {tab === "upcoming" && booking.status === "CONFIRMED" && (booking.sessionType === "ONLINE" || booking.sessionType === "VIP_PRIVATE") && (
                                        <Link href={`/api/bookings/${booking.id}/join`} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                                                <Video className="mr-1.5 h-3.5 w-3.5" /> Join
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
