"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    DollarSign,
    Users,
    CheckCircle,
    Star,
    Calendar,
    ArrowUpRight,
    PlusCircle,
    Sliders,
    BookOpen,
    Clock,
    Video,
    MapPin,
    AlertCircle,
    ChevronRight,
    TrendingUp,
    Play
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DashboardStats {
    totalEarnings: number
    earningsThisMonth: number
    earningsChange: string
    totalStudents: number
    activeStudents: number
    completedSessions: number
    totalCourses: number
    publishedCourses: number
    rating: number
}

interface BookingUser {
    id: string
    name: string
    email: string
    avatar: string | null
    phoneNumber: string | null
}

interface UpcomingBooking {
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
    user: BookingUser
}

interface RecentActivity {
    id: string
    userId: string
    courseId: string
    progress: number
    isCompleted: boolean
    enrolledAt: string
    user: { id: string; name: string; email: string; avatar: string | null }
    course: { id: string; title: string; slug: string }
}

interface Notification {
    id: string
    type: string
    title: string
    message: string
    actionUrl: string | null
    isRead: boolean
    createdAt: string
}

interface CourseAnalytic {
    id: string
    title: string
    students: number
    revenue: number
}

interface DashboardData {
    stats: DashboardStats
    courseAnalytics: CourseAnalytic[]
    upcomingBookings: UpcomingBooking[]
    todayBookings: UpcomingBooking[]
    recentActivity: RecentActivity[]
    notifications: Notification[]
}

