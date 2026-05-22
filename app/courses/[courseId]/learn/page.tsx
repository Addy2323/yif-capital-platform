"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  FileText,
  Lock,
  ChevronRight,
  ChevronLeft,
  Award,
  Video,
  ExternalLink,
  BookOpen,
  ArrowLeft,
} from "lucide-react"

function toEmbedUrl(url: string): string {
  const ytWatch = url.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`
  const ytShort = url.match(/youtu\.be\/([\w-]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

export default function CourseLearnPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Fetch course detail with full enrolled content
  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/lms/courses/${courseSlug}`)
        const data = await res.json()
        if (res.ok && !data.error) {
          if (!data.isEnrolled) {
            toast.error("You must be enrolled to view this course content.")
            router.push(`/courses/${data.slug || courseSlug}`)
            return
          }
          setCourse(data)
          
          // Select first lesson of first module as default active
          const firstModule = data.modules?.[0]
          const firstLesson = firstModule?.lessons?.[0]
          if (firstLesson) {
            setActiveLesson(firstLesson)
          }
        } else {
          toast.error("Course not found or unauthorized")
        }
      } catch (err) {
        console.error("Failed to load course for learning:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCourse()
  }, [courseSlug, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <Button asChild className="mt-4 bg-gold text-navy hover:bg-gold/90">
            <Link href="/dashboard/my-courses">Return to Dashboard</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  // Flatten lessons list for simpler next/prev navigation
  const allLessons = course.modules?.flatMap((m: any) => m.lessons) || []
  const activeIndex = allLessons.findIndex((l: any) => l.id === activeLesson?.id)

  const handleToggleComplete = async (lessonId: string, currentStatus: boolean) => {
    setIsToggling(true)
    try {
      const res = await fetch(`/api/lms/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Update local status in modules/lessons list
        const updatedModules = course.modules.map((m: any) => ({
          ...m,
          lessons: m.lessons.map((l: any) => 
            l.id === lessonId ? { ...l, isCompleted: !currentStatus } : l
          )
        }))

        const newProgress = data.enrollment.progress
        const wasJustCompleted = !currentStatus && newProgress >= 100

        setCourse({
          ...course,
          modules: updatedModules,
          enrollment: data.enrollment,
        })

        // Also update the active lesson status locally
        if (activeLesson?.id === lessonId) {
          setActiveLesson({ ...activeLesson, isCompleted: !currentStatus })
        }

        if (wasJustCompleted) {
          setShowCelebration(true)
        } else {
          toast.success(!currentStatus ? "Lesson marked completed!" : "Lesson marked incomplete.")
        }
      }
    } catch (err) {
      toast.error("Failed to update lesson completion status.")
    } finally {
      setIsToggling(false)
    }
  }

  const navigateLesson = (direction: "next" | "prev") => {
    const targetIdx = direction === "next" ? activeIndex + 1 : activeIndex - 1
    if (targetIdx >= 0 && targetIdx < allLessons.length) {
      setActiveLesson(allLessons[targetIdx])
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Header />

      {/* Celebration Modal Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <Card className="max-w-md w-full border border-gold/40 bg-gradient-to-b from-navy to-slate-900 text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Confetti light accents */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <CardContent className="p-8 space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center animate-bounce">
                <Award className="h-10 w-10 text-gold" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-gold tracking-tight">Hongera Sana!</h2>
                <h3 className="text-lg font-bold text-white">Course Completed!</h3>
                <p className="text-white/60 text-sm max-w-xs mx-auto">
                  You have successfully completed 100% of <span className="text-white font-medium">{course.title}</span>. Your completion certificate has been generated.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => router.push("/dashboard/certificates")}
                  className="bg-gold text-navy hover:bg-gold/90 h-11 font-semibold"
                >
                  <Award className="mr-2 h-4 w-4" /> View My Certificate
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCelebration(false)}
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  Close & Keep Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sub-Header / Back Control */}
      <div className="border-b border-white/5 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <Link href={`/courses/${course.slug || course.id}`}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Exit
              </Link>
            </Button>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <h1 className="hidden sm:block text-sm font-semibold truncate max-w-md text-white/95">
              {course.title}
            </h1>
          </div>
          
          {course.enrollment && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-white/60 hidden md:inline">Course Progress:</span>
              <div className="w-28 sm:w-40 space-y-1">
                <div className="flex justify-between font-mono font-medium text-gold">
                  <span>{course.enrollment.completedLessons}/{course.enrollment.totalLessons} Lessons</span>
                  <span>{Math.round(course.enrollment.progress)}%</span>
                </div>
                <Progress value={course.enrollment.progress} className="h-1.5 bg-slate-800" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 gap-6">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-6 overflow-y-auto">
          {activeLesson ? (
            <div className="space-y-6">
              {/* Media Player Box */}
              <div className="aspect-video w-full rounded-2xl border border-white/10 bg-slate-900 flex flex-col justify-between overflow-hidden relative group">
                {activeLesson.videoUrl ? (
                  activeLesson.videoUrl.startsWith("/uploads/") ? (
                    <video
                      src={activeLesson.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                  <iframe
                    src={toEmbedUrl(activeLesson.videoUrl)}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                  )
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
                    <Video className="h-16 w-16 text-gold/30 mb-3" />
                    <h3 className="text-lg font-bold">PDF Lesson Material</h3>
                    <p className="text-white/60 text-sm max-w-xs mt-1">
                      This lesson consists of reading materials and templates.
                    </p>
                    {activeLesson.pdfUrl && (
                      <Button asChild size="sm" className="mt-4 bg-gold text-navy hover:bg-gold/90">
                        <a href={activeLesson.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" /> Open Resource Document <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Complete Checkbox */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">{activeLesson.title}</h2>
                  <p className="text-white/60 text-xs mt-1 flex items-center gap-1.5">
                    <PlayCircle className="h-3.5 w-3.5 text-gold" /> {activeLesson.duration} minutes content
                  </p>
                </div>
                
                <Button
                  onClick={() => handleToggleComplete(activeLesson.id, !!activeLesson.isCompleted)}
                  disabled={isToggling}
                  className={`min-w-44 font-semibold ${
                    activeLesson.isCompleted 
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                      : "bg-gold text-navy hover:bg-gold/90"
                  }`}
                >
                  {activeLesson.isCompleted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 fill-emerald-400 text-slate-900" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </>
                  )}
                </Button>
              </div>

              {/* Lesson Description */}
              {activeLesson.description && (
                <Card className="bg-slate-900/30 border-white/5">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-white text-base mb-3">Lesson Description</h3>
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                      {activeLesson.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <PlayCircle className="h-16 w-16 text-white/10 mb-4" />
              <h3 className="text-lg font-semibold text-white/60">No Lesson Selected</h3>
              <p className="text-white/40 max-w-sm mt-1 text-sm">
                Select a lesson from the syllabus sidebar to begin learning.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Button
              variant="outline"
              disabled={activeIndex <= 0}
              onClick={() => navigateLesson("prev")}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              disabled={activeIndex >= allLessons.length - 1}
              onClick={() => navigateLesson("next")}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Syllabus / Content Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <Card className="bg-slate-900/60 border-white/10 sticky top-20">
            <CardContent className="p-5">
              <h3 className="font-bold text-sm text-gold tracking-wider uppercase mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Course Syllabus
              </h3>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {course.modules?.map((module: any, mIdx: number) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-white/80 flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/5 text-[10px] text-white/50 font-semibold border border-white/10">
                        {mIdx + 1}
                      </span>
                      <span className="leading-tight">{module.title}</span>
                    </h4>

                    <div className="space-y-1 pl-7">
                      {module.lessons?.map((lesson: any) => {
                        const isActive = lesson.id === activeLesson?.id
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all ${
                              isActive
                                ? "bg-gold/10 border border-gold/20 text-gold"
                                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/10 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${isActive ? "font-semibold" : ""}`}>{lesson.title}</p>
                              <span className="text-[10px] text-white/40 block mt-0.5">{lesson.duration}m duration</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      <Footer />
    </div>
  )
}
