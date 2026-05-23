"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Play, CheckCircle2, Clock, Compass } from "lucide-react"

interface EnrolledCourse {
    id: string
    title: string
    slug: string
    thumbnailUrl: string | null
    category: string
    level: string
    progress: number
    totalLessons: number
    completedLessons: number
    isCompleted: boolean
    expert: { user: { name: string } }
}

const LEVEL_COLORS: Record<string, string> = {
    BEGINNER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    INTERMEDIATE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    ADVANCED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
}

export default function LmsMyCoursesPage() {
    const [courses, setCourses] = useState<EnrolledCourse[]>([])
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/lms/enrollments")
                if (res.ok) {
                    const enrollments = await res.json()
                    const mapped = (Array.isArray(enrollments) ? enrollments : []).map((e: any) => ({
                        id: e.course?.id,
                        title: e.course?.title,
                        slug: e.course?.slug,
                        thumbnailUrl: e.course?.thumbnailUrl,
                        category: e.course?.category,
                        level: e.course?.level,
                        progress: e.progress || 0,
                        totalLessons: 0,
                        completedLessons: 0,
                        isCompleted: (e.progress || 0) >= 100,
                        expert: e.course?.expert,
                    }))
                    setCourses(mapped)
                }
            } catch {
                // silently handle
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</h1>
                    <p className="text-slate-500 dark:text-white/50 mt-1">Your enrolled learning paths</p>
                </div>
                <Link href="/lms/explore">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Compass className="mr-2 h-4 w-4" /> Browse More
                    </Button>
                </Link>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/40" />
                <Input
                    placeholder="Search your courses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40"
                />
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <BookOpen className="h-16 w-16 text-gray-300 dark:text-white/20" />
                    <div className="text-center">
                        <p className="font-semibold text-slate-500 dark:text-white/60">
                            {search ? "No courses match your search" : "You haven't enrolled in any courses yet"}
                        </p>
                        {!search && (
                            <Link href="/lms/explore">
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Explore Courses</Button>
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(course => (
                        <Link key={course.id} href={`/academy/course/${course.id}`}>
                            <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors h-full cursor-pointer group shadow-sm dark:shadow-none">
                                <div className="h-40 rounded-t-lg overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 relative">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-12 w-12 text-blue-300/40" />
                                        </div>
                                    )}
                                    {course.isCompleted && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-emerald-500 text-white border-0 text-[10px]">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm">{course.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{course.expert?.user?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[course.level] || LEVEL_COLORS.BEGINNER}`}>
                                            {course.level}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 dark:text-white/40 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {course.completedLessons}/{course.totalLessons} lessons
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500 dark:text-white/50">Progress</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{course.progress}%</span>
                                        </div>
                                        <Progress value={course.progress} className="h-1.5 bg-gray-200 dark:bg-white/10" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
