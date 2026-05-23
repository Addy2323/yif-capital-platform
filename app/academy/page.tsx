"use client"

import { useState, useEffect, useMemo } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  Clock,
  Award,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowRight,
  Check,
  Crown,
  Star,
  Video,
  LayoutDashboard,
  ShieldCheck,
  Coins,
  Globe,
  Briefcase,
  PieChart as PortfolioIcon,
} from "lucide-react"
import Link from "next/link"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { LiveSessionsDashboard } from "@/components/dashboard/live-sessions"

const CATEGORY_ICONS: Record<string, any> = {
  STOCK_MARKET: TrendingUp,
  REAL_ESTATE: Briefcase,
  BONDS_TREASURY: ShieldCheck,
  SACCO_INVESTMENT: Users,
  FOREX_EDUCATION: Globe,
  MUTUAL_FUNDS: Coins,
  STARTUP_INVESTMENT: BarChart3,
  PERSONAL_FINANCE: PortfolioIcon,
  SME_INVESTMENT: LayoutDashboard,
}

function AcademyContent() {
  const { user } = useAuth()
  const [showSessions, setShowSessions] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  useEffect(() => {
    fetch("/api/lms/courses")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCourses(data)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* ... Hero Section remains unchanged ... */}
        {/* Hero */}
        <section className="relative border-b border-border bg-navy py-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/logo%20payment/background/academy.png"
              alt="Background"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-navy/60" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up" className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold">
                <GraduationCap className="h-4 w-4" />
                YIF Academy
              </div>
              <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
                Learn to Invest with Confidence
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/70">
                Comprehensive investment education from the basics to advanced strategies.
                Learn at your own pace with expert-led courses.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/60">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gold" />
                  <span>82 Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold" />
                  <span>28+ Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span>6,600+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gold" />
                  <span>Certificates</span>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Live Sessions Feature Card */}
        <section className="py-12 lg:py-16 bg-gradient-to-b from-navy/5 to-transparent">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up">
              {!showSessions ? (
                <Card
                  className="relative overflow-hidden border-gold/30 bg-navy text-white cursor-pointer group hover:border-gold/50 transition-all duration-300"
                  onClick={() => setShowSessions(true)}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Video className="h-32 w-32 text-gold" />
                  </div>
                  <CardContent className="p-8 md:p-12">
                    <div className="max-w-3xl space-y-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold">
                        <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
                        Live Experience
                      </div>
                      <h2 className="text-3xl font-bold sm:text-4xl text-white">
                        Interactive Live Sessions
                      </h2>
                      <p className="text-lg text-white/70 leading-relaxed">
                        Elevate your investment strategy with real-time expert guidance.
                        Our Interactive Live Sessions bring you direct access to market professionals,
                        deep-dive analysis, and interactive Q&A sessions designed to sharpen your edge
                        in the Tanzanian and global markets.
                      </p>
                      <Button
                        size="lg"
                        className="bg-gold text-navy hover:bg-gold/90 font-bold"
                      >
                        Explore Live & Upcoming Sessions
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Live & Upcoming Sessions</h2>
                      <p className="text-muted-foreground">Join our real-time interactive masterclasses</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSessions(false)}
                      className="text-gold hover:text-gold/80 hover:bg-gold/10"
                    >
                      Close Sessions
                    </Button>
                  </div>
                  <LiveSessionsDashboard />
                </div>
              )}
            </ScrollAnimation>
          </div>
        </section>


        {/* Courses */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">All Courses</h2>
                <p className="mt-2 text-muted-foreground">
                  Expert-led courses to build your investment knowledge
                </p>
              </div>
              {!isPro && (
                <Button asChild className="hidden bg-gold text-navy hover:bg-gold/90 sm:flex">
                  <Link href="/contact">
                    <Crown className="mr-2 h-4 w-4" />
                    Inquire About Pro
                  </Link>
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="mt-12 flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-12 text-center py-20 border-2 border-dashed border-muted rounded-2xl">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No courses available yet</h3>
                <p className="text-sm text-muted-foreground/60 mt-1">Check back later for new investment courses.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {courses.map((course, index) => {
                  const Icon = CATEGORY_ICONS[course.category] || BookOpen
                  return (
                    <ScrollAnimation key={course.id} animation="slide-up" delay={index * 50}>
                      <Card
                        className="overflow-hidden transition-all hover:border-gold/50 hover:shadow-lg h-full flex flex-col"
                      >
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-card-foreground line-clamp-1">{course.title}</h3>
                                {course.isFree ? (
                                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                                    Free
                                  </span>
                                ) : !isPro ? (
                                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase text-gold">
                                    Pro
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {course.shortDescription || course.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto pt-6">
                            <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground mb-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${course.level === "BEGINNER" || course.level === "Beginner"
                                  ? "bg-success/10 text-success"
                                  : course.level === "INTERMEDIATE" || course.level === "Intermediate"
                                    ? "bg-gold/10 text-gold"
                                    : "bg-navy/10 text-navy dark:bg-white/10 dark:text-white"
                                  }`}
                              >
                                {course.level?.toLowerCase()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.round(course.totalDuration / 60) || 0}h {course.totalDuration % 60}m
                              </span>
                              <span className="flex items-center gap-1">
                                <PlayCircle className="h-4 w-4" />
                                {course.totalLessons || 0} lessons
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-gold text-gold" />
                                {course.rating?.toFixed(1) || "0.0"}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              {course.isFree || isPro ? (
                                <Button asChild className="flex-1 bg-gold text-navy hover:bg-gold/90 font-bold">
                                  <Link href={`/academy/course/${course.id}`}>
                                    Start Learning
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button asChild variant="outline" className="flex-1 bg-transparent border-gold/30 text-gold hover:bg-gold/10 font-bold">
                                  <Link href={`/courses/${course.slug || course.id}`}>
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollAnimation>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-border bg-muted/30 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Why Learn with YIF Academy?</h2>
              <p className="mt-2 text-muted-foreground">
                Everything you need to become a confident investor
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BookOpen,
                  title: "Expert Content",
                  description: "Courses designed by industry professionals",
                },
                {
                  icon: Award,
                  title: "Certificates",
                  description: "Earn certificates upon completion",
                },
                {
                  icon: Clock,
                  title: "Self-paced",
                  description: "Learn at your own schedule",
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Connect with fellow learners",
                },
              ].map((benefit, index) => (
                <ScrollAnimation key={benefit.title} animation="zoom-in" delay={index * 100} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <benefit.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Start Learning Today
              </h2>
              <p className="mt-4 text-white/70">
                Join thousands of students building their investment knowledge.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="bg-gold text-navy hover:bg-gold/90">
                  <Link href={user ? "/academy" : "/register"}>
                    {user ? "Continue Learning" : "Get Started Free"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <Link href="/contact">Inquire About Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function AcademyPage() {
  return (
    <AcademyContent />
  )
}