export default function ExpertDashboardOverview() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/expert/dashboard")
            .then((r) => r.json())
            .then((d) => {
                setData(d)
                setLoading(false)
            })
            .catch(() => {
                toast.error("Failed to load dashboard data")
                setLoading(false)
            })
    }, [])

    const handleAcceptBooking = async (id: string) => {
        if (!data) return
        setData((prev) =>
            prev
                ? {
                      ...prev,
                      upcomingBookings: prev.upcomingBookings.map((b) =>
                          b.id === id ? { ...b, status: "CONFIRMED" } : b
                      ),
                  }
                : prev
        )
        try {
            await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CONFIRMED" }),
            })
            toast.success("Booking accepted successfully")
        } catch {
            toast.error("Failed to accept booking")
        }
    }

    const handleDeclineBooking = async (id: string) => {
        if (!data) return
        setData((prev) =>
            prev
                ? {
                      ...prev,
                      upcomingBookings: prev.upcomingBookings.filter((b) => b.id !== id),
                  }
                : prev
        )
        try {
            await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED", cancelReason: "Declined by expert" }),
            })
            toast.success("Booking declined successfully")
        } catch {
            toast.error("Failed to decline booking")
        }
    }

    const getSessionTypeBadge = (type: string) => {
        switch (type) {
            case "ONLINE":
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Online</Badge>
            case "PHYSICAL":
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">In-Person</Badge>
            case "GROUP":
                return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">Group</Badge>
            case "VIP_PRIVATE":
                return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">VIP Private</Badge>
            default:
                return <Badge>{type}</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Confirmed</Badge>
            case "PENDING":
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">Pending</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const formatBookingDateTime = (booking: UpcomingBooking) => {
        const date = new Date(booking.scheduledDate)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        let dateLabel: string
        if (date.toDateString() === today.toDateString()) {
            dateLabel = "Today"
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dateLabel = "Tomorrow"
        } else {
            dateLabel = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
        }

        return {
            date: dateLabel,
            time: `${booking.startTime} - ${booking.endTime}`,
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime()
        const hours = Math.floor(diff / 3600000)
        if (hours < 1) return "Just now"
        if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
        const days = Math.floor(hours / 24)
        if (days === 1) return "Yesterday"
        return `${days} days ago`
    }

    if (loading) {
        return (
            <div className="space-y-8 min-h-screen p-1">
                <div>
                    <div className="h-9 w-64 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-96 bg-muted/60 rounded animate-pulse mt-2" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-card rounded-xl animate-pulse" />
                        <div className="h-48 bg-card rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-32 bg-card rounded-xl animate-pulse" />
                        <div className="h-40 bg-card rounded-xl animate-pulse" />
                        <div className="h-48 bg-card rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    const stats = data?.stats
    const courseAnalytics = data?.courseAnalytics ?? []
    const upcomingBookings = data?.upcomingBookings ?? []
    const todayBookings = data?.todayBookings ?? []
    const recentActivity = data?.recentActivity ?? []
    const notifications = data?.notifications ?? []

    return (
        <div className="space-y-8 min-h-screen p-1">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Expert Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here is a summary of your investment advisory business.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tabular-nums">
                            {(stats?.totalEarnings ?? 0).toLocaleString()} TZS
                        </div>
                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            {stats?.earningsChange ?? "0%"} from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeStudents ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Enrolled in courses</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.completedSessions ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Consultations completed</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400">{stats?.rating?.toFixed(1) ?? "0.0"} / 5.0</div>
                        <p className="text-xs text-muted-foreground mt-1">From student feedback</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                                <CardDescription className="text-muted-foreground">Your next consultation sessions</CardDescription>
                            </div>
                            <Link href="/expert/bookings">
                                <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingBookings.map((booking) => {
                                    const { date, time } = formatBookingDateTime(booking)
                                    return (
                                        <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/30 border border-border/50 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                                    {booking.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">{booking.user.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" /> {date}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                                <div className="flex gap-2">
                                                    {getSessionTypeBadge(booking.sessionType)}
                                                    {getStatusBadge(booking.status)}
                                                </div>

                                                {booking.status === "PENDING" ? (
                                                    <div className="flex gap-1.5 shrink-0">
                                                        <Button
                                                            onClick={() => handleAcceptBooking(booking.id)}
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5"
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeclineBooking(booking.id)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-2.5"
                                                        >
                                                            Decline
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground text-xs h-7">
                                                        Details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

                                {upcomingBookings.length === 0 && (
                                    <div className="text-center p-6 text-muted-foreground italic">No upcoming bookings.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Course Activity</CardTitle>
                            <CardDescription className="text-muted-foreground">Latest enrollments and milestones in your courses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="py-3.5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                                            <div>
                                                <p className="text-sm">
                                                    <span className="font-semibold text-foreground">{activity.user.name}</span>{" "}
                                                    {activity.isCompleted ? "completed" : "enrolled in"}{" "}
                                                    <span className="text-emerald-400 font-medium">{activity.course.title}</span>
                                                </p>
                                                <span className="text-xs text-muted-foreground block mt-0.5">{formatTimeAgo(activity.enrolledAt)}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            className={cn(
                                                activity.isCompleted
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}
                                        >
                                            {activity.isCompleted ? "completed" : "enrolled"}
                                        </Badge>
                                    </div>
                                ))}

                                {recentActivity.length === 0 && (
                                    <div className="text-center p-6 text-muted-foreground italic">No recent course activity.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg">Course Performance</CardTitle>
                            <CardDescription className="text-muted-foreground">Analytics per course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {courseAnalytics.map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-sm truncate">{course.title}</h4>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {course.students} students
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm font-bold text-emerald-400">{course.revenue.toLocaleString()} TZS</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Revenue</p>
                                        </div>
                                    </div>
                                ))}
                                {courseAnalytics.length === 0 && (
                                    <div className="text-center p-6 text-muted-foreground italic">No course analytics available yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Link href="/expert/courses">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-start gap-2 h-11">
                                    <PlusCircle className="h-5 w-5" /> Create Course
                                </Button>
                            </Link>
                            <Link href="/expert/availability">
                                <Button variant="outline" className="w-full border-border hover:bg-muted/30 flex items-center justify-start gap-2 h-11">
                                    <Sliders className="h-5 w-5 text-emerald-400" /> Set Availability
                                </Button>
                            </Link>
                            <Link href="/expert/earnings">
                                <Button variant="outline" className="w-full border-border hover:bg-muted/30 flex items-center justify-start gap-2 h-11">
                                    <DollarSign className="h-5 w-5 text-emerald-400" /> View Earnings
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg">Today's Schedule</CardTitle>
                            <CardDescription className="text-muted-foreground">Sessions scheduled for today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {todayBookings.map((item) => (
                                    <div key={item.id} className="flex gap-3 border-l-2 border-emerald-500 pl-3 py-1 bg-muted/30 p-2.5 rounded-r">
                                        <div className="text-xs font-mono text-emerald-400 shrink-0 mt-0.5">{item.startTime}</div>
                                        <div>
                                            <h4 className="font-semibold text-xs text-foreground">{item.topic ?? item.category.replace(/_/g, " ")}</h4>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">Client: {item.user.name}</p>
                                            {item.meetingUrl && (
                                                <div className="flex gap-1.5 mt-2.5">
                                                    <Link href={`/api/bookings/${item.id}/join`} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-[10px] h-6 px-2 flex items-center gap-1">
                                                            <Play className="h-3 w-3 fill-white" /> Start Meet
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {todayBookings.length === 0 && (
                                    <div className="text-center p-4 text-muted-foreground/60 text-xs italic flex items-center justify-center gap-1.5">
                                        <AlertCircle className="h-4 w-4" /> No sessions scheduled today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="flex items-start gap-2.5 p-2 bg-muted/30 rounded text-xs">
                                        <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", notif.isRead ? "bg-transparent" : "bg-emerald-400")} />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-foreground/80", !notif.isRead && "font-medium text-foreground")}>{notif.message}</p>
                                            <span className="text-[10px] text-muted-foreground block mt-1">{formatTimeAgo(notif.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}

                                {notifications.length === 0 && (
                                    <div className="text-center p-4 text-muted-foreground/60 text-xs italic">No new notifications.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
