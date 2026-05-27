"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Users } from "lucide-react"

interface Course {
    id: string
    title: string
    slug: string
    shortDescription: string | null
    thumbnailUrl: string | null
    category: string
    level: string
    price: number
    isFree: boolean
    currency: string
    expert: { user: { name: string; avatar: string | null } }
    _count: { modules: number; enrollments: number }
}

const LEVEL_COLORS: Record<string, string> = {
    BEGINNER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    INTERMEDIATE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    ADVANCED: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
}

const CATEGORY_LABELS: Record<string, string> = {
    STOCK_MARKET: "Stock Market Investing",
    BONDS_FIXED_INCOME: "Bond & Fixed Income Investing",
    MUTUAL_FUNDS: "Mutual Funds Investing",
    PERSONAL_FINANCE: "Personal Finance",
    REAL_ESTATE_ALT: "Real Estate & Alternative Investments",
    ENTREPRENEURSHIP_BUSINESS: "Entrepreneurship & Business Finance",
    INSURANCE_RISK: "Insurance & Risk Management",
    SACCOS_COOPERATIVE: "SACCOs & Cooperative Finance",
}

export default function LmsExplorePage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [search, setSearch] = useState("")
    const [selectedLevel, setSelectedLevel] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const params = new URLSearchParams()
                if (search) params.set("search", search)
                if (selectedLevel) params.set("level", selectedLevel)
                const res = await fetch(`/api/lms/courses?${params}`)
                if (res.ok) setCourses(await res.json())
            } catch {
                // silently handle
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [search, selectedLevel])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Courses</h1>
                <p className="text-slate-500 dark:text-white/50 mt-1">Discover expert-led financial education</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/40" />
                    <Input
                        placeholder="Search courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map(level => (
                        <Button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            size="sm"
                            className={
                                selectedLevel === level
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-transparent border-gray-300 dark:border-white/20 text-slate-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                            }
                            variant="outline"
                        >
                            {level || "All Levels"}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-72 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <BookOpen className="h-16 w-16 text-gray-300 dark:text-white/20" />
                    <p className="text-slate-500 dark:text-white/50">No courses found. Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map(course => (
                        <Link key={course.id} href={`/courses/${course.slug || course.id}`}>
                            <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors h-full cursor-pointer group overflow-hidden shadow-sm dark:shadow-none">
                                <div className="h-40 overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 relative">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-12 w-12 text-blue-300/40" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-black/60 text-white border-0 text-[10px] backdrop-blur-sm">
                                            {CATEGORY_LABELS[course.category] || course.category}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-3">
                                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">{course.title}</p>
                                    {course.shortDescription && (
                                        <p className="text-xs text-slate-500 dark:text-white/50 line-clamp-2">{course.shortDescription}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
                                            {course.expert?.user?.name?.charAt(0)}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-white/60 truncate">{course.expert?.user?.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-[10px] ${LEVEL_COLORS[course.level] || LEVEL_COLORS.BEGINNER}`}>
                                                {course.level}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 dark:text-white/40 flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {course._count.enrollments}
                                            </span>
                                        </div>
                                        <span className={`text-sm font-bold ${course.isFree ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                            {course.isFree ? "Free" : `${course.currency} ${course.price.toLocaleString()}`}
                                        </span>
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
