"use client"

import { use, useState, useEffect } from "react"
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
  CheckCircle2,
  Video,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function toEmbedUrl(url: string | null): string {
  if (!url) return ""
  const ytWatch = url.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`
  const ytShort = url.match(/youtu\.be\/([\w-]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

function CourseContent({ courseId }: { courseId: string }) {
  const { user } = useAuth()
  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"
  const [course, setCourse] = useState<any>(null)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/lms/courses/${courseId}`)
        const data = await res.json()
        if (res.ok && !data.error) {
          setCourse(data)
          // Default to first lesson of first module
          const firstLesson = data.modules?.[0]?.lessons?.[0]
          if (firstLesson) setActiveLesson(firstLesson)
        }
      } catch (err) {
        console.error("Failed to load course:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCourse()
  }, [courseId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </main>
        <Footer />
      </div>
    )
  }

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

  const enrollment = course.enrollment
  const progress = enrollment?.progress || 0
  const isEnrolled = course.isEnrolled

  const handleToggleComplete = async (lessonId: string, currentStatus: boolean | undefined) => {
    if (!isEnrolled) {
      toast.error("Please enroll to track progress")
      return
    }
    setIsToggling(true)
    try {
      const res = await fetch(`/api/lms/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Update local course state
        const updatedModules = course.modules.map((m: any) => ({
          ...m,
          lessons: m.lessons.map((l: any) => 
            l.id === lessonId ? { ...l, isCompleted: !currentStatus } : l
          )
        }))
        setCourse({ ...course, modules: updatedModules, enrollment: data.enrollment })
        
        if (activeLesson?.id === lessonId) {
          setActiveLesson({ ...activeLesson, isCompleted: !currentStatus })
        }
        
        toast.success(currentStatus ? "Lesson marked incomplete" : "Lesson marked complete!")
      }
    } catch (err) {
      toast.error("Failed to update progress")
    } finally {
      setIsToggling(false)
    }
  }

  const allLessons = course.modules?.flatMap((m: any) => m.lessons) || []
  const activeIndex = allLessons.findIndex((l: any) => l.id === activeLesson?.id)

  const canAccessLesson = (lesson: any) => {
    return lesson.isFree || isEnrolled || isPro
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
              <div className="flex-1">
                <span className="inline-block rounded-full bg-gold/10 px-3 py-1 text-xs font-bold uppercase text-gold">
                  {course.level}
                </span>
                <h1 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">{course.title}</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground text-sm sm:text-base">{course.shortDescription || course.description}</p>

                <div className="mt-6 flex flex-wrap items-center gap-6 text-[13px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gold" />
                    {Math.round(course.totalDuration / 60)}h {course.totalDuration % 60}m
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-gold" />
                    {course.totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-gold" />
                    Certificate included
                  </span>
                </div>
              </div>

              <Card className="w-full lg:w-80 shadow-sm border-gold/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Progress</p>
                    <p className="mt-1 text-3xl font-black text-foreground">{Math.round(progress)}%</p>
                    <Progress value={progress} className="mt-3 h-2 bg-muted" />
                    <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                      {enrollment?.completedLessons || 0} of {course.totalLessons} lessons completed
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
            {/* Lesson List Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/50 py-4 px-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Course Syllabus</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {course.modules?.map((module: any, mIdx: number) => (
                      <div key={module.id} className="bg-background">
                         <div className="px-5 py-2.5 bg-muted/20 border-y border-border/50 text-[11px] font-black uppercase text-muted-foreground/70">
                            Module {mIdx + 1}: {module.title}
                         </div>
                         {module.lessons?.map((lesson: any) => {
                            const isActive = activeLesson?.id === lesson.id
                            const canAccess = canAccessLesson(lesson)
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => canAccess && setActiveLesson(lesson)}
                                disabled={!canAccess}
                                className={`flex w-full items-center gap-3 p-4 text-left transition-colors border-l-2 ${
                                  isActive
                                    ? "bg-gold/5 border-l-gold text-gold"
                                    : "border-l-transparent hover:bg-muted/30"
                                } ${!canAccess ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
                              >
                                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                                  lesson.isCompleted 
                                    ? "bg-success text-white" 
                                    : isActive ? "bg-gold text-navy" : "bg-muted text-muted-foreground"
                                }`}>
                                  {lesson.isCompleted ? <Check className="h-3.5 w-3.5" /> : !canAccess ? <Lock className="h-3.5 w-3.5" /> : <PlayCircle className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`truncate text-xs font-bold ${isActive ? "text-gold" : "text-foreground"}`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-medium">{lesson.duration}m duration</p>
                                </div>
                                {lesson.isFree && !isEnrolled && (
                                  <span className="rounded bg-success/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-success">
                                    Free
                                  </span>
                                )}
                              </button>
                            )
                         })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              {activeLesson ? (
                <div className="space-y-6">
                  <Card className="shadow-md border-border overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-border bg-background">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <PlayCircle className="h-5 w-5 text-gold" />
                            {activeLesson.title}
                          </CardTitle>
                          {activeLesson.isCompleted && (
                            <div className="flex items-center gap-1.5 text-success font-bold text-xs uppercase">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                            </div>
                          )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {canAccessLesson(activeLesson) ? (
                        <div className="bg-navy aspect-video relative group">
                          {activeLesson.videoUrl ? (
                            <iframe
                              src={toEmbedUrl(activeLesson.videoUrl)}
                              className="w-full h-full border-0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white p-8 space-y-4">
                                <Video className="h-16 w-16 text-gold/30" />
                                <div className="text-center">
                                    <h3 className="text-lg font-bold">Text-based Lesson</h3>
                                    <p className="text-white/60 text-sm mt-1">Read the material below to complete this module.</p>
                                </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex flex-col items-center justify-center p-8 text-center">
                          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                            <Lock className="h-8 w-8 text-gold" />
                          </div>
                          <h3 className="text-xl font-bold">Premium Content</h3>
                          <p className="mt-2 text-muted-foreground text-sm max-w-xs mx-auto">
                            Enrolling gives you full access to all lessons, quizzes and your certificate.
                          </p>
                          <Button asChild className="mt-6 bg-gold text-navy hover:bg-gold/90 font-bold px-8">
                            <Link href={`/courses/${course.slug || course.id}`}>
                              Enroll in Course
                            </Link>
                          </Button>
                        </div>
                      )}

                      {/* Content Description */}
                      <div className="p-8 border-t border-border bg-background">
                         <h4 className="text-sm font-black uppercase tracking-tight text-foreground mb-3">Lesson Description</h4>
                         <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                            {activeLesson.description || "No specific lesson description available."}
                         </div>

                         {/* Lesson Navigation & Checkbox */}
                         <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={activeIndex <= 0}
                                    onClick={() => setActiveLesson(allLessons[activeIndex - 1])}
                                    className="font-bold border-gold/20 text-gold hover:bg-gold/5"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={activeIndex >= allLessons.length - 1}
                                    onClick={() => setActiveLesson(allLessons[activeIndex + 1])}
                                    className="font-bold border-gold/20 text-gold hover:bg-gold/5"
                                >
                                    Next <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                </Button>
                            </div>

                            <Button
                                onClick={() => handleToggleComplete(activeLesson.id, activeLesson.isCompleted)}
                                disabled={isToggling || !isEnrolled}
                                className={`min-w-44 font-bold ${
                                    activeLesson.isCompleted 
                                    ? "bg-success/20 text-success hover:bg-success/30 border border-success/30" 
                                    : "bg-gold text-navy hover:bg-gold/90"
                                }`}
                            >
                                {isToggling ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : activeLesson.isCompleted ? (
                                    <><CheckCircle className="mr-2 h-4 w-4" /> Lesson Completed</>
                                ) : (
                                    "Mark as Complete"
                                )}
                            </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="aspect-video flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2 border-border">
                   <PlayCircle className="h-16 w-16 text-muted-foreground/20 mb-4" />
                   <h3 className="text-lg font-bold text-muted-foreground">Select a lesson to begin</h3>
                   <p className="text-sm text-muted-foreground/60">Choose any lesson from the syllabus on the left.</p>
                </Card>
              )}
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
  return <CourseContent courseId={id} />
}
