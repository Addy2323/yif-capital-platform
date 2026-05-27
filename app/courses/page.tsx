"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  Search,
  Star,
  Users,
  BookOpen,
  Clock,
  ArrowRight,
  Filter,
  GraduationCap,
  PlayCircle,
  TrendingUp,
  Award,
} from "lucide-react"

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "STOCK_MARKET", label: "Stock Market" },
  { value: "BONDS_FIXED_INCOME", label: "Bonds & Fixed Income" },
  { value: "MUTUAL_FUNDS", label: "Mutual Funds" },
  { value: "PERSONAL_FINANCE", label: "Personal Finance" },
  { value: "REAL_ESTATE_ALT", label: "Real Estate & Alt" },
  { value: "ENTREPRENEURSHIP_BUSINESS", label: "Business & Entr" },
  { value: "INSURANCE_RISK", label: "Insurance & Risk" },
  { value: "SACCOS_COOPERATIVE", label: "SACCOs & Coop" },
]

const LEVELS = [
  { value: "", label: "All Levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
]

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

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string | null
  thumbnailUrl: string | null
  category: string
  level: string
  price: number
  currency: string
  isFree: boolean
  rating: number
  totalEnrollments: number
  totalLessons: number
  totalDuration: number
  expert: {
    user: { id: string; name: string; avatar: string | null }
  }
  _count: { modules: number; enrollments: number }
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [category, level])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (level) params.set("level", level)
      if (search) params.set("search", search)

      const res = await fetch(`/api/lms/courses?${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setCourses(data)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-border bg-navy py-16 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-navy" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up" className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold">
                <GraduationCap className="h-4 w-4" />
                Expert-Led Courses
              </div>
              <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
                Learn Investment from the Best
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/70">
                Comprehensive investment courses taught by verified Tanzanian experts.
                From stock market basics to advanced portfolio strategies.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); fetchCourses() }} className="mt-8 flex w-full max-w-xl gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="h-12 border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-gold"
                  />
                </div>
                <Button type="submit" className="h-12 bg-gold text-navy hover:bg-gold/90 px-6">
                  Search
                </Button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-gold" /><span>Expert Content</span></div>
                <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gold" /><span>Certificates</span></div>
                <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-gold" /><span>Progress Tracking</span></div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-muted/30 py-4">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
              </div>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      category === cat.value
                        ? "bg-gold text-navy"
                        : "bg-card border border-border text-muted-foreground hover:border-gold/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-border shrink-0" />
              <div className="flex gap-2">
                {LEVELS.map((lv) => (
                  <button
                    key={lv.value}
                    onClick={() => setLevel(lv.value)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      level === lv.value
                        ? "bg-gold text-navy"
                        : "bg-card border border-border text-muted-foreground hover:border-gold/50"
                    }`}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6 space-y-4">
                      <div className="h-40 rounded-lg bg-muted" />
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold">No Courses Found</h3>
                <p className="mt-2 text-muted-foreground max-w-md">
                  {search || category || level
                    ? "Try adjusting your filters."
                    : "Courses will appear here once experts publish them."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => (
                  <ScrollAnimation key={course.id} animation="slide-up" delay={index * 50}>
                    <Link href={`/courses/${course.slug}`} className="block">
                      <Card className="group overflow-hidden transition-all hover:border-gold/50 hover:shadow-lg hover:-translate-y-1 h-full">
                        {/* Thumbnail */}
                        <div className="relative h-44 bg-gradient-to-br from-navy to-navy-light overflow-hidden">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <GraduationCap className="h-16 w-16 text-gold/30" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className={`text-[10px] ${course.level === "BEGINNER" ? "bg-success" : course.level === "INTERMEDIATE" ? "bg-gold text-navy" : "bg-navy text-white"}`}>
                              {course.level}
                            </Badge>
                            {course.isFree && <Badge className="bg-success text-white text-[10px]">FREE</Badge>}
                          </div>
                        </div>

                        <CardContent className="p-5">
                          <Badge variant="secondary" className="text-[10px] mb-2">
                            {CATEGORY_LABELS[course.category] || course.category}
                          </Badge>
                          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-gold transition-colors">
                            {course.title}
                          </h3>
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                            {course.shortDescription || course.description}
                          </p>

                          {/* Expert */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-bold">
                              {course.expert.user.name.charAt(0)}
                            </div>
                            <span className="text-xs text-muted-foreground">{course.expert.user.name}</span>
                          </div>

                          {/* Stats */}
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {course.rating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {course.totalEnrollments}
                            </span>
                            <span className="flex items-center gap-1">
                              <PlayCircle className="h-3.5 w-3.5" /> {course.totalLessons} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {course.totalDuration}m
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            <span className="font-bold text-gold text-lg">
                              {course.isFree ? "Free" : `${course.currency} ${course.price.toLocaleString()}`}
                            </span>
                            <span className="text-xs text-gold font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              View Course <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </ScrollAnimation>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
