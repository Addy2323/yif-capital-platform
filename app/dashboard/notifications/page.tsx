"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  CheckCircle,
  Clock,
  MessageCircle,
  Settings,
} from "lucide-react"

const NOTIFICATION_ICONS: Record<string, any> = {
  BOOKING: Calendar,
  PAYMENT: CreditCard,
  SESSION_REMINDER: Clock,
  CERTIFICATE: Award,
  COURSE_UPDATE: BookOpen,
  EXPERT_RESPONSE: MessageCircle,
  SYSTEM: Settings,
}

const NOTIFICATION_COLORS: Record<string, string> = {
  BOOKING: "bg-blue-500/10 text-blue-500",
  PAYMENT: "bg-green-500/10 text-green-500",
  SESSION_REMINDER: "bg-gold/10 text-gold",
  CERTIFICATE: "bg-purple-500/10 text-purple-500",
  COURSE_UPDATE: "bg-cyan-500/10 text-cyan-500",
  EXPERT_RESPONSE: "bg-orange-500/10 text-orange-500",
  SYSTEM: "bg-muted text-muted-foreground",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/lms/notifications")
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch("/api/lms/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/lms/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead} className="text-sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No Notifications</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              You&apos;ll receive notifications for bookings, payments, and course updates here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: any) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Bell
            const colorClass = NOTIFICATION_COLORS[notification.type] || "bg-muted text-muted-foreground"

            return (
              <Card
                key={notification.id}
                className={`transition-all cursor-pointer hover:border-gold/30 ${
                  !notification.isRead ? "border-gold/20 bg-gold/[0.02]" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) markAsRead(notification.id)
                  if (notification.actionUrl) window.location.href = notification.actionUrl
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      <span className="text-xs text-muted-foreground/60 mt-1 block">
                        {new Date(notification.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
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
