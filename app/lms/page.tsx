"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen, Clock, Calendar, Compass, Target,
    ArrowRight, Play, TrendingUp, CheckCircle2,
} from "lucide-react"

interface EnrolledCourse {
    id: string
    title: string
    thumbnailUrl: string | null
    category: string
    progress: number
    totalLessons: number
    completedLessons: number
    expert: { user: { name: string } }
}

interface Booking {
    id: string
    scheduledAt: string
    status: string
    expert: { user: { name: string } }
    sessionType: string
}

export default function LmsDashboardPage() {
    const { user } = useAuth()
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
    const [stats, setStats] = useState({ enrolled: 0, completed: 0, hoursLearned: 0, bookings: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, bookingsRes] = await Promise.all([
                    fetch("/api/lms/enrollments"),
                    fetch("/api/bookings?upcoming=true"),
                ])
                if (coursesRes.ok) {
                    const enrollments = await coursesRes.json()
                    const mapped = (Array.isArray(enrollments) ? enrollments : []).map((e: any) => ({
                        id: e.course?.id,
                        title: e.course?.title,
                        thumbnailUrl: e.course?.thumbnailUrl,
                        category: e.course?.category,
                        progress: e.progress || 0,
                        totalLessons: 0,
                        completedLessons: 0,
                        expert: e.course?.expert,
                    }))
                    setEnrolledCourses(mapped)
                    setStats(s => ({
                        ...s,
                        enrolled: mapped.length,
                        completed: mapped.filter((c: any) => c.progress === 100).length,
                        hoursLearned: 0,
                    }))
                }
                if (bookingsRes.ok) {
                    const data = await bookingsRes.json()
                    setUpcomingBookings((data.bookings || []).slice(0, 3))
                    setStats(s => ({ ...s, bookings: data.upcoming || 0 }))
                }
            } catch {
                // silently fall through to show empty state
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {greeting}, {user?.name?.split(" ")[0]}
                    </h1>
                    <p className="text-slate-500 dark:text-white/50 mt-1">Keep learning — consistency is the key to financial mastery.</p>
                </div>
                <Link href="/lms/explore">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Compass className="mr-2 h-4 w-4" />
                        Explore Courses
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    { label: "Enrolled", value: stats.enrolled, icon: BookOpen, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Hours Learned", value: stats.hoursLearned, icon: Clock, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Upcoming Sessions", value: stats.bookings, icon: Calendar, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                                <Icon className={`h-6 w-6 ${color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                                <p className="text-xs text-slate-500 dark:text-white/50">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Continue Learning */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Continue Learning</h2>
                        <Link href="/lms/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1">
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : enrolledCourses.length === 0 ? (
                        <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 border-dashed shadow-sm dark:shadow-none">
                            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                                <BookOpen className="h-12 w-12 text-gray-300 dark:text-white/20" />
                                <div>
                                    <p className="font-medium text-slate-600 dark:text-white/70">No courses yet</p>
                                    <p className="text-sm text-slate-400 dark:text-white/40 mt-1">Browse and enroll in a course to start learning.</p>
                                </div>
                                <Link href="/lms/explore">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse Courses</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        enrolledCourses.slice(0, 3).map((course) => (
                            <Link key={course.id} href={`/academy/course/${course.id}`}>
                                <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm dark:shadow-none">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-16 w-24 shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center overflow-hidden">
                                            {course.thumbnailUrl ? (
                                                <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <BookOpen className="h-7 w-7 text-blue-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">{course.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-slate-500 dark:text-white/50">{course.expert?.user?.name}</p>
                                                <span className="text-[10px] text-slate-400 dark:text-white/30">•</span>
                                                <span className="text-[10px] text-slate-400 dark:text-white/40">{course.completedLessons}/{course.totalLessons} lessons</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Progress value={course.progress} className="h-1.5 flex-1 bg-gray-200 dark:bg-white/10" />
                                                <span className="text-xs font-medium text-slate-600 dark:text-white/70 shrink-0">{Math.round(course.progress)}%</span>
                                            </div>
                                        </div>
                                        <Play className="h-8 w-8 shrink-0 text-blue-500 dark:text-blue-400 bg-blue-500/10 rounded-full p-2" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Upcoming Sessions */}
                    <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                Upcoming Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingBookings.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-slate-400 dark:text-white/40">No upcoming sessions.</p>
                                    <Link href="/experts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 block">
                                        Book a consultation
                                    </Link>
                                </div>
                            ) : upcomingBookings.map((booking) => (
                                <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                                    <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-900 dark:text-white">{booking.expert?.user?.name}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-white/50 mt-0.5">
                                            {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                                                weekday: "short", month: "short", day: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                        <Badge className="mt-1 text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 py-0">
                                            {booking.sessionType || "Online"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Investment Readiness */}
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 border-blue-200 dark:border-blue-500/20 shadow-sm dark:shadow-none">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                                <span className="font-semibold text-slate-900 dark:text-white text-sm">Investment Readiness</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
                                Test your investment knowledge and see how ready you are for the DSE market.
                            </p>
                            <Link href="/lms/readiness">
                                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Take Quiz
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
