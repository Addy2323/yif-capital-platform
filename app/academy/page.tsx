"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { LiveSessionsDashboard } from "@/components/dashboard/live-sessions"
import { Video } from "lucide-react"

const courses = [
  {
    id: "basics",
    title: "Capital Markets Basics",
    description: "Learn the fundamentals of investing, stock markets, and how to start your investment journey.",
    level: "Beginner",
    duration: "4 hours",
    lessons: 12,
    enrolled: 2450,
    rating: 4.8,
    icon: BookOpen,
    free: true,
  },
  {
    id: "technical",
    title: "Technical Analysis Fundamentals",
    description: "Master chart patterns, indicators, and technical trading strategies for better timing.",
    level: "Intermediate",
    duration: "6 hours",
    lessons: 18,
    enrolled: 1820,
    rating: 4.9,
    icon: TrendingUp,
    free: false,
  },
  {
    id: "valuation",
    title: "Stock Valuation & Analysis",
    description: "Deep dive into financial statements, valuation metrics, and fundamental analysis techniques.",
    level: "Intermediate",
    duration: "8 hours",
    lessons: 24,
    enrolled: 1350,
    rating: 4.7,
    icon: BarChart3,
    free: false,
  },
  {
    id: "portfolio",
    title: "Portfolio Management",
    description: "Build and manage a diversified portfolio with professional asset allocation strategies.",
    level: "Advanced",
    duration: "10 hours",
    lessons: 28,
    enrolled: 980,
    rating: 4.9,
    icon: PieChart,
    free: false,
  },
]


function AcademyContent() {
  const { user } = useAuth()
  const [showSessions, setShowSessions] = useState(false)
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
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

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {courses.map((course, index) => (
                <ScrollAnimation key={course.id} animation="slide-up" delay={index * 50}>
                  <Card
                    className="overflow-hidden transition-all hover:border-gold/50 hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                          <course.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">{course.title}</h3>
                            {course.free ? (
                              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                                Free
                              </span>
                            ) : !isPro ? (
                              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                                Pro
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${course.level === "Beginner"
                            ? "bg-success/10 text-success"
                            : course.level === "Intermediate"
                              ? "bg-gold/10 text-gold"
                              : "bg-navy/10 text-navy dark:bg-white/10 dark:text-white"
                            }`}
                        >
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-gold text-gold" />
                          {course.rating}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        {course.free || isPro ? (
                          <Button asChild className="flex-1 bg-gold text-navy hover:bg-gold/90">
                            <Link href={`/academy/course/${course.id}`}>
                              Start Learning
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" className="flex-1 bg-transparent border-gold/30 text-gold hover:bg-gold/10">
                            <Link href="/contact">
                              <Crown className="mr-2 h-4 w-4" />
                              Contact for Pro
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
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
