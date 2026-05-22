"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BookOpen, Calendar, Award, CheckCheck, MessageSquare, CreditCard, AlertCircle } from "lucide-react"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    actionUrl: string | null
    isRead: boolean
    createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    BOOKING: { icon: Calendar, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10" },
    PAYMENT: { icon: CreditCard, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    SESSION_REMINDER: { icon: Calendar, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
    CERTIFICATE: { icon: Award, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" },
    COURSE_UPDATE: { icon: BookOpen, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
    EXPERT_RESPONSE: { icon: MessageSquare, color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10" },
    SYSTEM: { icon: Bell, color: "text-slate-400 dark:text-white/60", bg: "bg-gray-100 dark:bg-white/10" },
}

const DEFAULT_CONFIG = { icon: Bell, color: "text-slate-400 dark:text-white/60", bg: "bg-gray-100 dark:bg-white/10" }

function formatTimeAgo(dateString: string) {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    return `${days} days ago`
}

export default function LmsNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/lms/notifications")
            .then((r) => r.json())
            .then((data) => {
                setNotifications(Array.isArray(data.notifications) ? data.notifications : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const unreadCount = notifications.filter((n) => !n.isRead).length

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        try {
            await fetch("/api/lms/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            })
        } catch {
            // silently fail — optimistic update already applied
        }
    }

    const markRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
        try {
            await fetch("/api/lms/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [id] }),
            })
        } catch {
            // silently fail
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 max-w-2xl">
                <div className="h-10 w-48 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white border-0">{unreadCount}</Badge>
                        )}
                    </h1>
                    <p className="text-slate-500 dark:text-white/50 mt-1">Stay updated on your learning activity</p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={markAllRead}
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-300 dark:border-white/20 text-slate-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                    >
                        <CheckCheck className="mr-2 h-3.5 w-3.5" />
                        Mark all read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-16">
                    <AlertCircle className="h-12 w-12 text-slate-300 dark:text-white/20 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-white/40">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => {
                        const config = TYPE_CONFIG[notification.type] ?? DEFAULT_CONFIG
                        const Icon = config.icon
                        return (
                            <Card
                                key={notification.id}
                                className={`border-gray-200 dark:border-white/10 cursor-pointer transition-colors shadow-sm dark:shadow-none ${
                                    notification.isRead
                                        ? "bg-white dark:bg-white/3"
                                        : "bg-blue-50 dark:bg-white/10 border-l-2 border-l-blue-500"
                                }`}
                                onClick={() => markRead(notification.id)}
                            >
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-semibold ${notification.isRead ? "text-slate-600 dark:text-white/70" : "text-slate-900 dark:text-white"}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5 leading-relaxed">{notification.message}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-white/30 mt-1.5">{formatTimeAgo(notification.createdAt)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
