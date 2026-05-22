"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Award,
} from "lucide-react"

export default function MyCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/lms/enrollments")
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        }
      } catch (err) {
        console.error("Failed to load user course enrollments:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEnrollments()
  }, [])

  const activeCourses = courses.filter((c) => !c.isCompleted)
  const completedCourses = courses.filter((c) => c.isCompleted)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Track your learning progress</p>
        </div>
        <Button asChild className="bg-gold text-navy hover:bg-gold/90">
          <Link href="/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse bg-white/5 border-white/10 h-36" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="active" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
              In Progress ({activeCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeCourses.length === 0 ? (
              <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">No Courses Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Start your investment learning journey by enrolling in expert-led courses.
                </p>
                <Button asChild className="mt-6 bg-gold text-navy hover:bg-gold/90">
                  <Link href="/courses">
                    Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeCourses.map((enrollment: any) => (
                <Card key={enrollment.id} className="overflow-hidden hover:border-gold/50 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold shrink-0">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{enrollment.course?.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {enrollment.course?.expert?.user?.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                        <Button asChild size="sm" className="h-7 bg-gold text-navy hover:bg-gold/90">
                          <Link href={`/courses/${enrollment.courseId}/learn`}>
                            Continue <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedCourses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">No Completed Courses</h3>
                <p className="text-muted-foreground mt-2">Complete a course to earn your certificate.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedCourses.map((enrollment: any) => (
                <Card key={enrollment.id} className="overflow-hidden border-success/20">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success shrink-0">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{enrollment.course?.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                        <Badge className="mt-2 bg-success/10 text-success text-xs">Certificate Earned</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}
