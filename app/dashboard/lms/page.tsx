"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { 
    BookOpen, 
    PlayCircle, 
    Clock, 
    Award, 
    ChevronRight, 
    Target, 
    Calendar,
    Activity,
    CheckCircle2,
    TrendingUp,
    Zap,
    GraduationCap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function StudentLmsOverview() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)

    // Mock data for the student experience
    const stats = {
        enrolledCourses: 3,
        completedLessons: 24,
        totalLessons: 45,
        readinessLevel: "INTERMEDIATE",
        readinessScore: 68,
        certificatesEarned: 1,
        totalHoursSpent: 12.5
    }

    const lastLesson = {
        title: "DSE Stock Valuation & Fundamental Analysis",
        courseName: "Introduction to Dar es Salaam Stock Market",
        progress: 45,
        courseId: "c1"
    }

    const upcomingSessions = [
        {
            id: "1",
            expertName: "Abasi Mwinyi",
            topic: "Portfolio Review",
            date: "Tomorrow, 14:00",
            type: "ONLINE"
        }
    ]

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-48 bg-white/5 rounded-lg" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 h-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 bg-white/5 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        Learning Hub <GraduationCap className="h-8 w-8 text-gold" />
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Welcome back, {user?.name.split(' ')[0]}. Here is your investment learning progress.
                    </p>
                </div>
                <Button asChild className="bg-gold text-navy hover:bg-gold/90 font-bold h-11 px-6 shadow-lg shadow-gold/10">
                    <Link href="/courses">
                        Explore Academy <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Top Stats Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/5 border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="h-12 w-12 text-gold" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.enrolledCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">2 in progress, 1 completed</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lessons Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.completedLessons} / {stats.totalLessons}</div>
                        <Progress value={(stats.completedLessons / stats.totalLessons) * 100} className="h-1.5 mt-2 bg-white/5" />
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="h-12 w-12 text-blue-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Investment Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.readinessLevel}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-blue-400 font-semibold">{stats.readinessScore}% Score</span>
                            <Link href="/dashboard/readiness" className="text-[10px] text-muted-foreground hover:text-white underline">Retake Quiz</Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award className="h-12 w-12 text-purple-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Certificates Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.certificatesEarned}</div>
                        <Link href="/dashboard/certificates" className="text-xs text-purple-400 hover:underline mt-1 block">View all certificates</Link>
                    </CardContent>
                </Card>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                
                {/* Left Column - Learning Progress */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Last Accessed Lesson Card */}
                    <Card className="bg-gradient-to-br from-navy/80 to-slate-900 border-gold/20 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                                <PlayCircle className="h-6 w-6 text-gold" />
                                Continue Learning
                            </CardTitle>
                            <CardDescription className="text-white/60">Pick up where you left off</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <div className="space-y-1 mb-4">
                                    <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors truncate">
                                        {lastLesson.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Course: <span className="text-white/80 font-medium">{lastLesson.courseName}</span>
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Course Progress</span>
                                        <span className="text-gold font-bold">{lastLesson.progress}%</span>
                                    </div>
                                    <Progress value={lastLesson.progress} className="h-2 bg-white/10" />
                                </div>
                                <Button asChild className="w-full mt-6 bg-gold text-navy hover:bg-gold/90 font-bold">
                                    <Link href={`/courses/${lastLesson.courseId}/learn`}>
                                        Resume Lesson <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Milestone Tracker */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-bold text-white/50 uppercase tracking-widest pl-1">Recent Achievements</h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">First Sale on DSE</p>
                                            <p className="text-[10px] text-muted-foreground">Module 2 Complete</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors opacity-60">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Bond Master</p>
                                            <p className="text-[10px] text-muted-foreground">Locked Achievement</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* My Learning Hub Quick Links */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-white/5 border-white/10 hover:border-gold/30 transition-all cursor-pointer group">
                             <Link href="/dashboard/my-courses">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">My Courses</h4>
                                        <p className="text-xs text-muted-foreground">Manage your enrollments</p>
                                    </div>
                                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-gold" />
                                </CardContent>
                             </Link>
                        </Card>

                        <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group">
                             <Link href="/dashboard/readiness">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Readiness Score</h4>
                                        <p className="text-xs text-muted-foreground">Update your profile</p>
                                    </div>
                                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-blue-400" />
                                </CardContent>
                             </Link>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Sideline Sidebar Content */}
                <div className="space-y-6">
                    {/* Upcoming Consultation */}
                    <Card className="bg-white/5 border-white/10 shadow-xl border-l-4 border-l-emerald-500">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-400" />
                                Upcoming Session
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingSessions.map(session => (
                                <div key={session.id} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                            {session.expertName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{session.expertName}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{session.type}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-white/90 font-medium">{session.topic}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" /> {session.date}
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" className="w-full bg-transparent border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 dark:bg-transparent h-9">
                                        <Link href="/lms/bookings">Manage Booking</Link>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Learning Path Recommendation */}
                    <Card className="bg-gold/5 border-gold/20 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-gold/10 rounded-full blur-2xl" />
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gold flex items-center gap-2">
                                <Zap className="h-5 w-5 fill-gold" />
                                Recommendation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            <p className="text-sm text-white/80 italic">
                                "Based on your score, you should focus on **Fixed Income** to diversify your risk."
                            </p>
                            <div className="bg-navy/80 p-3 rounded-lg border border-gold/10 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white">Tanzania Bonds 101</p>
                                    <p className="text-[10px] text-muted-foreground">Expert: Faraji Omary</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gold" />
                            </div>
                            <Button asChild className="w-full bg-gold/20 text-gold hover:bg-gold/30 border-none h-9 text-xs font-bold">
                                <Link href="/courses">View Masterclass</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Help & Support */}
                    <Card className="bg-white/5 border-white/10 border-dashed">
                        <CardContent className="p-6 text-center">
                            <h4 className="font-bold text-white mb-2">Need Help?</h4>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                Our investment mentors are here to guide your journey.
                            </p>
                            <Button variant="ghost" className="text-gold hover:text-gold/80 hover:bg-gold/5 text-xs">
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
