"use client"

import { use, useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  PlayCircle,
  Clock,
  Award,
  BookOpen,
  Check,
  Lock,
  ArrowLeft,
  Crown,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

const coursesData: Record<string, {
  title: string
  description: string
  level: string
  duration: string
  lessons: { title: string; duration: string; free: boolean }[]
}> = {
  basics: {
    title: "Capital Markets Basics",
    description:
      "Learn the fundamentals of investing, stock markets, and how to start your investment journey. This comprehensive course covers everything from understanding what stocks are to making your first investment.",
    level: "Beginner",
    duration: "4 hours",
    lessons: [
      { title: "Introduction to Capital Markets", duration: "15 min", free: true },
      { title: "What Are Stocks?", duration: "20 min", free: true },
      { title: "Understanding the DSE", duration: "25 min", free: true },
      { title: "How Stock Prices Move", duration: "20 min", free: false },
      { title: "Reading Stock Quotes", duration: "15 min", free: false },
      { title: "Types of Orders", duration: "20 min", free: false },
      { title: "Opening a Brokerage Account", duration: "15 min", free: false },
      { title: "Making Your First Trade", duration: "25 min", free: false },
      { title: "Understanding Risk", duration: "20 min", free: false },
      { title: "Building a Watchlist", duration: "15 min", free: false },
      { title: "Investment Goals", duration: "20 min", free: false },
      { title: "Course Summary & Next Steps", duration: "10 min", free: false },
    ],
  },
  technical: {
    title: "Technical Analysis Fundamentals",
    description:
      "Master chart patterns, indicators, and technical trading strategies for better timing. Learn how professional traders analyze price movements and make informed decisions.",
    level: "Intermediate",
    duration: "6 hours",
    lessons: [
      { title: "Introduction to Technical Analysis", duration: "20 min", free: false },
      { title: "Chart Types & Timeframes", duration: "25 min", free: false },
      { title: "Support & Resistance", duration: "30 min", free: false },
      { title: "Trend Lines & Channels", duration: "25 min", free: false },
      { title: "Moving Averages", duration: "30 min", free: false },
      { title: "Volume Analysis", duration: "20 min", free: false },
      { title: "RSI Indicator", duration: "25 min", free: false },
      { title: "MACD Indicator", duration: "25 min", free: false },
      { title: "Bollinger Bands", duration: "20 min", free: false },
      { title: "Candlestick Patterns", duration: "35 min", free: false },
      { title: "Chart Patterns", duration: "30 min", free: false },
      { title: "Building a Trading Strategy", duration: "35 min", free: false },
    ],
  },
  valuation: {
    title: "Stock Valuation & Analysis",
    description:
      "Deep dive into financial statements, valuation metrics, and fundamental analysis techniques. Learn how to evaluate companies like professional analysts.",
    level: "Intermediate",
    duration: "8 hours",
    lessons: [
      { title: "Introduction to Valuation", duration: "20 min", free: false },
      { title: "Understanding Financial Statements", duration: "35 min", free: false },
      { title: "Income Statement Analysis", duration: "30 min", free: false },
      { title: "Balance Sheet Analysis", duration: "30 min", free: false },
      { title: "Cash Flow Analysis", duration: "30 min", free: false },
      { title: "Key Financial Ratios", duration: "35 min", free: false },
      { title: "P/E Ratio Deep Dive", duration: "25 min", free: false },
      { title: "P/B and P/S Ratios", duration: "25 min", free: false },
      { title: "Dividend Analysis", duration: "20 min", free: false },
      { title: "DCF Valuation Basics", duration: "40 min", free: false },
      { title: "Comparative Valuation", duration: "30 min", free: false },
      { title: "Industry Analysis", duration: "25 min", free: false },
    ],
  },
  portfolio: {
    title: "Portfolio Management",
    description:
      "Build and manage a diversified portfolio with professional asset allocation strategies. Learn how to balance risk and return for your investment goals.",
    level: "Advanced",
    duration: "10 hours",
    lessons: [
      { title: "Portfolio Theory Basics", duration: "30 min", free: false },
      { title: "Risk & Return", duration: "35 min", free: false },
      { title: "Diversification Principles", duration: "30 min", free: false },
      { title: "Asset Allocation", duration: "40 min", free: false },
      { title: "Rebalancing Strategies", duration: "25 min", free: false },
      { title: "Performance Measurement", duration: "30 min", free: false },
      { title: "Benchmark Comparison", duration: "25 min", free: false },
      { title: "Tax Considerations", duration: "25 min", free: false },
      { title: "Investment Policy", duration: "30 min", free: false },
      { title: "Behavioral Finance", duration: "35 min", free: false },
      { title: "Advanced Strategies", duration: "40 min", free: false },
      { title: "Building Your Portfolio", duration: "35 min", free: false },
    ],
  },
}

function CourseContent({ courseId }: { courseId: string }) {
  const { user } = useAuth()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [currentLesson, setCurrentLesson] = useState(0)

  const course = coursesData[courseId]

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Course Not Found</h1>
            <p className="mt-2 text-muted-foreground">The requested course does not exist.</p>
            <Button asChild className="mt-6">
              <Link href="/academy">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Academy
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const progress = (completedLessons.length / course.lessons.length) * 100

  const handleCompleteLesson = (index: number) => {
    if (!completedLessons.includes(index)) {
      setCompletedLessons([...completedLessons, index])
    }
    if (index < course.lessons.length - 1) {
      setCurrentLesson(index + 1)
    }
  }

  const canAccessLesson = (lesson: { free: boolean }, index: number) => {
    return lesson.free || isPro || index === 0
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Course Header */}
        <div className="border-b border-border bg-background py-8">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/academy">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Academy
              </Link>
            </Button>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${course.level === "Beginner"
                    ? "bg-success/10 text-success"
                    : course.level === "Intermediate"
                      ? "bg-gold/10 text-gold"
                      : "bg-navy/10 text-navy dark:bg-white/10 dark:text-white"
                    }`}
                >
                  {course.level}
                </span>
                <h1 className="mt-3 text-3xl font-bold text-foreground">{course.title}</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">{course.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessons.length} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Certificate included
                  </span>
                </div>
              </div>

              <Card className="w-full lg:w-80">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Progress</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{Math.round(progress)}%</p>
                    <Progress value={progress} className="mt-3" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {completedLessons.length} of {course.lessons.length} lessons completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Lesson List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {course.lessons.map((lesson, index) => {
                      const isCompleted = completedLessons.includes(index)
                      const isCurrent = currentLesson === index
                      const canAccess = canAccessLesson(lesson, index)

                      return (
                        <button
                          key={lesson.title}
                          onClick={() => canAccess && setCurrentLesson(index)}
                          disabled={!canAccess}
                          className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${isCurrent
                            ? "bg-gold/10"
                            : canAccess
                              ? "hover:bg-muted/50"
                              : "opacity-60"
                            }`}
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isCompleted
                              ? "bg-success text-white"
                              : isCurrent
                                ? "bg-gold text-navy"
                                : "bg-muted text-muted-foreground"
                              }`}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : !canAccess ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`truncate text-sm font-medium ${isCurrent ? "text-gold" : "text-foreground"
                                }`}
                            >
                              {lesson.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                          </div>
                          {lesson.free && !isPro && (
                            <span className="rounded bg-success/10 px-1.5 py-0.5 text-xs text-success">
                              Free
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lesson Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-gold" />
                    {course.lessons[currentLesson].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {canAccessLesson(course.lessons[currentLesson], currentLesson) ? (
                    <>
                      {/* Video Placeholder */}
                      <div className="aspect-video rounded-lg bg-navy flex items-center justify-center">
                        <div className="text-center text-white">
                          <PlayCircle className="mx-auto h-16 w-16 text-gold" />
                          <p className="mt-4 text-lg font-medium">
                            {course.lessons[currentLesson].title}
                          </p>
                          <p className="mt-1 text-white/70">
                            Duration: {course.lessons[currentLesson].duration}
                          </p>
                        </div>
                      </div>

                      {/* Lesson Controls */}
                      <div className="mt-6 flex items-center justify-between">
                        <Button
                          variant="outline"
                          disabled={currentLesson === 0}
                          onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                        >
                          Previous Lesson
                        </Button>
                        <Button
                          onClick={() => handleCompleteLesson(currentLesson)}
                          className="bg-gold text-navy hover:bg-gold/90"
                        >
                          {completedLessons.includes(currentLesson) ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Completed
                            </>
                          ) : currentLesson === course.lessons.length - 1 ? (
                            "Complete Course"
                          ) : (
                            "Mark as Complete"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center p-8">
                      <Lock className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        This lesson requires Pro
                      </h3>
                      <p className="mt-2 text-center text-muted-foreground">
                        Upgrade to Pro to unlock all lessons and earn your certificate.
                      </p>
                      <Button asChild className="mt-6 bg-gold text-navy hover:bg-gold/90">
                        <Link href="/contact">
                          <Crown className="mr-2 h-4 w-4" />
                          Inquire About Pro
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <CourseContent courseId={id} />
  )
}
