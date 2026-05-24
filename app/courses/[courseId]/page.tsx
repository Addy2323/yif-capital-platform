"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollAnimation } from "@/components/ui/scroll-animation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import {
  Star,
  Users,
  BookOpen,
  Clock,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Lock,
  Award,
  Globe,
  BarChart3,
  FileText,
  Video,
} from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  STOCK_MARKET: "Stock Market", REAL_ESTATE: "Real Estate", BONDS_TREASURY: "Bonds & Treasury",
  SACCO_INVESTMENT: "SACCO Investment", FOREX_EDUCATION: "Forex Education", MUTUAL_FUNDS: "Mutual Funds",
  STARTUP_INVESTMENT: "Startup Investment", PERSONAL_FINANCE: "Personal Finance", SME_INVESTMENT: "SME Investment",
}

function toEmbedUrl(url: string): string {
  // youtube.com/watch?v=ID  →  youtube.com/embed/ID
  const ytWatch = url.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1`

  // youtu.be/ID  →  youtube.com/embed/ID
  const ytShort = url.match(/youtu\.be\/([\w-]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1`

  // vimeo.com/ID  →  player.vimeo.com/video/ID
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`

  return url
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courseSlug = params.courseId as string
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [previewLesson, setPreviewLesson] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!course?.enrollmentDeadline) return

    const calculateTimeLeft = () => {
      const difference = +new Date(course.enrollmentDeadline) - +new Date()
      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
      setIsExpired(false)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [course?.enrollmentDeadline])

  useEffect(() => {
    fetch(`/api/lms/courses/${courseSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setCourse(data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [courseSlug])

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please log in to enroll")
      router.push("/login")
      return
    }

    if (course.isEnrolled) {
      router.push(`/courses/${course.slug}/learn`)
      return
    }

    // For paid courses, redirect to checkout
    if (!course.isFree && course.price > 0) {
      router.push(`/courses/${courseSlug}/checkout`)
      return
    }

    // Free course enrollment
    setIsEnrolling(true)
    try {
      const res = await fetch(`/api/lms/courses/${course.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Enrolled successfully!")
        setCourse({ ...course, isEnrolled: true, enrollment: data.enrollment })
      } else {
        toast.error(data.error || "Failed to enroll")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold">Course Not Found</h2>
          <Button asChild className="mt-4 bg-gold text-navy hover:bg-gold/90">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const totalLessons = course.modules?.reduce(
    (sum: number, m: any) => sum + (m.lessons?.length || 0), 0
  ) || 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white/60 hover:text-white hover:bg-white/10 mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-gold/20 text-gold border-gold/30">
                      {CATEGORY_LABELS[course.category] || course.category}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white/80">
                      {course.level}
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl text-balance">
                    {course.title}
                  </h1>
                  <p className="mt-4 text-lg text-white/70">
                    {course.shortDescription || course.description?.slice(0, 200)}
                  </p>

                  {/* Expert Info */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold overflow-hidden shrink-0">
                      {course.expert?.user?.avatar || course.instructorPhotoUrl ? (
                        <img
                          src={course.expert?.user?.avatar || course.instructorPhotoUrl}
                          alt={course.expert?.user?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        course.expert?.user?.name?.charAt(0) || "E"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{course.expert?.user?.name}</p>
                      <p className="text-xs text-white/60">Investment Expert</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="text-white font-medium">{course.rating?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gold" />
                      <span>{course._count?.enrollments || course.totalEnrollments} enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PlayCircle className="h-4 w-4 text-gold" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gold" />
                      <span>{course.totalDuration} min</span>
                    </div>
                  </div>
                </div>

                {/* Enrollment Card */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-8 border-gold/20">
                    <CardContent className="p-6 space-y-4">
                      {/* Thumbnail */}
                      <div className="relative h-40 rounded-xl bg-gradient-to-br from-navy to-navy-light overflow-hidden">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2">
                            <GraduationCap className="h-14 w-14 text-gold/30" />
                            <span className="text-xs text-white/30">No banner uploaded</span>
                          </div>
                        )}
                        {/* Instructor avatar overlay */}
                        {(course.expert?.user?.avatar || course.instructorPhotoUrl) && (
                          <div className="absolute bottom-2 left-3">
                            <img
                              src={course.expert?.user?.avatar || course.instructorPhotoUrl}
                              alt={course.expert?.user?.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold/40"
                            />
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gold">
                          {course.isFree ? "Free" : `${course.currency} ${course.price?.toLocaleString()}`}
                        </div>
                      </div>

                      {/* Enrollment Progress */}
                      {course.isEnrolled && course.enrollment && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(course.enrollment.progress)}%</span>
                          </div>
                          <Progress value={course.enrollment.progress} className="h-2" />
                        </div>
                      )}

                      {/* Countdown Timer */}
                      {course.enrollmentDeadline && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center space-y-1">
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                            {isExpired ? "Enrollment Closed" : "Enrollment Closes In"}
                          </span>
                          {timeLeft ? (
                            <div className="flex justify-center gap-2 text-white font-mono text-sm font-semibold">
                              <div>
                                <span className="text-amber-400">{timeLeft.days}</span>d
                              </div>
                              <div>
                                <span className="text-amber-400">{timeLeft.hours.toString().padStart(2, '0')}</span>h
                              </div>
                              <div>
                                <span className="text-amber-400">{timeLeft.minutes.toString().padStart(2, '0')}</span>m
                              </div>
                              <div>
                                <span className="text-amber-400">{timeLeft.seconds.toString().padStart(2, '0')}</span>s
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-red-500">Expired</span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <Button
                        className="w-full bg-gold text-navy hover:bg-gold/90 h-12 text-base font-semibold animate-all duration-200"
                        onClick={handleEnroll}
                        disabled={isEnrolling || (isExpired && !course.isEnrolled)}
                      >
                        {isEnrolling ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                        ) : course.isEnrolled ? (
                          <>Continue Learning <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : isExpired ? (
                          <>Enrollment Closed</>
                        ) : course.isFree ? (
                          <>Enroll for Free <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : (
                          <>Enroll Now <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>

                      {/* Features */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <PlayCircle className="h-4 w-4 text-gold shrink-0" />
                          <span>{totalLessons} lessons ({course.totalDuration} minutes)</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Award className="h-4 w-4 text-gold shrink-0" />
                          <span>Certificate of Completion</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Globe className="h-4 w-4 text-gold shrink-0" />
                          <span>Lifetime access</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <BarChart3 className="h-4 w-4 text-gold shrink-0" />
                          <span>Progress tracking</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>About this Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Curriculum */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Curriculum</span>
                      <Badge variant="secondary" className="text-xs">
                        {course.modules?.length || 0} modules · {totalLessons} lessons
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.modules?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Curriculum coming soon.
                      </p>
                    ) : (
                      <Accordion type="multiple" className="w-full">
                        {course.modules?.map((module: any, moduleIndex: number) => (
                          <AccordionItem key={module.id} value={module.id} className="border-border">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 text-left">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold text-sm font-bold shrink-0">
                                  {moduleIndex + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">{module.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {module.lessons?.length || 0} lessons
                                    {module.quizzes?.length > 0 && ` · ${module.quizzes.length} quiz`}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1 pl-11">
                                {module.lessons?.map((lesson: any, lessonIndex: number) => {
                                  const canAccess = lesson.isFree || course.isEnrolled
                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() => canAccess && setPreviewLesson(lesson)}
                                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${canAccess ? "cursor-pointer" : "cursor-default"}`}
                                    >
                                      {canAccess ? (
                                        <PlayCircle className="h-4 w-4 text-gold shrink-0" />
                                      ) : (
                                        <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                      )}
                                      <span className={`flex-1 ${canAccess ? "text-foreground" : "text-muted-foreground"}`}>{lesson.title}</span>
                                      <div className="flex items-center gap-2">
                                        {lesson.isFree && !course.isEnrolled && (
                                          <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                                            Preview
                                          </Badge>
                                        )}
                                        {lesson.duration > 0 && (
                                          <span className="text-xs text-muted-foreground/60">
                                            {lesson.duration < 60 ? `${lesson.duration}s` : `${Math.round(lesson.duration / 60)}m`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                                {module.quizzes?.map((quiz: any) => (
                                  <div
                                    key={quiz.id}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                                  >
                                    <FileText className="h-4 w-4 text-purple-500 shrink-0" />
                                    <span className="flex-1 text-muted-foreground">{quiz.title}</span>
                                    <Badge variant="outline" className="text-[10px]">
                                      {quiz._count?.questions || 0} questions
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>

                {/* Expert Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-xl shrink-0">
                        {course.expert?.user?.avatar ? (
                          <img src={course.expert.user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                        ) : (
                          course.expert?.user?.name?.charAt(0) || "E"
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.expert?.user?.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Investment Expert</p>
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <Link href={`/experts/${course.expertId}`}>
                            View Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Lesson preview modal */}
      <Dialog open={!!previewLesson} onOpenChange={open => !open && setPreviewLesson(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{previewLesson?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video */}
            {previewLesson?.videoUrl && (
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                {previewLesson.videoUrl.startsWith("/uploads/") ? (
                  <video
                    src={previewLesson.videoUrl}
                    controls
                    className="w-full h-full"
                    autoPlay
                  />
                ) : (
                  <iframe
                    src={toEmbedUrl(previewLesson.videoUrl)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            )}

            {/* PDF */}
            {previewLesson?.pdfUrl && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" /> Document
                </p>
                {previewLesson.pdfUrl.startsWith("/uploads/") ? (
                  <iframe
                    src={previewLesson.pdfUrl}
                    className="w-full rounded-lg border border-border"
                    style={{ height: "400px" }}
                  />
                ) : (
                  <a
                    href={previewLesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary underline"
                  >
                    Open document
                  </a>
                )}
              </div>
            )}

            {/* Text content */}
            {previewLesson?.content && (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {previewLesson.content}
              </div>
            )}

            {/* Nothing to show */}
            {!previewLesson?.videoUrl && !previewLesson?.pdfUrl && !previewLesson?.content && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No preview content available for this lesson yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
